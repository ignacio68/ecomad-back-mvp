import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { StatusCodes } from "http-status-codes";
import { createApiResponses } from "@/api-docs/responseBuilders";
import { z } from "@/api-docs/zod-extensions";

/**
 * Documentación OpenAPI para el módulo de bins (contenedores)
 *
 * NOTA: Todos los endpoints están protegidos con rate limiting:
 * - 100 requests por minuto por IP
 * - Validación estática de binType (sin consultas a BD)
 * - Respuestas consistentes con códigos HTTP estándar
 */

// Schema para Bin (estructura real de la base de datos)
export const BinSchema = z
	.object({
		id: z.number().openapi({ example: 12947, description: "ID único del contenedor" }),
		category_group_id: z.number().openapi({ example: 1, description: "ID del grupo de categoría" }),
		category_id: z.number().openapi({ example: 14, description: "ID de la categoría específica" }),
		district_code: z.string().openapi({
			example: "01",
			description: 'Código del distrito ("01"-"21")',
		}),
		neighborhood_code: z.string().nullable().openapi({
			example: "011",
			description: 'Código del barrio ("011", "012", etc.) - opcional',
		}),
		address: z.string().openapi({
			example: "CALLE DEL DESENGAÑO, 16",
			description: "Dirección completa",
		}),
		lat: z.number().openapi({ example: 40.42091, description: "Latitud (WGS84)" }),
		lng: z.number().openapi({ example: -3.70348, description: "Longitud (WGS84)" }),
		load_type: z.string().nullable().openapi({ example: null, description: "Tipo de carga - opcional" }),
		direction: z.string().nullable().openapi({
			example: null,
			description: "Dirección adicional - opcional",
		}),
		subtype: z.string().nullable().openapi({
			example: "Contenedor superficie",
			description: "Subtipo de contenedor - opcional",
		}),
		placement_type: z.string().nullable().openapi({
			example: null,
			description: "Tipo de emplazamiento - opcional",
		}),
		notes: z.string().nullable().openapi({
			example: "Además se puede depositar ropa usada en los puntos limpios fijos y móviles",
			description: "Notas adicionales - opcional",
		}),
		bus_stop: z.string().nullable().openapi({
			example: null,
			description: "Parada de bus (solo battery_bins)",
		}),
		interurban_node: z.string().nullable().openapi({
			example: null,
			description: "Nodo interurbano (solo battery_bins)",
		}),
		created_at: z.string().openapi({
			example: "2025-11-05T14:10:46.524733+00:00",
			description: "Fecha de creación (ISO 8601)",
		}),
		updated_at: z.string().openapi({
			example: "2025-11-05T14:12:16.932091+00:00",
			description: "Fecha de actualización (ISO 8601)",
		}),
	})
	.openapi("Bin");

