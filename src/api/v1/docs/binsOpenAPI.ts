import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { createApiResponses } from "../../../api-docs/responseBuilders";
import { z } from "../../../api-docs/zod-extensions";

/**
 * Documentación OpenAPI para el módulo de bins (contenedores)
 *
 * NOTA: Todos los endpoints están protegidos con rate limiting:
 * - 100 requests por minuto por IP
 * - Validación estática de binType (sin consultas a BD)
 * - Respuestas consistentes con códigos HTTP estándar
 */

// Schema para Bin
export const BinSchema = z
	.object({
		tipo_dato: z.string().openapi({ example: "PUNTO LIMPIO" }),
		lote: z.string().openapi({ example: "1" }),
		cod_dist: z.string().openapi({ example: "1" }),
		distrito: z.string().openapi({ example: "CENTRO" }),
		cod_barrio: z.string().openapi({ example: "1" }),
		barrio: z.string().openapi({ example: "PALACIO" }),
		direccion_completa: z.string().openapi({ example: "CALLE MAYOR 1" }),
		via_clase: z.string().openapi({ example: "CALLE" }),
		via_par: z.string().openapi({ example: "IMPAR" }),
		via_nombre: z.string().openapi({ example: "MAYOR" }),
		tipo_numero: z.string().openapi({ example: "NÚMERO" }),
		numero: z.string().openapi({ example: "1" }),
		latitud: z.number().openapi({ example: 40.4168 }),
		longitud: z.number().openapi({ example: -3.7038 }),
		direccion_completa_ampliada: z.string().openapi({ example: "CALLE MAYOR 1, 28013 MADRID" }),
		mas_informacion: z.string().openapi({ example: "Contenedor textil" }),
		created_at: z.string().optional(),
		updated_at: z.string().optional(),
	})
	.openapi("Bin");

// Schema para conteo
export const CountSchema = z
	.object({
		count: z.number().openapi({ example: 1254 }),
		statusCode: z.number().openapi({ example: 200 }),
	})
	.openapi("Count");

// Schema para parámetros de nearby
export const NearbyQuerySchema = z
	.object({
		lat: z.string().openapi({
			example: "40.4168",
			description: "Latitud de la ubicación de referencia",
		}),
		lng: z.string().openapi({
			example: "-3.7038",
			description: "Longitud de la ubicación de referencia",
		}),
		radius: z.string().optional().openapi({
			example: "5",
			description: "Radio de búsqueda en kilómetros (opcional). Rango: 0.05–5. Default: 5",
		}),
		limit: z.string().optional().openapi({
			example: "100",
			description: "Máximo de items a devolver (opcional). Rango: 1–5000. Default: 1000",
		}),
	})
	.openapi("NearbyQuery");

// Schema para parámetros de paginación
export const PaginationQuerySchema = z
	.object({
		page: z.string().optional().openapi({ example: "1", description: "Número de página (default 1)" }),
		limit: z.string().optional().openapi({
			example: "100",
			description: "Tamaño de página (1–5000, default 1000)",
		}),
	})
	.openapi("PaginationQuery");

// Schema para conteos jerárquicos
export const HierarchyCountSchema = z
	.object({
		name: z.string().openapi({ example: "CENTRO", description: "Nombre del distrito" }),
		count: z.number().openapi({
			example: 150,
			description: "Total de contenedores en el distrito",
		}),
		neighborhoods: z.array(
			z.object({
				name: z.string().openapi({ example: "PALACIO", description: "Nombre del barrio" }),
				count: z.number().openapi({ example: 25, description: "Contenedores en el barrio" }),
			}),
		),
	})
	.openapi("HierarchyCount");

