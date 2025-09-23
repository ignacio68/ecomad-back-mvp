import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockBins } from "@/tests/mocks/binsDataMocks";
import { supabaseMock } from "@/tests/setup/supabase.mock";
import { ERROR_MESSAGES, TEST_ERROR_MESSAGES } from "../../constants/errorMessages";
import { binsRepository } from "../../repositories";
import type { BinRecord, LocationParams } from "../../types/binTypes";
import {
	clearBins,
	getAllBins,
	getBinsByLocation,
	getBinsCount,
	getBinsCountsHierarchy,
	getBinsNearby,
	insertBins,
} from "../binsService";

// Mock del Repository
vi.mock("../../repositories/binsRepository", () => ({
	binsRepository: {
		findAll: vi.fn(),
		count: vi.fn(),
		findByLocation: vi.fn(),
		findNearby: vi.fn(),
		getCountsHierarchy: vi.fn(),
		insertMany: vi.fn(),
		deleteAll: vi.fn(),
	},
}));

// Helper para convertir mockBins a BinRecord
const convertToBinRecord = (mockBin: any): BinRecord => ({
	id: Math.floor(Math.random() * 1000) + 1, // ID aleatorio para tests
	...mockBin,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
});

describe("BinsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		supabaseMock.__reset();
	});

	describe("getAllBins", () => {
		it("should return all bins from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const expectedBins = mockBins.map(convertToBinRecord);

			vi.mocked(binsRepository.findAll).mockResolvedValue(expectedBins);

			// Act
			const result = await getAllBins(binType);

			// Assert
			expect(result).toEqual(expectedBins);
			expect(binsRepository.findAll).toHaveBeenCalledWith(binType);
		});

		it("should return empty array when repository returns empty data", async () => {
			// Arrange
			const binType = "clothing_bins";
			vi.mocked(binsRepository.findAll).mockResolvedValue([]);

			// Act
			const result = await getAllBins(binType);

			// Assert
			expect(result).toEqual([]);
			expect(binsRepository.findAll).toHaveBeenCalledWith(binType);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.CONNECTION_FAILED;
			vi.mocked(binsRepository.findAll).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(getAllBins(binType)).rejects.toThrow(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`);
		});
	});

	describe("getBinsCount", () => {
		it("should return count from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const mockCount = 1254;
			vi.mocked(binsRepository.count).mockResolvedValue(mockCount);

			// Act
			const result = await getBinsCount(binType);

			// Assert
			expect(result).toEqual({ count: mockCount });
			expect(binsRepository.count).toHaveBeenCalledWith(binType);
		});

		it("should return 0 when repository returns 0", async () => {
			// Arrange
			const binType = "clothing_bins";
			vi.mocked(binsRepository.count).mockResolvedValue(0);

			// Act
			const result = await getBinsCount(binType);

			// Assert
			expect(result).toEqual({ count: 0 });
			expect(binsRepository.count).toHaveBeenCalledWith(binType);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.DATABASE_ERROR;
			vi.mocked(binsRepository.count).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(getBinsCount(binType)).rejects.toThrow(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`);
		});
	});

	describe("getBinsByLocation", () => {
		it("should return bins by district from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "district",
				locationValue: "CENTRO",
				page: 1,
				limit: 10,
			};
			const expectedBins = mockBins.map(convertToBinRecord);

			vi.mocked(binsRepository.findByLocation).mockResolvedValue(expectedBins);

			// Act
			const result = await getBinsByLocation(binType, params);

			// Assert
			expect(result).toEqual(expectedBins);
			expect(binsRepository.findByLocation).toHaveBeenCalledWith(binType, params);
		});

		it("should return bins by neighborhood from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "neighborhood",
				locationValue: "PALACIO",
				page: 1,
				limit: 10,
			};
			const mockBins: BinRecord[] = [];

			vi.mocked(binsRepository.findByLocation).mockResolvedValue(mockBins);

			// Act
			const result = await getBinsByLocation(binType, params);

			// Assert
			expect(result).toEqual([]);
			expect(binsRepository.findByLocation).toHaveBeenCalledWith(binType, params);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params: LocationParams = {
				locationType: "district",
				locationValue: "CENTRO",
				page: 1,
				limit: 10,
			};
			const errorMessage = TEST_ERROR_MESSAGES.QUERY_FAILED;
			vi.mocked(binsRepository.findByLocation).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(getBinsByLocation(binType, params)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("getBinsNearby", () => {
		it("should return nearby bins from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params = { lat: 40.4168, lng: -3.7038, radiusKm: 1, limit: 10 };
			const mockBins: BinRecord[] = [];

			vi.mocked(binsRepository.findNearby).mockResolvedValue(mockBins);

			// Act
			const result = await getBinsNearby(binType, params);

			// Assert
			expect(result).toEqual([]);
			expect(binsRepository.findNearby).toHaveBeenCalledWith(binType, params);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const params = { lat: 40.4168, lng: -3.7038, radiusKm: 1, limit: 10 };
			const errorMessage = TEST_ERROR_MESSAGES.GEOSPATIAL_QUERY_FAILED;
			vi.mocked(binsRepository.findNearby).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(getBinsNearby(binType, params)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("getBinsCountsHierarchy", () => {
		it("should return counts hierarchy from repository", async () => {
			// Arrange
			const binType = "clothing_bins";
			const mockCounts = [
				{ distrito: "CENTRO", barrio: "PALACIO", count: 2 },
				{ distrito: "CENTRO", barrio: "CHUECA", count: 1 },
			];

			vi.mocked(binsRepository.getCountsHierarchy).mockResolvedValue(mockCounts);

			// Act
			const result = await getBinsCountsHierarchy(binType);

			// Assert
			expect(result).toEqual(mockCounts);
			expect(binsRepository.getCountsHierarchy).toHaveBeenCalledWith(binType);
		});

		it("should return empty array when repository returns empty data", async () => {
			// Arrange
			const binType = "clothing_bins";
			vi.mocked(binsRepository.getCountsHierarchy).mockResolvedValue([]);

			// Act
			const result = await getBinsCountsHierarchy(binType);

			// Assert
			expect(result).toEqual([]);
			expect(binsRepository.getCountsHierarchy).toHaveBeenCalledWith(binType);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.AGGREGATION_FAILED;
			vi.mocked(binsRepository.getCountsHierarchy).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(getBinsCountsHierarchy(binType)).rejects.toThrow(
				`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("insertBins", () => {
		it("should insert bins successfully", async () => {
			// Arrange
			const binType = "clothing_bins";
			const binsToInsert = mockBins.map(convertToBinRecord);

			const mockResult = { inserted: 1, errors: [] };
			vi.mocked(binsRepository.insertMany).mockResolvedValue(mockResult);

			// Act
			const result = await insertBins(binType, binsToInsert);

			// Assert
			expect(result).toEqual(mockResult);
			expect(binsRepository.insertMany).toHaveBeenCalledWith(binType, binsToInsert);
		});

		it("should handle insertion errors", async () => {
			// Arrange
			const binType = "clothing_bins";
			const binsToInsert = mockBins.map(convertToBinRecord);
			const mockResult = {
				inserted: 0,
				errors: [{ batch: 1, error: "Insert failed" }],
			};
			vi.mocked(binsRepository.insertMany).mockResolvedValue(mockResult);

			// Act
			const result = await insertBins(binType, binsToInsert);

			// Assert
			expect(result).toEqual(mockResult);
			expect(binsRepository.insertMany).toHaveBeenCalledWith(binType, binsToInsert);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const binsToInsert = mockBins.map(convertToBinRecord);
			const errorMessage = TEST_ERROR_MESSAGES.DATABASE_ERROR;
			vi.mocked(binsRepository.insertMany).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(insertBins(binType, binsToInsert)).rejects.toThrow(
				`${ERROR_MESSAGES.DATA_INSERTION_FAILED}: ${errorMessage}`,
			);
		});
	});

	describe("clearBins", () => {
		it("should clear bins successfully", async () => {
			// Arrange
			const binType = "clothing_bins";
			vi.mocked(binsRepository.deleteAll).mockResolvedValue(undefined);

			// Act
			const result = await clearBins(binType);

			// Assert
			expect(result).toBeUndefined();
			expect(binsRepository.deleteAll).toHaveBeenCalledWith(binType);
		});

		it("should throw error when repository fails", async () => {
			// Arrange
			const binType = "clothing_bins";
			const errorMessage = TEST_ERROR_MESSAGES.DELETE_FAILED;
			vi.mocked(binsRepository.deleteAll).mockRejectedValue(new Error(errorMessage));

			// Act & Assert
			await expect(clearBins(binType)).rejects.toThrow(`${ERROR_MESSAGES.DATA_DELETION_FAILED}: ${errorMessage}`);
		});
	});
});
