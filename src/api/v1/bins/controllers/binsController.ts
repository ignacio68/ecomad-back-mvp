import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateCSV } from "@/api/common/utils/validateCSV";
import { ServiceResponse } from "@/shared/models/serviceResponse";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { SUCCESS_MESSAGES } from "../constants/successMessages";
import { csvBinSchema } from "../schemas/binsSchema";
import {
	clearBins,
	getAllBins,
	getBinsByLocation,
	getBinsCount,
	getBinsCountsHierarchy,
	getBinsNearby,
	insertBins,
} from "../services/binsService";
import type { LocationParams, NearbyParams } from "../types/binTypes";
import { mapErrorToStatusCode } from "../utils/errorMapper";

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
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 100;

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
		const latNum = parseFloat(lat as string);
		const lngNum = parseFloat(lng as string);
		const radiusNum = parseFloat(radius as string) || 5;
		const limitNum = parseInt(limit as string) || 100;

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
 * Carga datos de contenedores desde CSV
 */
export const loadBinsDataController: RequestHandler = async (req: ExtendedRequest, res: Response): Promise<void> => {
	try {
		const binType = getBinTypeFromRequest(req);

		// Validar que se proporcione csvData
		if (!req.body?.csvData) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.MISSING_REQUIRED_FIELD, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		console.log("🔄 Usando CSV del body");
		const csvText = req.body.csvData;
		console.log("✅ CSV descargado, tamaño:", csvText.length, "caracteres");

		console.log("🔄 Validando CSV...");
		const { valid, invalid } = await validateCSV(csvText, csvBinSchema, {
			delimiter: ";",
			skipEmptyLines: true,
		});

		console.log("✅ Valid records:", valid.length);
		console.log("❌ Invalid records:", invalid.length);

		if (valid.length === 0) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.INVALID_CSV_DATA, null);
			res.status(StatusCodes.BAD_REQUEST).json(response);
			return;
		}

		// Transformar datos CSV a formato de base de datos
		const bins = valid.map((bin) => ({
			tipo_dato: bin.TIPO_DATO,
			lote: String(bin.LOTE),
			cod_dist: String(bin.COD_DIST),
			distrito: bin.DISTRITO,
			cod_barrio: String(bin.COD_BARRIO),
			barrio: bin.BARRIO,
			direccion_completa: bin.DIRECCION_COMPLETA,
			via_clase: bin.VIA_CLASE,
			via_par: bin.VIA_PAR,
			via_nombre: bin.VIA_NOMBRE,
			tipo_numero: bin.TIPO_NUMERO,
			numero: bin.NUMERO,
			latitud: typeof bin.LATITUD === "string" ? parseFloat(bin.LATITUD) : bin.LATITUD,
			longitud: typeof bin.LONGITUD === "string" ? parseFloat(bin.LONGITUD) : bin.LONGITUD,
			direccion_completa_ampliada: bin["DIRECCIÓN COMPLETA AMPLIADA"],
			mas_informacion: bin["MÁS INFORMACIÓN"],
			created_at: new Date().toISOString(),
		}));

		console.log("🔄 Limpiando datos existentes...");
		await clearBins(binType);

		console.log("🔄 Insertando nuevos datos...");
		const result = await insertBins(binType, bins);

		const response = ServiceResponse.success(SUCCESS_MESSAGES.DATA_LOADED, {
			insertedCount: result.inserted,
			errors: result.errors,
		});
		res.status(StatusCodes.OK).json(response);
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
