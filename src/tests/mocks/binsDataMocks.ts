// Datos de prueba comunes para tests de bins
export const mockBins = [
	{
		tipo_dato: "PUNTO LIMPIO",
		lote: "1",
		cod_dist: "1",
		distrito: "CENTRO",
		cod_barrio: "1",
		barrio: "PALACIO",
		direccion_completa: "CALLE MAYOR 1",
		via_clase: "CALLE",
		via_par: "IMPAR",
		via_nombre: "MAYOR",
		tipo_numero: "NÚMERO",
		numero: "1",
		latitud: 40.4168,
		longitud: -3.7038,
		direccion_completa_ampliada: "CALLE MAYOR 1, 28013 MADRID",
		mas_informacion: "Contenedor textil",
	},
	{
		tipo_dato: "PUNTO LIMPIO",
		lote: "1",
		cod_dist: "1",
		distrito: "CENTRO",
		cod_barrio: "2",
		barrio: "CHUECA",
		direccion_completa: "CALLE FUENCARRAL 25",
		via_clase: "CALLE",
		via_par: "IMPAR",
		via_nombre: "FUENCARRAL",
		tipo_numero: "NÚMERO",
		numero: "25",
		latitud: 40.4258,
		longitud: -3.7018,
		direccion_completa_ampliada: "CALLE FUENCARRAL 25, 28004 MADRID",
		mas_informacion: "Contenedor textil",
	},
];

export const mockCsvBins = [
	{
		TIPO_DATO: "PUNTO LIMPIO",
		LOTE: "1",
		COD_DIST: "1",
		DISTRITO: "CENTRO",
		COD_BARRIO: "1",
		BARRIO: "PALACIO",
		DIRECCION_COMPLETA: "CALLE MAYOR 1",
		VIA_CLASE: "CALLE",
		VIA_PAR: "IMPAR",
		VIA_NOMBRE: "MAYOR",
		TIPO_NUMERO: "NÚMERO",
		NUMERO: "1",
		LATITUD: 40.4168,
		LONGITUD: -3.7038,
		"DIRECCIÓN COMPLETA AMPLIADA": "CALLE MAYOR 1, 28013 MADRID",
		"MÁS INFORMACIÓN": "Contenedor textil",
	},
];

// Datos crudos de Supabase para getBinsCountsHierarchy
export const mockHierarchyRawData = [
	{ distrito: "CENTRO", barrio: "PALACIO" },
	{ distrito: "CENTRO", barrio: "PALACIO" },
	{ distrito: "CENTRO", barrio: "CHUECA" },
	{ distrito: "CENTRO", barrio: "CHUECA" },
	{ distrito: "CENTRO", barrio: "CHUECA" },
];

// Estructura final esperada después del procesamiento (estructura plana)
export const mockHierarchy = [
	{ distrito: "CENTRO", barrio: "PALACIO", count: 2 },
	{ distrito: "CENTRO", barrio: "PALACIO", count: 1 },
	{ distrito: "CENTRO", barrio: "CHUECA", count: 2 },
	{ distrito: "CENTRO", barrio: "CHUECA", count: 1 },
	{ distrito: "CENTRO", barrio: "CHUECA", count: 1 },
];
