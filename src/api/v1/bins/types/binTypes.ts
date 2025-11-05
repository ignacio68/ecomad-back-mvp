/**
 * Tipos básicos y comunes para contenedores de reciclaje
 * Estos tipos son reutilizables en toda la API
 */

// Tipo para los contenedores en la base de datos (esquema real de Supabase)
// NOTA: lat y lng vienen como string desde Supabase (tipo numeric) y se convierten a number
export interface BinRecord {
	id: number;
	category_group_id: number;
	category_id: number;
	district_id: number;
	neighborhood_id?: number | null;
	address: string;
	lat: number | string; // Numeric en Supabase se devuelve como string
	lng: number | string; // Numeric en Supabase se devuelve como string
	load_type?: string | null;
	direction?: string | null;
	subtype?: string | null;
	placement_type?: string | null;
	notes?: string | null;
	bus_stop?: string | null;
	interurban_node?: string | null;
	created_at: string;
	updated_at: string;
}

// Tipos de contenedores válidos
export type BinType =
	| "clothing_bins"
	| "oil_bins"
	| "glass_bins"
	| "paper_bins"
	| "plastic_bins"
	| "organic_bins"
	| "battery_bins"
	| "other_bins";

// Tipos de ubicación para búsquedas
export type LocationType = "district" | "neighborhood";

// Parámetros para búsquedas por ubicación
export interface LocationParams {
	locationType: LocationType;
	locationValue: string;
	page: number;
	limit: number;
}

// Parámetros para búsquedas cercanas
export interface NearbyParams {
	lat: number;
	lng: number;
	radius: number;
	limit: number;
}

// Parámetros de paginación
export interface PaginationParams {
	page: number;
	limit: number;
}

// Coordenadas geográficas
export interface Coordinates {
	lat: number;
	lng: number;
}

// Tipos para validación de parámetros
export interface BinQueryParams {
	lat?: string;
	lng?: string;
	radius?: string;
	limit?: string;
	page?: string;
}

export interface BinRouteParams {
	binType: string;
	locationType?: string;
	locationValue?: string;
}
