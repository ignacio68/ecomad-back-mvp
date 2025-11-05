import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { binOpenAPI } from "@/api/v1/docs/binsOpenAPI";
import { z } from "./zod-extensions";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry();

	// Registrar schemas globales primero
	registry.register(
		"Bin",
		z.object({
			id: z.number().openapi({ example: 12947, description: "ID único del contenedor" }),
			category_group_id: z.number().openapi({ example: 1, description: "ID del grupo de categoría" }),
			category_id: z.number().openapi({ example: 14, description: "ID de la categoría específica" }),
			district_id: z.number().openapi({ example: 1, description: "ID del distrito (1-35)" }),
			neighborhood_id: z.number().nullable().openapi({
				example: 5,
				description: "ID del barrio (1-218) - opcional",
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
				description: "Subtipo - opcional",
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
		}),
	);

	registry.register(
		"HierarchyCount",
		z.object({
			distrito: z.string().openapi({ example: "1", description: "ID del distrito (1-35)" }),
			barrio: z.string().openapi({ example: "5", description: "ID del barrio (1-218)" }),
			count: z.number().openapi({
				example: 17,
				description: "Número de contenedores en el barrio",
			}),
		}),
	);

	// Schema para Health Check
	const HealthResponse = z
		.object({
			status: z.string().openapi({ example: "healthy" }),
			timestamp: z.string().openapi({ example: "2025-01-18T15:46:04.968Z" }),
			uptime: z.number().openapi({ example: 10.99044525 }),
			environment: z.string().openapi({ example: "development" }),
			version: z.string().openapi({ example: "1.0.14" }),
		})
		.openapi("HealthResponse");

	// Endpoint de Health Check
	registry.registerPath({
		method: "get",
		path: "/health",
		summary: "Health Check",
		description: "Verificar el estado de salud del servidor y obtener información del sistema",
		tags: ["Health"],
		responses: {
			200: {
				description: "Servidor funcionando correctamente",
				content: {
					"application/json": {
						schema: HealthResponse,
					},
				},
			},
		},
	});

	// Registrar documentación de Bins
	binOpenAPI(registry);

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "EcoMAD API",
			description: `
# EcoMAD API

API REST para la gestión de contenedores de reciclaje en la ciudad de Madrid.

## Características principales

- **Gestión de contenedores**: Obtener información sobre diferentes tipos de contenedores de reciclaje
- **Búsqueda por ubicación**: Filtrar contenedores por distrito o barrio
- **Búsqueda por proximidad**: Encontrar contenedores cercanos a una ubicación específica
- **Estadísticas**: Obtener conteos y estadísticas jerárquicas por distrito y barrio
- **Cache inteligente**: Respuestas optimizadas con cache headers para mejor rendimiento

## Tipos de contenedores soportados

| Tipo | Descripción | Total |
|------|-------------|-------|
| \`clothing_bins\` | Contenedores de ropa y textil | 1,175 |
| \`oil_bins\` | Contenedores de aceite vegetal usado | 90 |
| \`glass_bins\` | Contenedores de vidrio con publicidad | 7,441 |
| \`paper_bins\` | Contenedores de papel y cartón | 7,320 |
| \`plastic_bins\` | Contenedores de envases (plástico, metal, brik) | 6,846 |
| \`organic_bins\` | Contenedores de residuos orgánicos | 6,685 |
| \`battery_bins\` | Puntos de recogida de pilas (mupis/marquesinas) | 1,231 |
| \`other_bins\` | Contenedores de resto (residuos no reciclables) | 6,722 |

**Total: 37,510 contenedores** en toda la ciudad de Madrid

## Autenticación

Esta API no requiere autenticación para las operaciones de lectura.

## Rate Limiting

- **Límite**: 100 requests por minuto por IP
- **Headers**: Se incluyen headers informativos sobre el rate limit

## Respuestas

Todas las respuestas siguen el formato \`ServiceResponse\`:

\`\`\`json
{
  "success": boolean,
  "message": string,
  "responseObject": object | null,
  "statusCode": number
}
\`\`\`

Ejemplo de respuesta exitosa:
\`\`\`json
{
  "success": true,
  "message": "Contenedores obtenidos exitosamente",
  "responseObject": [{
    "id": 12947,
    "district_id": 1,
    "neighborhood_id": 5,
    "address": "CALLE DEL DESENGAÑO, 16",
    "lat": 40.42091,
    "lng": -3.70348,
    ...
  }],
  "statusCode": 200
}
\`\`\`

## Códigos de estado HTTP

- **200**: Éxito
- **204**: Sin contenido (datos vacíos)
- **400**: Solicitud incorrecta
- **404**: No encontrado
- **429**: Demasiadas solicitudes (rate limited)
- **500**: Error interno del servidor
      `,
			contact: {
				name: "EcoMAD Team",
				email: "contact@ecomad.app",
				url: "https://ecomad.app",
			},
			license: {
				name: "MIT",
				url: "https://opensource.org/licenses/MIT",
			},
		},
		servers: [
			{
				url: "http://localhost:8080",
				description: "Servidor de desarrollo local",
			},
			{
				url: "https://api.ecomad.app",
				description: "Servidor de producción",
			},
		],
		tags: [
			{
				name: "Health",
				description: "Endpoints de salud y estado del sistema",
			},
			{
				name: "Bins",
				description: "Operaciones relacionadas con contenedores de reciclaje",
			},
			{
				name: "Statistics",
				description: "Estadísticas y conteos de contenedores",
			},
		],
		externalDocs: {
			description: "Ver la especificación OpenAPI completa en formato JSON",
			url: "/swagger.json",
		},
	});
}
