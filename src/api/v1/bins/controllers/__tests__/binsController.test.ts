import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock de los servicios - DEBE estar antes de importar la app
vi.mock("../../services/binsService", () => ({
	getAllBins: vi.fn(),
	getBinsCount: vi.fn(),
	getBinsByLocation: vi.fn(),
	getBinsNearby: vi.fn(),
	getBinsCountsHierarchy: vi.fn(),
	clearBins: vi.fn(),
	insertBins: vi.fn(),
}));

// Importar la app de Express DESPUÉS de los mocks
import { app } from "../../../../../app";
// Importar mocks compartidos
import { mockBins, mockHierarchy } from "../../../../../tests/mocks/binsDataMocks";
// Importar mocks de utilidades
import { mockValidateCSV } from "../../../../../tests/mocks/utilsMocks";
// Importar constantes de mensajes
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { SUCCESS_MESSAGES } from "../../constants/successMessages";
// Importar después de los mocks
import {
	clearBins,
	getAllBins,
	getBinsByLocation,
	getBinsCount,
	getBinsCountsHierarchy,
	getBinsNearby,
	insertBins,
} from "../../services/binsService";

describe("binsController", () => {
	beforeEach(() => {
		// Limpiar todos los mocks
		vi.clearAllMocks();
	});

	describe("GET /api/v1/:binType", () => {
		it("should return bins successfully", async () => {
			vi.mocked(getAllBins).mockResolvedValue(mockBins);

			const response = await request(app).get("/api/v1/bins/clothing_bins").expect(StatusCodes.OK);

			expect(getAllBins).toHaveBeenCalledWith("clothing_bins");
			expect(response.status).toBe(StatusCodes.OK);
			expect(response.body.success).toBe(true);
			expect(response.body.statusCode).toBe(StatusCodes.OK);
			expect(response.body.responseObject).toEqual(mockBins);
			expect(typeof response.body.message).toBe("string");
		});

		it("should return empty array when no bins found", async () => {
			vi.mocked(getAllBins).mockResolvedValue([]);

			const response = await request(app).get("/api/v1/bins/clothing_bins").expect(StatusCodes.OK);

			expect(getAllBins).toHaveBeenCalledWith("clothing_bins");
			expect(response.status).toBe(StatusCodes.OK);
			expect(response.body.success).toBe(true);
			expect(response.body.statusCode).toBe(StatusCodes.OK);
			expect(response.body.responseObject).toEqual([]);
			expect(typeof response.body.message).toBe("string");
		});

		it("should handle service errors", async () => {
			vi.mocked(getAllBins).mockRejectedValue(new Error(ERROR_MESSAGES.DATABASE_CONNECTION_FAILED));

			const response = await request(app).get("/api/v1/bins/clothing_bins").expect(StatusCodes.INTERNAL_SERVER_ERROR);

			expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(response.body.success).toBe(false);
			expect(response.body.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(response.body.responseObject).toBeNull();
			expect(typeof response.body.message).toBe("string");
		});
	});

	describe("GET /api/v1/:binType/count", () => {
		it("should return count successfully", async () => {
			vi.mocked(getBinsCount).mockResolvedValue({ count: 1254 });

			const response = await request(app).get("/api/v1/bins/clothing_bins/count").expect(StatusCodes.OK);

			expect(getBinsCount).toHaveBeenCalledWith("clothing_bins");
			expect(response.status).toBe(StatusCodes.OK);
			expect(response.body.success).toBe(true);
			expect(response.body.statusCode).toBe(StatusCodes.OK);
			expect(response.body.responseObject).toEqual({ count: 1254 });
			expect(typeof response.body.message).toBe("string");
		});

		it("should handle service errors", async () => {
			vi.mocked(getBinsCount).mockRejectedValue(new Error(ERROR_MESSAGES.DATABASE_CONNECTION_FAILED));

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/count")
				.expect(StatusCodes.INTERNAL_SERVER_ERROR);

			expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(response.body.success).toBe(false);
			expect(response.body.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(response.body.responseObject).toBeNull();
			expect(typeof response.body.message).toBe("string");
		});
	});

	describe("GET /api/v1/:binType/location/:locationType/:locationValue", () => {
		it("should return bins by location successfully", async () => {
			vi.mocked(getBinsByLocation).mockResolvedValue(mockBins);

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/location/district/CENTRO")
				.query({ page: "1", limit: "10" })
				.expect(StatusCodes.OK);

			expect(getBinsByLocation).toHaveBeenCalledWith("clothing_bins", {
				locationType: "district",
				locationValue: "CENTRO",
				page: 1,
				limit: 10,
			});
			expect(response.body).toEqual({
				success: true,
				responseObject: mockBins,
				message: SUCCESS_MESSAGES.LOCATION_BINS_RETRIEVED,
				statusCode: StatusCodes.OK,
			});
		});

		it("should return 204 when no bins found in location", async () => {
			vi.mocked(getBinsByLocation).mockResolvedValue([]);

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/location/district/CENTRO")
				.query({ page: "1", limit: "10" })
				.expect(StatusCodes.OK);

			expect(response.body).toEqual({
				success: true,
				responseObject: [],
				message: SUCCESS_MESSAGES.NO_LOCATION_DATA,
				statusCode: StatusCodes.OK,
			});
		});

		it("should handle service errors", async () => {
			vi.mocked(getBinsByLocation).mockRejectedValue(new Error(ERROR_MESSAGES.INVALID_LOCATION_PARAMS));

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/location/district/CENTRO")
				.query({ page: "1", limit: "10" })
				.expect(StatusCodes.BAD_REQUEST);

			expect(response.body).toEqual({
				success: false,
				responseObject: null,
				message: ERROR_MESSAGES.INVALID_LOCATION_PARAMS,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		});
	});

	describe("GET /api/v1/:binType/nearby", () => {
		it("should return nearby bins successfully", async () => {
			vi.mocked(getBinsNearby).mockResolvedValue(mockBins);

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/nearby")
				.query({
					lat: "40.4168",
					lng: "-3.7038",
					radius: "5",
					limit: "100",
				})
				.expect(StatusCodes.OK);

			expect(getBinsNearby).toHaveBeenCalledWith("clothing_bins", {
				lat: 40.4168,
				lng: -3.7038,
				radius: 5,
				limit: 100,
			});
			expect(response.body).toEqual({
				success: true,
				responseObject: mockBins,
				message: SUCCESS_MESSAGES.NEARBY_BINS_RETRIEVED,
				statusCode: StatusCodes.OK,
			});
		});

		it("should return 204 when no nearby bins found", async () => {
			vi.mocked(getBinsNearby).mockResolvedValue([]);

			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/nearby")
				.query({
					lat: "40.4168",
					lng: "-3.7038",
					radius: "5",
					limit: "100",
				})
				.expect(StatusCodes.OK);

			expect(response.body).toEqual({
				success: true,
				responseObject: [],
				message: SUCCESS_MESSAGES.NO_NEARBY_DATA,
				statusCode: StatusCodes.OK,
			});
		});

		it("should handle missing required parameters", async () => {
			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/nearby")
				.query({ radius: "5" }) // Missing lat and lng
				.expect(StatusCodes.BAD_REQUEST);

			expect(response.body).toEqual({
				success: false,
				responseObject: null,
				message: ERROR_MESSAGES.MISSING_LAT_LNG,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		});

		it("should handle invalid coordinate parameters", async () => {
			const response = await request(app)
				.get("/api/v1/bins/clothing_bins/nearby")
				.query({
					lat: "invalid",
					lng: "invalid",
					radius: "5",
					limit: "100",
				})
				.expect(StatusCodes.BAD_REQUEST);

			expect(response.body).toEqual({
				success: false,
				responseObject: null,
				message: ERROR_MESSAGES.INVALID_COORDINATES_DETAIL,
				statusCode: StatusCodes.BAD_REQUEST,
			});
		});
	});

	describe("GET /api/v1/:binType/hierarchy", () => {
		it("should return hierarchy counts successfully", async () => {
			vi.mocked(getBinsCountsHierarchy).mockResolvedValue(mockHierarchy);

			const response = await request(app).get("/api/v1/bins/clothing_bins/counts").expect(StatusCodes.OK);

			expect(getBinsCountsHierarchy).toHaveBeenCalledWith("clothing_bins");
			expect(response.body).toEqual({
				success: true,
				responseObject: mockHierarchy,
				message: SUCCESS_MESSAGES.HIERARCHY_RETRIEVED,
				statusCode: StatusCodes.OK,
			});
		});

		it("should return empty array when no hierarchy data found", async () => {
			vi.mocked(getBinsCountsHierarchy).mockResolvedValue([]);

			const response = await request(app).get("/api/v1/bins/clothing_bins/counts").expect(StatusCodes.OK);

			expect(response.body).toEqual({
				success: true,
				responseObject: [],
				message: SUCCESS_MESSAGES.NO_HIERARCHY_DATA,
				statusCode: StatusCodes.OK,
			});
		});
	});

	describe("POST /api/v1/:binType/load (DEPRECATED)", () => {
		it("should return 410 GONE - endpoint is deprecated", async () => {
			const mockCsvData = "TIPO_DATO;LOTE;COD_DIST;...";

			const response = await request(app)
				.post("/api/v1/bins/clothing_bins/load-data")
				.send({ csvData: mockCsvData })
				.expect(StatusCodes.GONE);

			expect(response.body).toEqual({
				success: false,
				responseObject: {
					deprecated: true,
					alternative: "Use el script de importación: pnpm run import:bins",
					documentation: "Ver README.md sección 'Scripts de Utilidad'",
				},
				message: "Este endpoint está obsoleto. Usa el script 'pnpm run import:bins' para importar datos.",
				statusCode: StatusCodes.GONE,
			});
		});

		it("should return 410 GONE even with no data", async () => {
			const response = await request(app)
				.post("/api/v1/bins/clothing_bins/load-data")
				.send({})
				.expect(StatusCodes.GONE);

			expect(response.body.success).toBe(false);
			expect(response.body.statusCode).toBe(StatusCodes.GONE);
		});
	});

	describe("GET /api/v1/:binType/debug", () => {
		it("should return debug information successfully", async () => {
			const response = await request(app).get("/api/v1/bins/clothing_bins/debug").expect(StatusCodes.OK);

			expect(response.body).toEqual({
				success: true,
				responseObject: expect.objectContaining({
					binType: "clothing_bins",
				}),
				message: SUCCESS_MESSAGES.DEBUG_SUCCESS,
				statusCode: StatusCodes.OK,
			});
		});
	});
});
