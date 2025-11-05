import { z } from "zod";

// Schema para datos CSV (formato original)
export const csvBinSchema = z.object({
	TIPO_DATO: z.string(),
	LOTE: z.string().or(z.number().transform(Number)),
	COD_DIST: z.string().or(z.number().transform(Number)),
	DISTRITO: z.string(),
	COD_BARRIO: z.string().or(z.number().transform(Number)),
	BARRIO: z.string(),
	DIRECCION_COMPLETA: z.string(),
	VIA_CLASE: z.string(),
	VIA_PAR: z.string(),
	VIA_NOMBRE: z.string(),
	TIPO_NUMERO: z.string(),
	NUMERO: z.string(),
	LATITUD: z
		.union([z.string(), z.number()])
		.transform((val) => (typeof val === "string" ? parseFloat(val.replace(",", ".")) : val)),
	LONGITUD: z
		.union([z.string(), z.number()])
		.transform((val) => (typeof val === "string" ? parseFloat(val.replace(",", ".")) : val)),
	"DIRECCIÓN COMPLETA AMPLIADA": z.string(),
	"MÁS INFORMACIÓN": z.string(),
});

// Schema para datos de la base de datos (esquema real de Supabase)
export const binSchema = z.object({
	id: z.number().int(),
	category_group_id: z.number().int(),
	category_id: z.number().int(),
	district_id: z.number().int(),
	neighborhood_id: z.number().int().nullable().optional(),
	address: z.string(),
	lat: z.number(),
	lng: z.number(),
	load_type: z.string().nullable().optional(),
	direction: z.string().nullable().optional(),
	subtype: z.string().nullable().optional(),
	placement_type: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	bus_stop: z.string().nullable().optional(),
	interurban_node: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

// Schema para validar la respuesta jerárquica de conteos
export const neighborhoodCountSchema = z.object({
	name: z.string(),
	count: z.number().int().min(0),
});

export const districtCountSchema = z.object({
	name: z.string(),
	count: z.number().int().min(0),
	neighborhoods: z.array(neighborhoodCountSchema),
});

export const binsCountsHierarchySchema = z.object({
	data: z.array(districtCountSchema),
	statusCode: z.number().int().min(200).max(599).default(200),
});

// Schema para validar el conteo total
export const binsTotalCountSchema = z.object({
	count: z.number().int().min(0),
	statusCode: z.number().int().min(200).max(599).default(200),
});

// Schema para validar un array de bins
export const binsArraySchema = z.object({
	data: z.array(binSchema),
	statusCode: z.number().int().min(200).max(599).default(200),
});

// Schema para validar parámetros de paginación
export const paginationParamsSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(1000).default(1000),
});

// Schema para validar coordenadas
export const coordinatesSchema = z.object({
	binType: z.string().min(1),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	radiusKm: z.number().min(0.1).max(100).default(5),
	limit: z.number().int().min(1).max(1000).default(1000),
});

// Schema para validar parámetros de inserción
export const insertBinsParamsSchema = z.object({
	binType: z.string().min(1),
	bins: z.array(csvBinSchema).min(1),
});

// Schema para errores de inserción
export const insertErrorSchema = z.object({
	batch: z.number().int().min(1),
	error: z.unknown(),
});

// Schema para validar respuesta de inserción
export const insertBinsResponseSchema = z.object({
	success: z.number().int().min(0),
	errors: z.array(insertErrorSchema),
	statusCode: z.number().int().min(200).max(599).default(200),
});

// Schema para validar respuesta de limpieza
export const clearBinsResponseSchema = z.object({
	success: z.boolean(),
	error: z.unknown().optional(),
	statusCode: z.number().int().min(200).max(599).default(200),
});

// Schema para parámetros de ubicación
export const locationParamsSchema = z.object({
	locationType: z.enum(["district", "neighborhood"]),
	locationValue: z.string().min(1),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(1000).default(1000),
});

// Schema para parámetros de coordenadas (sin binType)
export const nearbyParamsSchema = z.object({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	radiusKm: z.number().min(0.05).max(50).default(5),
	limit: z.number().int().min(1).max(1000).default(1000),
});

// Tipos TypeScript derivados de los schemas
export type CsvBin = z.infer<typeof csvBinSchema>;
export type BinData = z.infer<typeof binSchema>;
export type InsertError = z.infer<typeof insertErrorSchema>;
export type InsertBinsResponse = z.infer<typeof insertBinsResponseSchema>;
export type ClearBinsResponse = z.infer<typeof clearBinsResponseSchema>;
export type BinsCountsHierarchy = z.infer<typeof binsCountsHierarchySchema>;
export type NeighborhoodCount = z.infer<typeof neighborhoodCountSchema>;
export type DistrictCount = z.infer<typeof districtCountSchema>;
export type LocationParams = z.infer<typeof locationParamsSchema>;
export type NearbyParams = z.infer<typeof nearbyParamsSchema>;
