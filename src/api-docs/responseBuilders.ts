import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { ServiceResponseSchema } from "../shared/models/serviceResponse";
import { z } from "./zod-extensions";

/**
 * Crea una respuesta OpenAPI simple
 * @param schema - Schema Zod para la respuesta
 * @param description - Descripción de la respuesta
 * @param statusCode - Código de estado HTTP (por defecto 200)
 * @returns Configuración de respuesta OpenAPI
 */
export function createApiResponse(
	schema: z.ZodTypeAny,
	description: string,
	statusCode = StatusCodes.OK,
): { [key: string]: ResponseConfig } {
	return {
		[statusCode]: {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema),
				},
			},
		},
	};
}

/**
 * Configuración para una respuesta API
 */
export type ApiResponseConfig = {
	schema: z.ZodTypeAny;
	description: string;
	statusCode: StatusCodes;
};

/**
 * Crea múltiples respuestas OpenAPI para un endpoint
 * @param configs - Array de configuraciones de respuesta
 * @returns Objeto con todas las respuestas configuradas
 */
export function createApiResponses(configs: ApiResponseConfig[]): {
	[key: string]: ResponseConfig;
} {
	const responses: { [key: string]: ResponseConfig } = {};

	configs.forEach(({ schema, description, statusCode }) => {
		responses[statusCode] = {
			description,
			content: {
				"application/json": {
					schema: ServiceResponseSchema(schema),
				},
			},
		};
	});

	return responses;
}

/**
 * Crea respuestas estándar para endpoints de listado con paginación
 * @param dataSchema - Schema para los datos de la lista
 * @param entityName - Nombre de la entidad (ej: "contenedores", "usuarios")
 * @returns Configuraciones de respuesta estándar
 */
export function createListResponses(dataSchema: z.ZodTypeAny, entityName: string): ApiResponseConfig[] {
	return [
		{
			schema: dataSchema,
			description: `${entityName} obtenidos exitosamente`,
			statusCode: StatusCodes.OK,
		},
		{
			schema: z.object({}),
			description: `No se encontraron ${entityName}`,
			statusCode: StatusCodes.NO_CONTENT,
		},
		{
			schema: z.object({}),
			description: "Error interno del servidor",
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		},
	];
}

/**
 * Crea respuestas estándar para endpoints de creación/inserción
 * @param dataSchema - Schema para los datos creados
 * @param entityName - Nombre de la entidad
 * @returns Configuraciones de respuesta estándar
 */
export function createCreateResponses(dataSchema: z.ZodTypeAny, entityName: string): ApiResponseConfig[] {
	return [
		{
			schema: dataSchema,
			description: `${entityName} creados exitosamente`,
			statusCode: StatusCodes.OK,
		},
		{
			schema: z.object({}),
			description: "Datos de entrada inválidos",
			statusCode: StatusCodes.BAD_REQUEST,
		},
		{
			schema: z.object({}),
			description: "Error interno del servidor",
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		},
	];
}

/**
 * Crea respuestas estándar para endpoints de eliminación
 * @param entityName - Nombre de la entidad
 * @returns Configuraciones de respuesta estándar
 */
export function createDeleteResponses(entityName: string): ApiResponseConfig[] {
	return [
		{
			schema: z.object({}),
			description: `${entityName} eliminados exitosamente`,
			statusCode: StatusCodes.OK,
		},
		{
			schema: z.object({}),
			description: "Error interno del servidor",
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		},
	];
}