export const binOpenAPI = (registry: OpenAPIRegistry) => {
	// 1. GET /api/v1/bins/{binType} - Obtener todos los contenedores
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}",
		summary: "Obtener todos los contenedores",
		description: "Obtener todos los contenedores de un tipo específico con paginación opcional",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
			query: PaginationQuerySchema,
		},
		responses: createApiResponses([
			{
				schema: z.object({
					data: z.array(BinSchema),
					statusCode: z.number(),
				}),
				description: "Lista de contenedores obtenida exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					data: z.array(z.any()).openapi({ example: [] }),
					statusCode: z.number().openapi({ example: 204 }),
				}),
				description: "No se encontraron contenedores",
				statusCode: StatusCodes.NO_CONTENT,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Tipo de contenedor inválido" }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Tipo de contenedor inválido",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({
						example: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
					}),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 2. GET /api/v1/bins/{binType}/count - Obtener conteo
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/count",
		summary: "Obtener conteo de contenedores",
		description: "Obtener el número total de contenedores de un tipo específico",
		tags: ["Statistics"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
		},
		responses: createApiResponses([
			{
				schema: CountSchema,
				description: "Conteo obtenido exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					count: z.number().openapi({ example: 0 }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Tipo de contenedor inválido",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					count: z.number().openapi({ example: 0 }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					count: z.number().openapi({ example: 0 }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 3. GET /api/v1/bins/{binType}/location/{locationType}/{locationValue} - Obtener por ubicación
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/location/{locationType}/{locationValue}",
		summary: "Obtener contenedores por ubicación",
		description: "Obtener contenedores filtrados por distrito o barrio con paginación",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
				locationType: z.enum(["district", "neighborhood"]).openapi({
					example: "district",
					description: "Tipo de ubicación: 'district' para distrito o 'neighborhood' para barrio",
				}),
				locationValue: z.string().openapi({
					example: "CENTRO",
					description: "Nombre del distrito (ej: ARGANZUELA, CENTRO) o barrio (ej: PALACIO, CHUECA)",
				}),
			}),
			query: PaginationQuerySchema,
		},
		responses: createApiResponses([
			{
				schema: z.object({
					data: z.array(BinSchema),
					statusCode: z.number(),
				}),
				description: "Contenedores de la ubicación obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					data: z.array(z.any()),
					statusCode: z.number(),
				}),
				description: "No se encontraron contenedores en la ubicación especificada",
				statusCode: StatusCodes.NO_CONTENT,
			},
			{
				schema: z.object({}),
				description: "Parámetros inválidos (binType, locationType o locationValue)",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 4. GET /api/v1/bins/{binType}/nearby - Obtener contenedores cercanos
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/nearby",
		summary: "Obtener contenedores cercanos",
		description:
			"Obtener contenedores dentro de un radio específico ordenados por distancia. Los parámetros 'lat' y 'lng' son requeridos.",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
			query: NearbyQuerySchema,
		},
		responses: createApiResponses([
			{
				schema: z.object({
					data: z.array(BinSchema),
					statusCode: z.number(),
				}),
				description: "Contenedores cercanos obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					data: z.array(z.any()),
					statusCode: z.number(),
				}),
				description: "No se encontraron contenedores cercanos",
				statusCode: StatusCodes.NO_CONTENT,
			},
			{
				schema: z.object({}),
				description: "Parámetros requeridos faltantes o inválidos",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 5. GET /api/v1/bins/{binType}/counts - Conteos jerárquicos
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/counts",
		summary: "Conteos jerárquicos",
		description: "Obtener conteos jerárquicos por distrito y barrio",
		tags: ["Statistics"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
		},
		responses: createApiResponses([
			{
				schema: z.object({
					data: z.array(HierarchyCountSchema),
					statusCode: z.number(),
				}),
				description: "Conteos jerárquicos obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					data: z.array(z.any()),
					statusCode: z.number(),
				}),
				description: "No se encontraron datos para generar conteos jerárquicos",
				statusCode: StatusCodes.NO_CONTENT,
			},
			{
				schema: z.object({}),
				description: "Tipo de contenedor inválido",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 6. DELETE /api/v1/bins/{binType} - Limpiar contenedores
	registry.registerPath({
		method: "delete",
		path: "/api/v1/bins/{binType}",
		summary: "Limpiar contenedores",
		description: "Eliminar todos los contenedores de un tipo específico de la base de datos",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
		},
		responses: createApiResponses([
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({ example: "Contenedores eliminados exitosamente" }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Contenedores eliminados exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Tipo de contenedor inválido" }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Tipo de contenedor inválido",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 7. POST /api/v1/bins/{binType}/load-data - Cargar datos (temporal)
	registry.registerPath({
		method: "post",
		path: "/api/v1/bins/{binType}/load-data",
		summary: "Cargar datos desde CSV",
		description: "Endpoint temporal para cargar datos de contenedores desde archivos CSV",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							csvData: z.string().openapi({
								example: "TIPO_DATO;LOTE;COD_DIST;DISTRITO;...",
								description: "Datos CSV en formato string",
							}),
						}),
					},
				},
			},
		},
		responses: createApiResponses([
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					responseObject: z.object({
						insertedCount: z.number().openapi({ example: 1254 }),
						errors: z.array(z.any()).openapi({ example: [] }),
					}),
					message: z.string().openapi({ example: "Datos cargados exitosamente" }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Datos cargados exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Datos CSV requeridos en el body" }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Error en la carga de datos",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 8. GET /api/v1/bins/{binType}/debug - Debug endpoint (temporal)
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/debug",
		summary: "Endpoint de debug",
		description: "Endpoint temporal para debugging y desarrollo",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum(["clothing_bins", "oil_bins", "glass_bins", "paper_bins", "plastic_bins", "organic_bins", "other_bins"])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
			}),
		},
		responses: createApiResponses([
			{
				schema: z.object({
					debug: z.any(),
					statusCode: z.number(),
				}),
				description: "Información de debug obtenida exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({}),
				description: "Error en el endpoint de debug",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});
};
