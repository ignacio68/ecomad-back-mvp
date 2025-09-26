import { supabase } from "../../../common/lib/supabase";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { BinRecord, LocationParams, NearbyParams } from "../types/binTypes";
import type { CountsHierarchyResult, InsertManyResult } from "./types";

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
				.order("distrito", { ascending: true })
				.order("barrio", { ascending: true })
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
		const columnName = locationType === "district" ? "distrito" : "barrio";

		const { data, error } = await supabase
			.from(binType)
			.select("*")
			.eq(columnName, locationValue)
			.order("distrito", { ascending: true })
			.order("barrio", { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Obtiene contenedores cercanos a una coordenada
	 */
	async findNearby(binType: string, params: NearbyParams): Promise<BinRecord[]> {
		const { lat, lng, radius, limit = 100 } = params;
		// Supabase no tiene soporte nativo para consultas geoespaciales complejas
		// Obtenemos todos los datos y los filtramos en memoria (no ideal para grandes datasets)
		const { data, error } = await supabase
			.from(binType)
			.select("*")
			.not("latitud", "is", null)
			.not("longitud", "is", null)
			.limit(limit * 2); // Obtenemos más datos para compensar el filtrado en memoria

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		if (!data) return [];

		// Filtrar por distancia (esto debería moverse a una función de utilidad)
		const nearbyBins = data.filter((bin) => {
			if (!bin.latitud || !bin.longitud) return false;

			const distance = this.calculateDistance(lat, lng, parseFloat(bin.latitud), parseFloat(bin.longitud));

			return distance <= radius;
		});

		// Ordenar por distancia y limitar (usando sort con copia para inmutabilidad)
		return [...nearbyBins]
			.sort((a, b) => {
				const distanceA = this.calculateDistance(lat, lng, parseFloat(a.latitud), parseFloat(a.longitud));
				const distanceB = this.calculateDistance(lat, lng, parseFloat(b.latitud), parseFloat(b.longitud));
				return distanceA - distanceB;
			})
			.slice(0, limit);
	}

	/**
	 * Obtiene conteos jerárquicos por distrito y barrio
	 */
	async getCountsHierarchy(binType: string): Promise<CountsHierarchyResult[]> {
		const { data, error } = await supabase.from(binType).select("distrito, barrio");

		if (error) {
			throw new Error(`${ERROR_MESSAGES.DATABASE_QUERY_FAILED}: ${error.message}`);
		}

		if (!data) return [];

		// Agrupar y contar
		const counts = new Map<string, number>();
		data.forEach((bin) => {
			const key = `${bin.distrito}-${bin.barrio}`;
			counts.set(key, (counts.get(key) || 0) + 1);
		});

		// Convertir a array
		return Array.from(counts.entries()).map(([key, count]) => {
			const [distrito, barrio] = key.split("-");
			return { distrito, barrio, count };
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

	/**
	 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
	 * @private
	 */
	private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // Radio de la Tierra en km
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}
}

// Instancia singleton del repository
export const binsRepository = new BinsRepository();
