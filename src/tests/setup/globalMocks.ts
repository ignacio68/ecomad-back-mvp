import { vi } from "vitest";
import { z } from "zod";
import { mockGeoUtils, mockServiceResponse, mockValidateCSV } from "../mocks/utilsMocks";

// Configurar todos los mocks globales
export const setupGlobalMocks = () => {
	// Mock de geoUtils
	vi.mock("@/api/common/utils/geoUtils", () => ({
		calculateSearchRadius: mockGeoUtils.calculateSearchRadius,
		sortByDistance: mockGeoUtils.sortByDistance,
	}));

	// Mock de validateCSV
	vi.mock("@/api/common/utils/validateCSV", () => ({
		validateCSV: mockValidateCSV,
	}));

	// Mock de ServiceResponse
	vi.mock("@/shared/models/serviceResponse", () => ({
		ServiceResponse: mockServiceResponse,
		ServiceResponseSchema: (schema: any) =>
			z.object({
				success: z.boolean(),
				message: z.string(),
				responseObject: schema.optional(),
				statusCode: z.number(),
			}),
	}));

	// Mock de rate limiting - deshabilitar para tests
	vi.mock("@/shared/middleware/rateLimiter", () => ({
		default: (req: any, res: any, next: any) => next(), // Pasar al siguiente middleware sin limitar
	}));

	// Mock del middleware de validación de URL - deshabilitar para tests
	vi.mock("@/app", async () => {
		const actual = await vi.importActual("@/app");
		// Interceptar el middleware de validación de URL y deshabilitarlo
		return {
			...actual,
			// El middleware se ejecuta antes de las rutas, así que necesitamos interceptarlo
		};
	});
};

// Helper para limpiar todos los mocks
export const clearAllMocks = () => {
	vi.clearAllMocks();
	mockGeoUtils.calculateSearchRadius.mockClear();
	mockGeoUtils.sortByDistance.mockClear();
	mockValidateCSV.mockClear();
	mockServiceResponse.success.mockClear();
	mockServiceResponse.failure.mockClear();
};
