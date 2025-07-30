import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { clothingBinSchema } from "./clothingBinSchema";

export const clothingBinOpenAPI = (registry: OpenAPIRegistry) => {
	// Registrar el esquema de ClothingBin
	registry.register("ClothingBin", clothingBinSchema);

	// Esquema para la respuesta de conteo
	const countResponseSchema = z.object({
		count: z.number().describe("Número total de contenedores de ropa"),
	});

	// Esquema para parámetros de consulta de nearby
	const nearbyQuerySchema = z.object({
		lat: z.string().describe("Latitud de la ubicación de referencia"),
		lng: z.string().describe("Longitud de la ubicación de referencia"),
		radius: z.string().optional().describe("Radio de búsqueda en kilómetros (opcional, default: 5)"),
	});

	// Registrar endpoints
	registry.registerPath({
		method: "get",
		path: "/api/clothing-bins",
		description: "Obtener todos los contenedores de ropa",
		summary: "Lista todos los contenedores de ropa de Madrid",
		tags: ["Clothing Bins"],
		responses: {
			200: {
				description: "Lista de contenedores obtenida exitosamente",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.array(clothingBinSchema),
							statusCode: z.number(),
						}),
					},
				},
			},
			500: {
				description: "Error interno del servidor",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
		},
	});

	registry.registerPath({
		method: "get",
		path: "/api/clothing-bins/count",
		description: "Obtener el número total de contenedores de ropa",
		summary: "Retorna el conteo total de contenedores",
		tags: ["Clothing Bins"],
		responses: {
			200: {
				description: "Conteo obtenido exitosamente",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: countResponseSchema,
							statusCode: z.number(),
						}),
					},
				},
			},
			500: {
				description: "Error interno del servidor",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
		},
	});

	registry.registerPath({
		method: "get",
		path: "/api/clothing-bins/district/{district}",
		description: "Obtener contenedores de ropa por distrito",
		summary: "Lista contenedores filtrados por distrito",
		tags: ["Clothing Bins"],
		request: {
			params: z.object({
				district: z.string().describe("Nombre del distrito (ej: ARGANZUELA, CENTRO)"),
			}),
		},
		responses: {
			200: {
				description: "Contenedores del distrito obtenidos exitosamente",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.array(clothingBinSchema),
							statusCode: z.number(),
						}),
					},
				},
			},
			400: {
				description: "Parámetro de distrito requerido",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
			500: {
				description: "Error interno del servidor",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
		},
	});

	registry.registerPath({
		method: "get",
		path: "/api/clothing-bins/nearby",
		description: "Obtener contenedores de ropa cercanos a una ubicación",
		summary: "Lista contenedores dentro de un radio específico",
		tags: ["Clothing Bins"],
		request: {
			query: nearbyQuerySchema,
		},
		responses: {
			200: {
				description: "Contenedores cercanos obtenidos exitosamente",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.array(clothingBinSchema),
							statusCode: z.number(),
						}),
					},
				},
			},
			400: {
				description: "Parámetros requeridos faltantes o inválidos",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
			500: {
				description: "Error interno del servidor",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
							responseObject: z.null(),
							statusCode: z.number(),
						}),
					},
				},
			},
		},
	});
};
