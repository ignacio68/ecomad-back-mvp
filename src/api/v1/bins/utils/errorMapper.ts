import { StatusCodes } from "http-status-codes";
import { ERROR_MESSAGES } from "@/api/v1/bins/constants/errorMessages";

/**
 * Mapea errores a códigos de estado HTTP apropiados
 * Usa constantes exactas para evitar dependencias de texto parcial
 */
export const mapErrorToStatusCode = (error: Error): { statusCode: number; message: string } => {
	const errorMessage = error.message;

	// Errores de validación (400)
	if (
		errorMessage === ERROR_MESSAGES.INVALID_BIN_TYPE ||
		errorMessage === ERROR_MESSAGES.INVALID_PARAMETER ||
		errorMessage === ERROR_MESSAGES.INVALID_LOCATION_PARAMS ||
		errorMessage === ERROR_MESSAGES.INVALID_COORDINATES ||
		errorMessage === ERROR_MESSAGES.INVALID_CSV_DATA ||
		errorMessage === ERROR_MESSAGES.MISSING_REQUIRED_FIELD
	) {
		return {
			statusCode: StatusCodes.BAD_REQUEST,
			message: errorMessage,
		};
	}

	// Errores de datos no encontrados (404)
	if (
		errorMessage === ERROR_MESSAGES.NO_BINS_FOUND ||
		errorMessage === ERROR_MESSAGES.NO_LOCATION_DATA ||
		errorMessage === ERROR_MESSAGES.NO_NEARBY_DATA ||
		errorMessage === ERROR_MESSAGES.NO_HIERARCHY_DATA
	) {
		return {
			statusCode: StatusCodes.NOT_FOUND,
			message: errorMessage,
		};
	}

	// Errores de base de datos/sistema (500)
	if (
		errorMessage === ERROR_MESSAGES.DATABASE_CONNECTION_FAILED ||
		errorMessage === ERROR_MESSAGES.DATABASE_QUERY_FAILED ||
		errorMessage === ERROR_MESSAGES.DATA_INSERTION_FAILED ||
		errorMessage === ERROR_MESSAGES.DATA_DELETION_FAILED ||
		errorMessage === ERROR_MESSAGES.EXTERNAL_API_ERROR ||
		errorMessage === ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR
	) {
		return {
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			message: errorMessage,
		};
	}

	// Error por defecto (500)
	return {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message: ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR,
	};
};
