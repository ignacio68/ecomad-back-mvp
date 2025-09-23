/**
 * Constantes para mensajes de error del módulo bins
 * Evita dependencias de texto parcial en el manejo de errores
 */

export const ERROR_MESSAGES = {
	// Errores de validación (400)
	INVALID_BIN_TYPE: "Tipo de contenedor inválido",
	INVALID_PARAMETER: "Parámetro inválido",
	INVALID_LOCATION_PARAMS: "Parámetros de ubicación inválidos",
	INVALID_COORDINATES: "Coordenadas inválidas",
	INVALID_COORDINATES_DETAIL: "Los parámetros 'lat', 'lng' y 'radius' deben ser números válidos",
	INVALID_CSV_DATA: "Datos CSV inválidos",
	MISSING_REQUIRED_FIELD: "Campo requerido faltante",
	MISSING_LAT_LNG: "Los parámetros 'lat' y 'lng' son requeridos",
	MISSING_CSV_DATA: "Datos CSV requeridos en el body",
	NO_VALID_CSV_RECORDS: "No se encontraron registros válidos en el CSV",
	NO_BIN_TYPE_FOUND: "No se pudo determinar el tipo de contenedor desde la URL",

	// Errores de datos no encontrados (404)
	NO_BINS_FOUND: "No se encontraron contenedores",
	NO_LOCATION_DATA: "No se encontraron datos para la ubicación",
	NO_NEARBY_DATA: "No se encontraron contenedores cercanos",
	NO_HIERARCHY_DATA: "No se encontraron datos para generar conteos jerárquicos",

	// Errores de base de datos/sistema (500)
	DATABASE_CONNECTION_FAILED: "Error de conexión a la base de datos",
	DATABASE_QUERY_FAILED: "Error en la consulta a la base de datos",
	DATA_INSERTION_FAILED: "Error al insertar datos",
	DATA_DELETION_FAILED: "Error al eliminar datos",
	EXTERNAL_API_ERROR: "Error en servicio externo",
	UNKNOWN_SYSTEM_ERROR: "Error interno del sistema",
} as const;

// Constantes para mensajes de error específicos (usados en tests)
export const TEST_ERROR_MESSAGES = {
	CONNECTION_FAILED: "Connection failed",
	DATABASE_ERROR: "Database error",
	QUERY_FAILED: "Query failed",
	GEOSPATIAL_QUERY_FAILED: "Geospatial query failed",
	AGGREGATION_FAILED: "Aggregation failed",
	DELETE_FAILED: "Delete failed",
} as const;

// Tipos para TypeScript
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type TestErrorMessage = (typeof TEST_ERROR_MESSAGES)[keyof typeof TEST_ERROR_MESSAGES];
