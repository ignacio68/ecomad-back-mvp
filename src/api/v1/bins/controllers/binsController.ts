import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ERROR_MESSAGES } from "@/api/v1/bins/constants/errorMessages";
import { SUCCESS_MESSAGES } from "@/api/v1/bins/constants/successMessages";
import {
	getAllBins,
	getBinsByLocation,
	getBinsCount,
	getBinsCountsHierarchy,
	getBinsNearby,
} from "@/api/v1/bins/services/binsService";
import type { LocationParams, NearbyParams } from "@/api/v1/bins/types/binTypes";
import { mapErrorToStatusCode } from "@/api/v1/bins/utils/errorMapper";
import { ServiceResponse } from "@/shared/models/serviceResponse";

// Extender el tipo Request para incluir binType
interface ExtendedRequest extends Request {
	binType?: string;
}

/**
 * Controlador HTTP para contenedores
 * Solo maneja HTTP: status codes, messages, validación de parámetros
 * Delega lógica de negocio al servicio
 */

// Helper para obtener binType de la request (ya validado por middleware)
const getBinTypeFromRequest = (req: ExtendedRequest): string => {
	return req.binType || req.params.binType;
};

// Helper para manejar errores y devolver respuesta HTTP apropiada
const handleError = (
	error: unknown,
	res: Response,
	defaultMessage: string = ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR,
): void => {
	console.error("Error en controlador:", error);

	if (error instanceof Error) {
		const { statusCode, message } = mapErrorToStatusCode(error);
		const response = ServiceResponse.failure(message, null, statusCode);
		res.status(statusCode).json(response);
	} else {
		const response = ServiceResponse.failure(defaultMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
	}
};

/**
 * GET /api/v1/:binType
 * Obtiene todos los contenedores de un tipo específico
 */
export const getBins: RequestHandler = async (req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);
		const bins = await getAllBins(binType);

		// Siempre devolver 200 OK para respuestas exitosas
		const statusCode = StatusCodes.OK;
		const message = bins.length === 0 ? SUCCESS_MESSAGES.NO_BINS_FOUND : SUCCESS_MESSAGES.BINS_RETRIEVED;

		const response = ServiceResponse.success(message, bins);
		res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120").status(statusCode).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATABASE_QUERY_FAILED);
	}
};

/**
 * GET /api/v1/:binType/count
 * Cuenta el total de contenedores de un tipo específico
 */
export const getBinsCountController: RequestHandler = async (req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);
		const count = await getBinsCount(binType);

		const response = ServiceResponse.success(SUCCESS_MESSAGES.COUNT_RETRIEVED, count);
		res
			.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
			.status(StatusCodes.OK)
			.json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATABASE_QUERY_FAILED);
	}
};

/**
 * GET /api/v1/:binType/location/:locationType/:locationValue
 * Obtiene contenedores por ubicación (distrito o barrio)
 */
export const getBinsByLocationController: RequestHandler = async (
	req: ExtendedRequest,
	res: Response,
): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);
		const { locationType, locationValue } = req.params;
		const page = Number.parseInt(req.query.page as string) || 1;
		const limit = Number.parseInt(req.query.limit as string) || 100;

		// Validar parámetros de ubicación
		if (!locationType || !locationValue) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.INVALID_LOCATION_PARAMS, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		if (!["district", "neighborhood"].includes(locationType)) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.INVALID_LOCATION_PARAMS, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		const params: LocationParams = {
			locationType: locationType as "district" | "neighborhood",
			locationValue,
			page,
			limit,
		};

		const bins = await getBinsByLocation(binType, params);

		// Siempre devolver 200 OK para respuestas exitosas
		const statusCode = StatusCodes.OK;

		const message = bins.length === 0 ? SUCCESS_MESSAGES.NO_LOCATION_DATA : SUCCESS_MESSAGES.LOCATION_BINS_RETRIEVED;

		const response = ServiceResponse.success(message, bins);
		res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600").status(statusCode).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATABASE_QUERY_FAILED);
	}
};

