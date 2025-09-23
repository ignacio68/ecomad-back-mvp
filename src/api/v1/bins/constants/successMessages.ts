export const SUCCESS_MESSAGES = {
	BINS_RETRIEVED: "Contenedores obtenidos exitosamente",
	NO_BINS_FOUND: "No se encontraron contenedores",
	COUNT_RETRIEVED: "Conteo de contenedores obtenido exitosamente",
	LOCATION_BINS_RETRIEVED: "Contenedores de la ubicación obtenidos exitosamente",
	NO_LOCATION_DATA: "No se encontraron contenedores en la ubicación especificada",
	NEARBY_BINS_RETRIEVED: "Contenedores cercanos obtenidos exitosamente",
	NO_NEARBY_DATA: "No se encontraron contenedores cercanos",
	HIERARCHY_RETRIEVED: "Conteos jerárquicos obtenidos exitosamente",
	NO_HIERARCHY_DATA: "No se encontraron datos para generar conteos jerárquicos",
	DATA_LOADED: "Datos cargados exitosamente",
	DATA_CLEARED: "Datos eliminados exitosamente",
	DEBUG_SUCCESS: "Debug exitoso",
} as const;

export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];
