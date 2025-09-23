import { z } from "zod";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { binsRepository } from "../repositories";
import type { BinRecord, BinType, LocationParams, NearbyParams } from "../types/binTypes";

/**
 * Servicio de lógica de negocio para contenedores
 * Solo contiene lógica de negocio, sin códigos HTTP ni acceso directo a datos
 */

// Constante con los tipos válidos de contenedores
const BIN_TYPES: BinType[] = [
	"clothing_bins",
	"oil_bins",
	"glass_bins",
	"paper_bins",
	"plastic_bins",
	"organic_bins",
	"other_bins",
];

// Validación de binType usando type guard
const validateBinType = (value: string): value is BinType => {
	return (BIN_TYPES as string[]).includes(value);
};

/**
 * Obtiene todos los contenedores de un tipo específico
 */
export const getAllBins = async (binType: string): Promise<BinRecord[]> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z.object({ binType: z.string().min(1) }).parse({ binType });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		return await binsRepository.findAll(validatedParams.binType);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Cuenta el total de contenedores de un tipo específico
 */
export const getBinsCount = async (binType: string): Promise<{ count: number }> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z.object({ binType: z.string().min(1) }).parse({ binType });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		const count = await binsRepository.count(validatedParams.binType);
		return { count };
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Obtiene contenedores por ubicación (distrito o barrio)
 */
export const getBinsByLocation = async (binType: string, params: LocationParams): Promise<BinRecord[]> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z
			.object({
				binType: z.string().min(1),
				locationType: z.enum(["district", "neighborhood"]),
				locationValue: z.string().min(1),
				page: z.number().int().positive().optional(),
				limit: z.number().int().positive().max(1000).optional(),
			})
			.parse({ binType, ...params });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		return await binsRepository.findByLocation(validatedParams.binType, params);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Obtiene contenedores cercanos a una coordenada
 */
export const getBinsNearby = async (binType: string, params: NearbyParams): Promise<BinRecord[]> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z
			.object({
				binType: z.string().min(1),
				lat: z.number().min(-90).max(90),
				lng: z.number().min(-180).max(180),
				radiusKm: z.number().positive().max(100),
				limit: z.number().int().positive().max(1000).optional(),
			})
			.parse({ binType, ...params });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		return await binsRepository.findNearby(validatedParams.binType, params);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Obtiene conteos jerárquicos por distrito y barrio
 */
export const getBinsCountsHierarchy = async (
	binType: string,
): Promise<
	Array<{
		distrito: string;
		barrio: string;
		count: number;
	}>
> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z.object({ binType: z.string().min(1) }).parse({ binType });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		return await binsRepository.getCountsHierarchy(validatedParams.binType);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Inserta múltiples contenedores
 */
export const insertBins = async (
	binType: string,
	bins: BinRecord[],
): Promise<{
	inserted: number;
	errors: Array<{ batch: number; error: unknown }>;
}> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z
			.object({
				binType: z.string().min(1),
				bins: z.array(z.object({})).min(1),
			})
			.parse({ binType, bins });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		return await binsRepository.insertMany(validatedParams.binType, bins);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATA_INSERTION_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

/**
 * Elimina todos los contenedores de un tipo específico
 */
export const clearBins = async (binType: string): Promise<void> => {
	try {
		// Validar parámetros de entrada
		const validatedParams = z.object({ binType: z.string().min(1) }).parse({ binType });

		// Validar que el binType es válido
		if (!validateBinType(validatedParams.binType)) {
			throw new Error(`${ERROR_MESSAGES.INVALID_BIN_TYPE}: ${validatedParams.binType}`);
		}

		// Llamar al repository
		await binsRepository.deleteAll(validatedParams.binType);
	} catch (error) {
		throw new Error(
			`${ERROR_MESSAGES.DATA_DELETION_FAILED}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};
