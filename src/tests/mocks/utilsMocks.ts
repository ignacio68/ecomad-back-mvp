import { StatusCodes } from "http-status-codes";
import { vi } from "vitest";

// Mock de geoUtils
export const mockGeoUtils = {
	calculateSearchRadius: vi.fn((radius: number) => radius * 1000),
	sortByDistance: vi.fn((items: any[]) => items),
};

// Mock de validateCSV
export const mockValidateCSV = vi.fn();

// Mock de ServiceResponse
export const mockServiceResponse = {
	success: vi.fn((message: string, data: unknown, statusCode: number = StatusCodes.OK) => ({
		success: true,
		responseObject: data,
		message,
		statusCode,
	})),
	failure: vi.fn((message: string, data: unknown = null, statusCode: number = StatusCodes.BAD_REQUEST) => ({
		success: false,
		responseObject: data,
		message,
		statusCode,
	})),
};
