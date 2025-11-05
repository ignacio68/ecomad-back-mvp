import { supabase } from "@/api/common/lib/supabase";
import { ERROR_MESSAGES } from "@/api/v1/bins/constants/errorMessages";
import type { CountsHierarchyResult, InsertManyResult } from "@/api/v1/bins/repositories/types";
import type { BinRecord, LocationParams, NearbyParams } from "@/api/v1/bins/types/binTypes";

/**
 * Repository para operaciones de datos con Supabase
 * Maneja únicamente el acceso a datos, sin lógica de negocio
 */
export class BinsRepository {
	/**
	 * Obtiene todos los contenedores de un tipo específico
	 * Usa paginación para obtener todos los registros (Supabase limita a 1000 por defecto)
	 */
	async findAll(binType: string): Promise<BinRecord[]> {
		const allData: BinRecord[] = [];
		const pageSize = 1000;
		let offset = 0;
		let hasMore = true;

		while (hasMore) {
			const { data, error } = await supabase
				.from(binType)
				.select("*")
				.order("district_id", { ascending: true })
				.order("neighborhood_id", { ascending: true })
				.range(offset, offset + pageSize - 1);

			if (error) {
				throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
			}

			if (data && data.length > 0) {
				allData.push(...data);
				offset += pageSize;
				hasMore = data.length === pageSize; // Si obtenemos menos de pageSize, no hay más datos
			} else {
				hasMore = false;
			}
		}

		return allData;
	}

	/**
	 * Cuenta el total de contenedores de un tipo específico
	 */
	async count(binType: string): Promise<number> {
		const { count, error } = await supabase.from(binType).select("*", { count: "exact", head: true });

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		return count || 0;
	}

	/**
	 * Obtiene contenedores por ubicación (distrito o barrio)
	 */
	async findByLocation(binType: string, params: LocationParams): Promise<BinRecord[]> {
		const { locationType, locationValue, page = 1, limit = 100 } = params;
		const offset = (page - 1) * limit;
		const columnName = locationType === "district" ? "district_id" : "neighborhood_id";

		const { data, error } = await supabase
			.from(binType)
			.select("*")
			.eq(columnName, locationValue)
			.order("district_id", { ascending: true })
			.order("neighborhood_id", { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Obtiene contenedores cercanos a una coordenada
	 * Usa la función PostgreSQL find_nearby_bins con earthdistance extension
	 */
	async findNearby(binType: string, params: NearbyParams): Promise<BinRecord[]> {
		const { lat, lng, radius, limit = 100 } = params;

		// Llamar a la función PostgreSQL optimizada
		const { data, error } = await supabase.rpc("find_nearby_bins", {
			p_table_name: binType,
			p_lat: lat,
			p_lng: lng,
			p_radius_km: radius,
			p_limit: limit,
		});

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		// La función ya devuelve los bins ordenados por distancia
		// Remover el campo distance_km antes de devolver (es solo para ordenar)
		return (data || []).map(({ distance_km: _distance, ...bin }: any) => bin) as BinRecord[];
	}

	/**
	 * Obtiene conteos jerárquicos por distrito y barrio
	 */
	async getCountsHierarchy(binType: string): Promise<CountsHierarchyResult[]> {
		const { data, error } = await supabase.from(binType).select("district_id, neighborhood_id");

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		if (!data) return [];

		// Agrupar y contar
		const counts = new Map<string, number>();
		data.forEach((bin) => {
			const key = `${bin.district_id}-${bin.neighborhood_id || "null"}`;
			counts.set(key, (counts.get(key) || 0) + 1);
		});

		// Convertir a array con nombres de distrito y barrio (IDs por ahora)
		return Array.from(counts.entries()).map(([key, count]) => {
			const [districtId, neighborhoodId] = key.split("-");
			return {
				distrito: districtId,
				barrio: neighborhoodId === "null" ? "" : neighborhoodId,
				count,
			};
		});
	}

	/**
	 * Inserta múltiples contenedores
	 */
	async insertMany(binType: string, bins: BinRecord[]): Promise<InsertManyResult> {
		const batchSize = 1000;
		const errors: Array<{ batch: number; error: unknown }> = [];
		let totalInserted = 0;

		for (let i = 0; i < bins.length; i += batchSize) {
			const batch = bins.slice(i, i + batchSize);
			const batchNumber = Math.floor(i / batchSize) + 1;

			try {
				const { error } = await supabase.from(binType).insert(batch);

				if (error) {
					errors.push({ batch: batchNumber, error });
				} else {
					totalInserted += batch.length;
				}
			} catch (err) {
				errors.push({ batch: batchNumber, error: err });
			}
		}

		return { inserted: totalInserted, errors };
	}

	/**
	 * Elimina todos los contenedores de un tipo específico
	 */
	async deleteAll(binType: string): Promise<void> {
		const { error } = await supabase.from(binType).delete().neq("id", 0); // Eliminar todos los registros

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATA_DELETION_FAILED}: ${error.message}`);
		}
	}
}

// Instancia singleton del repository
export const binsRepository = new BinsRepository();
