/**
 * Tipos básicos y comunes para contenedores de reciclaje
 * Estos tipos son reutilizables en toda la API
 */

// Tipo para los contenedores en la base de datos
export interface BinRecord {
	tipo_dato: string;
	lote: string;
	cod_dist: string;
	distrito: string;
	cod_barrio: string;
	barrio: string;
	direccion_completa: string;
	via_clase: string;
	via_par: string;
	via_nombre: string;
	tipo_numero: string;
	numero: string;
	latitud: number;
	longitud: number;
	direccion_completa_ampliada: string;
	mas_informacion: string;
	created_at?: string;
	updated_at?: string;
}

// Tipos de contenedores válidos
export type BinType =
	| "clothing_bins"
	| "oil_bins"
	| "glass_bins"
	| "paper_bins"
	| "plastic_bins"
	| "organic_bins"
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
