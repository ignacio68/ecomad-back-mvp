import type { NextFunction, Request, Response } from "express";
import { BIN_TYPES } from "@/api/v1/bins/constants/binTypes";
import { ERROR_MESSAGES } from "@/api/v1/bins/constants/errorMessages";
import type { BinType } from "@/api/v1/bins/types/binTypes";
import { ServiceResponse } from "@/shared/models/serviceResponse";

// Tipo específico para Request con binType
type RequestWithBinType = Request & { binType: string };

// Helper para extraer binType de la request
const getBinTypeFromRequest = (req: Request): string => {
	// El binType viene como parámetro de ruta: /api/v1/bins/:binType/...
	let binType = req.params.binType;

	// Si no está en params, extraerlo de la URL
	if (!binType) {
		const pathParts = req.originalUrl.split("/");
		const binsIndex = pathParts.indexOf("bins");
		if (binsIndex >= 0 && pathParts[binsIndex + 1]) {
			binType = pathParts[binsIndex + 1];
		}
	}

	return binType;
};

// Middleware para validar binType
export const validateBinType = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const binType = getBinTypeFromRequest(req);

		if (!binType) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.NO_BIN_TYPE_FOUND, null);
			res.status(400).json(response);
			return;
		}

		if (!BIN_TYPES.includes(binType as BinType)) {
			const response = ServiceResponse.failure(ERROR_MESSAGES.INVALID_BIN_TYPE, null);
			res.status(400).json(response);
			return;
		}

		// Agregar binType validado a la request para uso posterior
		(req as RequestWithBinType).binType = binType;
		next();
	} catch (error) {
		console.error("Error en validación de binType:", error);
		const response = ServiceResponse.failure(ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR, null);
		res.status(500).json(response);
	}
};
