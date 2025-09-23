/**
 * Tipos de respuesta específicos para el módulo de bins
 * Estos tipos son específicos de las respuestas de la API de bins
 */

import type { BinRecord } from "./binTypes";

// Respuesta jerárquica de conteos por distrito y barrio
export interface BinsCountsHierarchy {
	data: Array<{
		name: string;
		count: number;
		neighborhoods: Array<{ name: string; count: number }>;
	}>;
	statusCode: number;
}

// Respuesta de inserción de contenedores
export interface InsertBinsResponse {
	success: number;
	errors: Array<{ batch: number; error?: unknown }>;
	statusCode: number;
}

// Respuesta de eliminación de contenedores
export interface ClearBinsResponse {
	success: boolean;
	error?: unknown;
	statusCode: number;
}

// Respuesta genérica del servicio
export interface ServiceResponse<T> {
	data: T;
	statusCode: number;
}

// Respuesta de conteo
export interface CountResponse {
	count: number;
	statusCode: number;
}

// Respuesta de array de contenedores
export interface BinsArrayResponse {
	data: BinRecord[];
	statusCode: number;
}