// Schema para conteo
export const CountSchema = z
	.object({
		success: z.boolean().openapi({ example: true }),
		message: z.string().openapi({ example: "Conteo de contenedores obtenido exitosamente" }),
		data: z.object({
			count: z.number().openapi({ example: 1254 }),
		}),
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

// Schema para conteos jerárquicos (estructura plana)
export const HierarchyCountSchema = z
	.object({
		distrito: z.string().openapi({ example: "1", description: "ID del distrito (1-35)" }),
		barrio: z.string().openapi({ example: "5", description: "ID del barrio (1-218)" }),
		count: z.number().openapi({
			example: 17,
			description: "Número de contenedores en el barrio",
		}),
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
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({ example: "Contenedores obtenidos exitosamente" }),
					data: z.array(BinSchema),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Lista de contenedores obtenida exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({ example: "No se encontraron contenedores" }),
					data: z.array(z.any()).openapi({ example: [] }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "No se encontraron contenedores",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Tipo de contenedor inválido" }),
					data: z.null().openapi({ example: null }),
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
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
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
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Tipo de contenedor inválido" }),
					data: z.null().openapi({ example: null }),
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
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
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
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
					.openapi({
						example: "clothing_bins",
						description: "Tipo de contenedor",
					}),
				locationType: z.enum(["district", "neighborhood"]).openapi({
					example: "district",
					description: "Tipo de ubicación: 'district' para distrito o 'neighborhood' para barrio",
				}),
				locationValue: z.string().openapi({
					example: "1",
					description: "ID del distrito (1-35) o barrio (1-218). Ejemplo: '1' para Centro, '5' para barrio Universidad",
				}),
			}),
			query: PaginationQuerySchema,
		},
		responses: createApiResponses([
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({
						example: "Contenedores de la ubicación obtenidos exitosamente",
					}),
					data: z.array(BinSchema),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Contenedores de la ubicación obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({
						example: "No se encontraron contenedores en la ubicación especificada",
					}),
					data: z.array(z.any()).openapi({ example: [] }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "No se encontraron contenedores en la ubicación especificada",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Parámetros de ubicación inválidos" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Parámetros inválidos (binType, locationType o locationValue)",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({
						example: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
					}),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
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
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({
						example: "Contenedores cercanos obtenidos exitosamente",
					}),
					data: z.array(BinSchema),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Contenedores cercanos obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({ example: "No se encontraron contenedores cercanos" }),
					data: z.array(z.any()).openapi({ example: [] }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "No se encontraron contenedores cercanos",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({
						example: "Los parámetros 'lat' y 'lng' son requeridos",
					}),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Parámetros requeridos faltantes o inválidos",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({
						example: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
					}),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
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
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					message: z.string().openapi({ example: "Conteos jerárquicos obtenidos exitosamente" }),
					data: z.array(HierarchyCountSchema),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Conteos jerárquicos obtenidos exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: true }),
					message: z.string().openapi({
						example: "No se encontraron datos para generar conteos jerárquicos",
					}),
					data: z.array(z.any()).openapi({ example: [] }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "No se encontraron datos para generar conteos jerárquicos",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Tipo de contenedor inválido" }),
					data: z.null().openapi({ example: null }),
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
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 6. POST /api/v1/bins/{binType}/load-data - Cargar datos (temporal)
	registry.registerPath({
		method: "post",
		path: "/api/v1/bins/{binType}/load-data",
		summary: "Cargar datos desde CSV",
		description: "Endpoint temporal para cargar datos de contenedores desde archivos CSV",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					message: z.string().openapi({ example: "Datos cargados exitosamente" }),
					data: z.object({
						insertedCount: z.number().openapi({ example: 1254 }),
						errors: z.array(z.any()).openapi({ example: [] }),
					}),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Datos cargados exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Datos CSV requeridos en el body" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Error en la carga de datos",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({
						example: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
					}),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 429 }),
				}),
				description: "Demasiadas solicitudes (rate limited)",
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});

	// 7. GET /api/v1/bins/{binType}/debug - Debug endpoint (temporal)
	registry.registerPath({
		method: "get",
		path: "/api/v1/bins/{binType}/debug",
		summary: "Endpoint de debug",
		description: "Endpoint temporal para debugging y desarrollo",
		tags: ["Bins"],
		request: {
			params: z.object({
				binType: z
					.enum([
						"clothing_bins",
						"oil_bins",
						"glass_bins",
						"paper_bins",
						"plastic_bins",
						"organic_bins",
						"battery_bins",
						"other_bins",
					])
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
					message: z.string().openapi({ example: "Debug exitoso" }),
					data: z.any().openapi({ example: {} }),
					statusCode: z.number().openapi({ example: 200 }),
				}),
				description: "Información de debug obtenida exitosamente",
				statusCode: StatusCodes.OK,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error en el endpoint de debug" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 400 }),
				}),
				description: "Error en el endpoint de debug",
				statusCode: StatusCodes.BAD_REQUEST,
			},
			{
				schema: z.object({
					success: z.boolean().openapi({ example: false }),
					message: z.string().openapi({ example: "Error interno del servidor" }),
					data: z.null().openapi({ example: null }),
					statusCode: z.number().openapi({ example: 500 }),
				}),
				description: "Error interno del servidor",
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			},
		]),
	});
};
