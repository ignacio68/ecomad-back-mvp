import { vi } from "vitest";

// Mock de Request de Express
export const createMockRequest = (overrides: Partial<any> = {}) => ({
	params: { binType: "clothing_bins" },
	query: {},
	body: {},
	binType: "clothing_bins", // Set by middleware
	...overrides,
});

// Mock de Response de Express
export const createMockResponse = () => {
	const mockJson = vi.fn().mockReturnThis();
	const mockStatus = vi.fn().mockReturnThis();
	const mockSetHeader = vi.fn().mockReturnThis();

	return {
		status: mockStatus,
		json: mockJson,
		setHeader: mockSetHeader,
		// Para poder acceder a los mocks en los tests
		_mockJson: mockJson,
		_mockStatus: mockStatus,
		_mockSetHeader: mockSetHeader,
	};
};
