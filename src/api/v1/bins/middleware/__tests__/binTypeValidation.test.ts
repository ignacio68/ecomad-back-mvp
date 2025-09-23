import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VALID_BIN_TYPES } from "@/api/v1/bins/constants/binTypes";
import { ERROR_MESSAGES } from "@/api/v1/bins/constants/errorMessages";
import { validateBinType } from "../binTypeValidation";

// Mock de ServiceResponse
vi.mock("@/shared/models/serviceResponse", () => ({
	ServiceResponse: {
		failure: vi.fn((message, data) => ({
			success: false,
			message,
			data,
			statusCode: 400,
		})),
	},
}));

describe("validateBinType middleware", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		// Mock de Request
		mockRequest = {
			params: {},
			originalUrl: "",
		};

		// Mock de Response
		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		// Mock de NextFunction
		mockNext = vi.fn();

		// Limpiar mocks
		vi.clearAllMocks();
	});

	describe("Casos exitosos", () => {
		it("should validate binType from params and call next()", () => {
			// Arrange
			mockRequest.params = { binType: "clothing_bins" };

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockNext).toHaveBeenCalledOnce();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.json).not.toHaveBeenCalled();
			expect((mockRequest as any).binType).toBe("clothing_bins");
		});

		it("should validate binType from URL when not in params", () => {
			// Arrange
			mockRequest.params = {};
			mockRequest.originalUrl = "/api/v1/bins/oil_bins/count";

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockNext).toHaveBeenCalledOnce();
			expect(mockResponse.status).not.toHaveBeenCalled();
			expect(mockResponse.json).not.toHaveBeenCalled();
			expect((mockRequest as any).binType).toBe("oil_bins");
		});

		it("should work with all valid bin types", () => {
			for (const binType of VALID_BIN_TYPES) {
				// Arrange
				mockRequest.params = { binType };
				vi.clearAllMocks();

				// Act
				validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(mockNext).toHaveBeenCalledOnce();
				expect((mockRequest as any).binType).toBe(binType);
			}
		});
	});

	describe("Casos de error - binType faltante", () => {
		it("should return 400 when binType is not found in params or URL", () => {
			// Arrange
			mockRequest.params = {};
			mockRequest.originalUrl = "/api/v1/bins/";

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: ERROR_MESSAGES.NO_BIN_TYPE_FOUND,
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 400 when URL does not contain bins path", () => {
			// Arrange
			mockRequest.params = {};
			mockRequest.originalUrl = "/api/v1/other/endpoint";

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: ERROR_MESSAGES.NO_BIN_TYPE_FOUND,
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("Casos de error - binType inválido", () => {
		it("should return 400 when binType is invalid", () => {
			// Arrange
			mockRequest.params = { binType: "invalid_bin_type" };

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: ERROR_MESSAGES.INVALID_BIN_TYPE,
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 400 when binType from URL is invalid", () => {
			// Arrange
			mockRequest.params = {};
			mockRequest.originalUrl = "/api/v1/bins/invalid_type/count";

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: ERROR_MESSAGES.INVALID_BIN_TYPE,
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("Extracción de binType desde URL", () => {
		it("should extract binType from various URL patterns", () => {
			const testCases = [
				{ url: "/api/v1/bins/glass_bins", expected: "glass_bins" },
				{ url: "/api/v1/bins/paper_bins/count", expected: "paper_bins" },
				{
					url: "/api/v1/bins/plastic_bins/location/district/CENTRO",
					expected: "plastic_bins",
				},
				{ url: "/api/v1/bins/organic_bins/nearby", expected: "organic_bins" },
			];

			for (const { url, expected } of testCases) {
				// Arrange
				mockRequest.params = {};
				mockRequest.originalUrl = url;
				vi.clearAllMocks();

				// Act
				validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

				// Assert
				expect(mockNext).toHaveBeenCalledOnce();
				expect((mockRequest as any).binType).toBe(expected);
			}
		});

		it("should prioritize params over URL extraction", () => {
			// Arrange
			mockRequest.params = { binType: "clothing_bins" };
			mockRequest.originalUrl = "/api/v1/bins/oil_bins/count";

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockNext).toHaveBeenCalledOnce();
			expect((mockRequest as any).binType).toBe("clothing_bins"); // De params, no de URL
		});
	});

	describe("Manejo de errores", () => {
		it("should handle unexpected errors and return 500", () => {
			// Arrange
			mockRequest.params = { binType: "clothing_bins" };

			// Mock console.error para evitar logs en tests
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			// Simular error inesperado modificando la función includes
			const originalIncludes = Array.prototype.includes;
			Array.prototype.includes = vi.fn().mockImplementation(() => {
				throw new Error("Unexpected error");
			});

			// Act
			validateBinType(mockRequest as Request, mockResponse as Response, mockNext);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: ERROR_MESSAGES.UNKNOWN_SYSTEM_ERROR,
				}),
			);
			expect(mockNext).not.toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalledWith("Error en validación de binType:", expect.any(Error));

			// Cleanup
			Array.prototype.includes = originalIncludes;
			consoleSpy.mockRestore();
		});
	});
});
