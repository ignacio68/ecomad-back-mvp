/**
 * Tipos específicos para el Repository de contenedores
 */

export interface InsertManyResult {
	inserted: number;
	errors: Array<{
		batch: number;
		error: unknown;
	}>;
}

export interface CountsHierarchyResult {
	distrito: string;
	barrio: string;
	count: number;
}