/**
 * GET /api/v1/:binType/nearby
 * Obtiene contenedores cercanos a una coordenada
 */
export const getBinsNearbyController: RequestHandler = async (req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);
		const { lat, lng, radius, limit } = req.query;

		// Validar parámetros requeridos
		if (!lat || !lng) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.MISSING_LAT_LNG, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		// Validar que los parámetros sean números válidos
		const latNum = Number.parseFloat(lat as string);
		const lngNum = Number.parseFloat(lng as string);
		const radiusNum = Number.parseFloat(radius as string) || 5;
		const limitNum = Number.parseInt(limit as string) || 100;

		if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(radiusNum)) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.INVALID_COORDINATES_DETAIL, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		const params: NearbyParams = {
			lat: latNum,
			lng: lngNum,
			radius: radiusNum,
			limit: limitNum,
		};

		const bins = await getBinsNearby(binType, params);

		// Siempre devolver 200 OK para respuestas exitosas
		const statusCode = StatusCodes.OK;
		const message = bins.length === 0 ? SUCCESS_MESSAGES.NO_NEARBY_DATA : SUCCESS_MESSAGES.NEARBY_BINS_RETRIEVED;

		const response = ServiceResponse.success(message, bins);
		res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60").status(statusCode).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATABASE_QUERY_FAILED);
	}
};

/**
 * GET /api/v1/:binType/counts
 * Obtiene conteos jerárquicos por distrito y barrio
 */
export const getBinsCountsHierarchyController: RequestHandler = async (
	req: ExtendedRequest,
	res: Response,
): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);
		const hierarchy = await getBinsCountsHierarchy(binType);

		// Siempre devolver 200 OK para respuestas exitosas
		const statusCode = StatusCodes.OK;
		const message = hierarchy.length === 0 ? SUCCESS_MESSAGES.NO_HIERARCHY_DATA : SUCCESS_MESSAGES.HIERARCHY_RETRIEVED;

		const response = ServiceResponse.success(message, hierarchy);
		res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600").status(statusCode).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATABASE_QUERY_FAILED);
	}
};

/**
 * POST /api/v1/:binType/load-data
 * @deprecated Este endpoint está obsoleto. Usa el script `pnpm run import:bins` en su lugar.
 * Carga datos de contenedores desde CSV (solo para desarrollo/testing)
 */
export const loadBinsDataController: RequestHandler = async (_req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		// Este endpoint está obsoleto - devolver mensaje informativo
		const response = ServiceResponse.failure(
			"Este endpoint está obsoleto. Usa el script 'pnpm run import:bins' para importar datos.",
			{
				deprecated: true,
				alternative: "Use el script de importación: pnpm run import:bins",
				documentation: "Ver README.md sección 'Scripts de Utilidad'",
			},
			StatusCodes.GONE,
		);
		res.status(StatusCodes.GONE).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.DATA_INSERTION_FAILED);
	}
};

/**
 * GET /api/v1/:binType/debug
 * Endpoint de debug para desarrollo
 */
export const debugBinsController: RequestHandler = async (req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);

		console.log("🔍 DEBUG: Iniciando debug controller");
		console.log("🔍 DEBUG: req.params =", req.params);
		console.log("🔍 DEBUG: req.originalUrl =", req.originalUrl);
		console.log("🔍 DEBUG: binType extraído =", binType);

		const debugInfo = {
			binType,
			timestamp: new Date().toISOString(),
			url: req.originalUrl,
			method: req.method,
			headers: {
				"user-agent": req.get("User-Agent"),
				"content-type": req.get("Content-Type"),
			},
		};

		const response = ServiceResponse.success(SUCCESS_MESSAGES.DEBUG_SUCCESS, debugInfo);
		res.status(StatusCodes.OK).json(response);
	} catch (error) {
		handleError(error, res, ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR);
	}
};
