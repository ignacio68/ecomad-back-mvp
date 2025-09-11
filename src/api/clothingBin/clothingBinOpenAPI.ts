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
    lat: z
      .string()
      .describe("Latitud de la ubicación de referencia (ej: 40.4168)"),
    lng: z
      .string()
      .describe("Longitud de la ubicación de referencia (ej: -3.7038)"),
    radius: z
      .string()
      .optional()
      .describe(
        "Radio de búsqueda en kilómetros (opcional). Rango: 0.05–5. Default: 5"
      ),
    limit: z
      .string()
      .optional()
      .describe(
        "Máximo de items a devolver (opcional). Rango: 1–5000. Default: 1000"
      ),
  });

  // Esquema para bbox en agregaciones
  const bboxSchema = z.object({
    minLat: z.string().describe("Latitud mínima"),
    minLng: z.string().describe("Longitud mínima"),
    maxLat: z.string().describe("Latitud máxima"),
    maxLng: z.string().describe("Longitud máxima"),
  });

  // Registrar endpoints
  registry.registerPath({
    method: "get",
    path: "/api/clothing-bins",
    description:
      "Obtener todos los contenedores de ropa. Cache-Control: public, max-age=60, stale-while-revalidate=120.",
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
      429: {
        description: "Demasiadas solicitudes (rate limited)",
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
    path: "/api/clothing-bins/count",
    description:
      "Obtener el número total de contenedores de ropa. Cache-Control: public, max-age=300, stale-while-revalidate=600.",
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
      429: {
        description: "Demasiadas solicitudes (rate limited)",
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
    path: "/api/clothing-bins/district/{district}",
    description:
      "Obtener contenedores de ropa por distrito. Cache-Control: public, max-age=120, stale-while-revalidate=300.",
    summary: "Lista contenedores filtrados por distrito (paginado)",
    tags: ["Clothing Bins"],
    request: {
      params: z.object({
        district: z
          .string()
          .describe("Nombre del distrito (ej: ARGANZUELA, CENTRO)"),
      }),
      query: z.object({
        page: z.string().optional().describe("Número de página (default 1)"),
        limit: z
          .string()
          .optional()
          .describe("Tamaño de página (1–5000, default 1000)"),
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
      429: {
        description: "Demasiadas solicitudes (rate limited)",
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
    path: "/api/clothing-bins/neighborhood/{neighborhood}",
    description:
      "Obtener contenedores de ropa por barrio. Cache-Control: public, max-age=300, stale-while-revalidate=600.",
    summary: "Lista contenedores filtrados por barrio (paginado)",
    tags: ["Clothing Bins"],
    request: {
      params: z.object({
        neighborhood: z
          .string()
          .describe("Nombre del barrio (ej: PALACIO, CHUECA, etc.)"),
      }),
      query: z.object({
        page: z.string().optional().describe("Número de página (default 1)"),
        limit: z
          .string()
          .optional()
          .describe("Tamaño de página (1–5000, default 1000)"),
      }),
    },
    responses: {
      200: {
        description: "Contenedores del barrio obtenidos exitosamente",
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
        description: "Parámetro de barrio requerido",
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
      429: {
        description: "Demasiadas solicitudes (rate limited)",
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
    description:
      "Obtener contenedores de ropa cercanos a una ubicación. Los resultados se devuelven ordenados por distancia ascendente. Rate limit aplicado y Cache-Control: public, max-age=30, stale-while-revalidate=60. Ejemplo de request: /api/clothing-bins/nearby?lat=40.4168&lng=-3.7038&radius=1&limit=500",
    summary:
      "Lista contenedores dentro de un radio específico (ordenados por distancia)",
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
            examples: {
              sample: {
                summary: "Ejemplo de respuesta exitosa",
                value: {
                  success: true,
                  message:
                    "Contenedores de ropa cercanos obtenidos exitosamente",
                  statusCode: 200,
                  responseObject: [
                    {
                      TIPO_DATO: "PUNTO LIMPIO",
                      LOTE: 1,
                      COD_DIST: 1,
                      DISTRITO: "CENTRO",
                      COD_BARRIO: 1,
                      BARRIO: "PALACIO",
                      DIRECCION_COMPLETA: "CALLE MAYOR 1",
                      VIA_CLASE: "CALLE",
                      VIA_PAR: "IMPAR",
                      VIA_NOMBRE: "MAYOR",
                      TIPO_NUMERO: "NÚMERO",
                      NUMERO: "1",
                      LATITUD: 40.4168,
                      LONGITUD: -3.7038,
                      "DIRECCIÓN COMPLETA AMPLIADA":
                        "CALLE MAYOR 1, 28013 MADRID",
                      "MÁS INFORMACIÓN": "Contenedor textil",
                    },
                  ],
                },
              },
            },
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
            examples: {
              missingParams: {
                summary: "Ejemplo parámetros faltantes",
                value: {
                  success: false,
                  message: "Los parámetros 'lat' y 'lng' son requeridos",
                  responseObject: null,
                  statusCode: 400,
                },
              },
            },
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
    path: "/api/clothing-bins/aggregate/district",
    description:
      "Obtener agregación de contenedores por distrito dentro de un bbox. Cache-Control: public, max-age=120, stale-while-revalidate=300.",
    summary: "Agregación por distrito",
    tags: ["Clothing Bins"],
    request: {
      query: bboxSchema,
    },
    responses: {
      200: {
        description: "Agregación por distrito obtenida exitosamente",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
              responseObject: z.array(
                z.object({
                  distrito: z.string(),
                  count: z.number(),
                  centroid: z.object({ lat: z.number(), lng: z.number() }),
                })
              ),
              statusCode: z.number(),
            }),
          },
        },
      },
      400: {
        description: "Parámetros de bbox requeridos",
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
    path: "/api/clothing-bins/aggregate/neighborhood",
    description:
      "Obtener agregación de contenedores por barrio dentro de un bbox. Cache-Control: public, max-age=180, stale-while-revalidate=600.",
    summary: "Agregación por barrio",
    tags: ["Clothing Bins"],
    request: {
      query: bboxSchema,
    },
    responses: {
      200: {
        description: "Agregación por barrio obtenida exitosamente",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
              responseObject: z.array(
                z.object({
                  distrito: z.string(),
                  barrio: z.string(),
                  count: z.number(),
                  centroid: z.object({ lat: z.number(), lng: z.number() }),
                })
              ),
              statusCode: z.number(),
            }),
          },
        },
      },
      400: {
        description: "Parámetros de bbox requeridos",
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
