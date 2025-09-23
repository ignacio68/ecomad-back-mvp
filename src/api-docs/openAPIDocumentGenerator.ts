import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { binOpenAPI } from "@/api/v1/docs/binsOpenAPI";
import { z } from "./zod-extensions";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry();

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

- \`clothing_bins\`: Contenedores de ropa
- \`oil_bins\`: Contenedores de aceite usado
- \`glass_bins\`: Contenedores de vidrio
- \`paper_bins\`: Contenedores de papel y cartón
- \`plastic_bins\`: Contenedores de plástico
- \`organic_bins\`: Contenedores de orgánicos
- \`other_bins\`: Contenedores de otros materiales

## Autenticación

Esta API no requiere autenticación para las operaciones de lectura.

## Rate Limiting

- **Límite**: 100 requests por minuto por IP
- **Headers**: Se incluyen headers informativos sobre el rate limit

## Respuestas

Todas las respuestas siguen el formato estándar:

\`\`\`json
{
  "success": boolean,
  "message": string,
  "responseObject": object | null,
  "statusCode": number
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
