/**
 * Utilidades para cálculos geográficos
 */

/**
 * Convierte grados a radianes
 */
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lng1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lng2 Longitud del segundo punto
 * @returns Distancia en metros
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
	const R = 6371000; // Radio de la Tierra en metros
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

	const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
	return R * c;
};

/**
 * Ordena un array de objetos con coordenadas por distancia a un punto de referencia
 * @param items Array de objetos que contienen latitud y longitud
 * @param referenceLat Latitud del punto de referencia
 * @param referenceLng Longitud del punto de referencia
 * @returns Array ordenado por distancia (más cercano primero)
 */
export const sortByDistance = <T extends { latitud: number; longitud: number }>(
	items: T[],
	referenceLat: number,
	referenceLng: number,
): T[] => {
	return items.sort((a, b) => {
		const distA = calculateDistance(referenceLat, referenceLng, a.latitud, a.longitud);
		const distB = calculateDistance(referenceLat, referenceLng, b.latitud, b.longitud);
		return distA - distB;
	});
};

/**
 * Calcula el radio de búsqueda aproximado en grados para un radio en kilómetros
 * @param radiusKm Radio en kilómetros
 * @param latitude Latitud de referencia (para ajustar la longitud)
 * @returns Objeto con diferencias de latitud y longitud en grados
 */
export const calculateSearchRadius = (radiusKm: number, latitude: number): { latDiff: number; lngDiff: number } => {
	const latDiff = radiusKm / 111; // 1 grado ≈ 111 km
	const lngDiff = radiusKm / (111 * Math.cos(toRadians(latitude)));

	return { latDiff, lngDiff };
};
