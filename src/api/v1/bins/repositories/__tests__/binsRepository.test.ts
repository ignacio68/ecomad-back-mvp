import { beforeEach, describe, expect, it } from "vitest";
import { mockBins } from "@/tests/mocks/binsDataMocks";
import { supabaseMock } from "@/tests/setup/supabase.mock";
import { ERROR_MESSAGES, TEST_ERROR_MESSAGES } from "../../constants/errorMessages";
import type { LocationParams, NearbyParams } from "../../types/binTypes";
import { BinsRepository } from "../binsRepository";

describe("BinsRepository", () => {
	let repository: BinsRepository;

	beforeEach(() => {
		// Crear nueva instancia del repository para cada test
		repository = new BinsRepository();

		// Limpiar todos los mocks
		supabaseMock.__reset();
	});

	describe("findAll", () => {
		it("should return all bins from database", async () => {
			// Arrange
			const binType = "clothing_bins";
			supabaseMock.__setResponse(binType, "select", {
				data: mockBins,
				error: null,
			});

			// Act
			const result = await repository.findAll(binType);

			// Assert
			expect(result).toEqual(mockBins);
			expect(supabaseMock.__getCalls()).toHaveLength(1);

			const call = supabaseMock.__getCalls()[0];
			expect(call.table).toBe(binType);
			expect(call.op).toBe("select");
			expect(call.filters).toHaveLength(0); // Sin filtros, solo select *
		});

		it("should return empty array when no data", async () => {
			// Arrange
			const binType = "clothing_bins";
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: null,
			});

			// Act
			const result = await repository.findAll(binType);

			// Assert
			expect(result).toEqual([]);
		});

		it("should throw error when Supabase fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.CONNECTION_FAILED;
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: { message: errorMessage },
			});

			// Act & Assert
			await expect(repository.findAll(binType)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("count", () => {
		it("should return count of bins", async () => {
			// Arrange
			const binType = "clothing_bins";
			const expectedCount = 1254;
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: null,
				count: expectedCount,
			});

			// Act
			const result = await repository.count(binType);

			// Assert
			expect(result).toBe(expectedCount);

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].op).toBe("select");
		});

		it("should return 0 when count is null", async () => {
			// Arrange
			const binType = "clothing_bins";
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: null,
				count: undefined,
			});

			// Act
			const result = await repository.count(binType);

			// Assert
			expect(result).toBe(0);
		});

		it("should throw error when Supabase fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.DATABASE_ERROR;
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: { message: errorMessage },
				count: undefined,
			});

			// Act & Assert
			await expect(repository.count(binType)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("findByLocation", () => {
		it("should return bins by district", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "district",
				locationValue: "CENTRO",
				page: 1,
				limit: 10,
			};
			const expectedBins = mockBins.filter((bin) => bin.distrito === "CENTRO");

			supabaseMock.__setResponse(binType, "select", {
				data: expectedBins,
				error: null,
			});

			// Act
			const result = await repository.findByLocation(binType, params);

			// Assert
			expect(result).toEqual(expectedBins);

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].filters).toContainEqual(["distrito", "eq", "CENTRO"]);
		});

		it("should return bins by neighborhood", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "neighborhood",
				locationValue: "PALACIO",
				page: 2,
				limit: 20,
			};
			const expectedBins = mockBins.filter((bin) => bin.barrio === "PALACIO");

			supabaseMock.__setResponse(binType, "select", {
				data: expectedBins,
				error: null,
			});

			// Act
			const result = await repository.findByLocation(binType, params);

			// Assert
			expect(result).toEqual(expectedBins);

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].filters).toContainEqual(["barrio", "eq", "PALACIO"]);
		});

		it("should handle pagination correctly", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "district",
				locationValue: "CENTRO",
				page: 3,
				limit: 15,
			};

			supabaseMock.__setResponse(binType, "select", {
				data: [],
				error: null,
			});

			// Act
			await repository.findByLocation(binType, params);

			// Assert
			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			// Verificar que se aplicó el rango correcto (offset: 30, limit: 15)
			expect(calls[0].args.range).toBe("30,44");
		});

		it("should throw error when Supabase fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "district",
				locationValue: "CENTRO",
				page: 1,
				limit: 10,
			};
			const errorMessage = TEST_ERROR_MESSAGES.QUERY_FAILED;

			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: { message: errorMessage },
			});

			// Act & Assert
			await expect(repository.findByLocation(binType, params)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("findNearby", () => {
		it("should return nearby bins within radius", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: NearbyParams = {
				lat: 40.4168,
				lng: -3.7038,
				radius: 5,
				limit: 100,
			};

			// Mock bins con coordenadas
			const binsWithCoords = mockBins.map((bin) => ({
				...bin,
				latitud: "40.4168",
				longitud: "-3.7038",
			}));

			supabaseMock.__setResponse(binType, "select", {
				data: binsWithCoords,
				error: null,
			});

			// Act
			const result = await repository.findNearby(binType, params);

			// Assert
			expect(result).toHaveLength(2); // mockBins tiene 2 elementos
			expect(result[0]).toHaveProperty("latitud");
			expect(result[0]).toHaveProperty("longitud");

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].filters).toContainEqual(["latitud", "not", "is", null]);
			expect(calls[0].filters).toContainEqual(["longitud", "not", "is", null]);
		});

		it("should filter out bins without coordinates", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: NearbyParams = {
				lat: 40.4168,
				lng: -3.7038,
				radius: 5,
				limit: 100,
			};

			// Mock bins sin coordenadas
			const binsWithoutCoords = mockBins.map((bin) => ({
				...bin,
				latitud: null,
				longitud: null,
			}));

			supabaseMock.__setResponse(binType, "select", {
				data: binsWithoutCoords,
				error: null,
			});

			// Act
			const result = await repository.findNearby(binType, params);

			// Assert
			expect(result).toEqual([]);
		});

		it("should throw error when Supabase fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: NearbyParams = {
				lat: 40.4168,
				lng: -3.7038,
				radius: 5,
				limit: 100,
			};
			const errorMessage = TEST_ERROR_MESSAGES.GEOSPATIAL_QUERY_FAILED;

			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: { message: errorMessage },
			});

			// Act & Assert
			await expect(repository.findNearby(binType, params)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("getCountsHierarchy", () => {
		it("should return counts grouped by district and neighborhood", async () => {
			// Arrange
			const binType = "clothing_bins";
			const mockData = [
				{ distrito: "CENTRO", barrio: "PALACIO" },
				{ distrito: "CENTRO", barrio: "PALACIO" },
				{ distrito: "CENTRO", barrio: "CHUECA" },
				{ distrito: "CHAMARTIN", barrio: "ELVISCO" },
			];

			supabaseMock.__setResponse(binType, "select", {
				data: mockData,
				error: null,
			});

			// Act
			const result = await repository.getCountsHierarchy(binType);

			// Assert
			expect(result).toEqual([
				{ distrito: "CENTRO", barrio: "PALACIO", count: 2 },
				{ distrito: "CENTRO", barrio: "CHUECA", count: 1 },
				{ distrito: "CHAMARTIN", barrio: "ELVISCO", count: 1 },
			]);

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].args.select).toBe("distrito, barrio");
		});

		it("should return empty array when no data", async () => {
			// Arrange
			const binType = "clothing_bins";
			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: null,
			});

			// Act
			const result = await repository.getCountsHierarchy(binType);

			// Assert
			expect(result).toEqual([]);
		});

		it("should throw error when Supabase fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.AGGREGATION_FAILED;

			supabaseMock.__setResponse(binType, "select", {
				data: null,
				error: { message: errorMessage },
			});

			// Act & Assert
			await expect(repository.getCountsHierarchy(binType)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("insertMany", () => {
		it("should insert bins in batches successfully", async () => {
			// Arrange
			const binType = "clothing_bins";
			const bins = mockBins.slice(0, 2);

			supabaseMock.__setResponse(binType, "insert", {
				data: bins,
				error: null,
			});

			// Act
			const result = await repository.insertMany(binType, bins);

			// Assert
			expect(result).toEqual({
				inserted: 2,
				errors: [],
			});

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].op).toBe("insert");
			expect(calls[0].args.values).toEqual(bins);
		});

		it("should handle insertion errors", async () => {
			// Arrange
			const binType = "clothing_bins";
			const bins = mockBins.slice(0, 2);
			const error = new Error("Insert failed");

			supabaseMock.__setResponse(binType, "insert", {
				data: null,
				error,
			});

			// Act
			const result = await repository.insertMany(binType, bins);

			// Assert
			expect(result).toEqual({
				inserted: 0,
				errors: [{ batch: 1, error }],
			});
		});

		it("should handle large datasets in multiple batches", async () => {
			// Arrange
			const binType = "clothing_bins";
			// Crear 2500 bins para forzar múltiples lotes (batch size = 1000)
			const bins = Array.from({ length: 2500 }, (_, i) => ({
				...mockBins[0],
				lote: String(i),
			}));

			// Mock respuestas exitosas para todos los lotes
			supabaseMock.__setResponse(binType, "insert", {
				data: bins.slice(0, 1000),
				error: null,
			});
			supabaseMock.__setResponse(binType, "insert", {
				data: bins.slice(1000, 2000),
				error: null,
			});
			supabaseMock.__setResponse(binType, "insert", {
				data: bins.slice(2000, 2500),
				error: null,
			});

			// Act
			const result = await repository.insertMany(binType, bins);

			// Assert
			expect(result).toEqual({
				inserted: 2500,
				errors: [],
			});

			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(3); // 3 lotes
		});
	});

	describe("deleteAll", () => {
		it("should delete all bins from table", async () => {
			// Arrange
			const binType = "clothing_bins";
			supabaseMock.__setResponse(binType, "delete", {
				data: null,
				error: null,
			});

			// Act
			await repository.deleteAll(binType);

			// Assert
			const calls = supabaseMock.__getCalls();
			expect(calls).toHaveLength(1);
			expect(calls[0].table).toBe(binType);
			expect(calls[0].op).toBe("delete");
			expect(calls[0].filters).toContainEqual(["id", "neq", 0]);
		});

		it("should throw error when deletion fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.DELETE_FAILED;

			supabaseMock.__setResponse(binType, "delete", {
				data: null,
				error: { message: errorMessage },
			});

			// Act & Assert
			await expect(repository.deleteAll(binType)).rejects.toThrow(
				`${ERROR_MESSAGES.DATA_DELETION_FAILED}: ${errorMessage}`,
			);
		});
	});
});
