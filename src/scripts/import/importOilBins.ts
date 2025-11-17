/**
 * Script de importación para contenedores de ACEITE
 * CSV: RecogidaContenedoresAceiteUsado.csv
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

// ES modules: obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: ".env.development" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error("❌ Missing required environment variables");
	console.error("SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
	console.error("SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌");
	process.exit(1);
}

// Cliente de Supabase con SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Configuración del CSV
const CSV_PATH = path.join(__dirname, "../../../data/csv/RecogidaContenedoresAceiteUsado.csv");
const TABLE_NAME = "oil_bins";
const CATEGORY_GROUP_ID = 1; // Contenedores
const CATEGORY_ID = 15; // Aceite
const CHUNK_SIZE = 1000;

/**
 * Normaliza texto eliminando caracteres corruptos y manteniendo tildes correctas
 * Usa un diccionario de palabras comunes en español para determinar la vocal correcta
 */
const normalizeText = (text: string): string => {
	if (!text) return "";

	// Diccionario de palabras comunes con sus tildes correctas
	const wordReplacements: Record<string, string> = {
		// Nombres propios y lugares
		"Mar�a": "María",
		"Jos�": "José",
		"Ram�n": "Ramón",
		"Andr�s": "Andrés",
		"Nicol�s": "Nicolás",
		"Jes�s": "Jesús",
		"Tom�s": "Tomás",
		"Do�a": "Doña",
		"Francsico Jos�": "Francisco José",

		// Apellidos
		"P�rez": "Pérez",
		"L�pez": "López",
		"Mart�nez": "Martínez",
		"Mart�n": "Martín",
		"Fern�ndez": "Fernández",
		"Gonz�lez": "González",
		"Hern�ndez": "Hernández",
		"V�zquez": "Vázquez",
		"S�nchez": "Sánchez",
		"Salmer�n": "Salmerón",
		"Acu�a": "Acuña",
		"Cort�zar": "Cortázar",
		"Garc�a": "García",
		"�lvarez": "Álvarez",
		"Jim�nez": "Jiménez",

		// Palabras comunes
		"V�a": "Vía",
		"P�blica": "Pública",
		"P�blico": "Público",
		"Ca�ada": "Cañada",
		"S�ptima": "Séptima",
		"D�cima": "Décima",
		"Coraz�n": "Corazón",
		"Estaci�n": "Estación",
		"Arag�n": "Aragón",
		"Le�n": "León",
		"Carri�n": "Carrión",
		"Bolta�a": "Boltaña",
		"Alhaur�n": "Alhaurín",
		"Gij�n": "Gijón",
		"Jal�n": "Jalón",
		"Ucl�s": "Uclés",
		"Concepci�n": "Concepción",
		"El�ctrica": "Eléctrica",
		"Mediterr�neo": "Mediterráneo",
		"�guilas": "Águilas",

		// Minúsculas
		"mar�a": "maría",
		"jos�": "josé",
		"v�a": "vía",
		"p�blica": "pública",
		"p�blico": "público",
		"ca�ada": "cañada",
		"estaci�n": "estación",
	};

	let normalized = text;

	// Aplicar reemplazos de palabras conocidas (case-insensitive)
	for (const [corrupted, correct] of Object.entries(wordReplacements)) {
		const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		normalized = normalized.replace(regex, (match) => {
			// Preservar mayúsculas/minúsculas del original
			if (match[0] === match[0].toUpperCase()) {
				return correct.charAt(0).toUpperCase() + correct.slice(1);
			}
			return correct;
		});
	}

	return normalized.trim();
};

/**
 * Normaliza el nombre del distrito eliminando tildes, caracteres especiales y espacios extra
 */
const normalizeDistrictName = (name: string): string => {
	let normalized = name
		.toUpperCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
		.replace(/\s*-\s*/g, "-") // Normalizar guiones (eliminar espacios)
		.replace(/\s+/g, " "); // Normalizar espacios múltiples

	// Reemplazos específicos para caracteres corruptos conocidos (ANTES de eliminar caracteres especiales)
	normalized = normalized
		.replace(/CHAMART.N/gi, "CHAMARTIN")
		.replace(/CHAMBER./gi, "CHAMBERI")
		.replace(/TETU.N/gi, "TETUAN")
		.replace(/VIC.LVARO/gi, "VICALVARO");

	// Eliminar caracteres no alfanuméricos (excepto espacios y guiones)
	normalized = normalized.replace(/[^\w\s-]/g, "");

	return normalized;
};

// Mapeo de nombres de distrito a códigos (sin tildes)
const DISTRICT_NAME_TO_CODE: Record<string, string> = {
	CENTRO: "01",
	ARGANZUELA: "02",
	RETIRO: "03",
	SALAMANCA: "04",
	CHAMARTIN: "05",
	TETUAN: "06",
	CHAMBERI: "07",
	"FUENCARRAL-EL PARDO": "08",
	"MONCLOA-ARAVACA": "09",
	LATINA: "10",
	CARABANCHEL: "11",
	USERA: "12",
	"PUENTE DE VALLECAS": "13",
	MORATALAZ: "14",
	"CIUDAD LINEAL": "15",
	HORTALEZA: "16",
	VILLAVERDE: "17",
	"VILLA DE VALLECAS": "18",
	VICALVARO: "19",
	"SAN BLAS-CANILLEJAS": "20",
	BARAJAS: "21",
};

/**
 * Elimina BOM y limpia las claves
 */
const removeBOM = (str: string): string => {
	if (str.codePointAt(0) === 0xfeff) {
		return str.slice(1);
	}
	return str;
};

/**
 * Normaliza separadores decimales (coma → punto)
 */
const normalizeDecimal = (value: string): string => {
	return value.replace(/,/g, ".");
};

/**
 * Lee y parsea el CSV
 */
const parseCsvFile = (filePath: string): any[] => {
	console.log(`📖 Leyendo CSV: ${filePath}`);

	// Leer como buffer y convertir de ISO-8859-1 a UTF-8
	const buffer = fs.readFileSync(filePath);
	const decoder = new TextDecoder("iso-8859-1");
	let content = decoder.decode(buffer);
	content = removeBOM(content);

	const records = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		delimiter: ";",
	}) as any[];

	// Limpiar BOM de las claves y normalizar decimales
	const cleanedRecords = records.map((record, index) => {
		const cleaned: any = {};
		for (const [key, value] of Object.entries(record)) {
			const cleanKey = removeBOM(key);
			let cleanValue = value as string;

			// Normalizar coordenadas (reemplazar coma por punto)
			if (cleanKey === "LATITUD" || cleanKey === "LONGITUD") {
				cleanValue = normalizeDecimal(cleanValue);
			}

			cleaned[cleanKey] = cleanValue;
		}

		// Debug: imprimir primer registro para ver encoding
		if (index === 1) {
			console.log("🔍 Debug registro 2:", {
				address: cleaned["DIRECCIÓN COMPLETA AMPLIADA"],
				placement: cleaned["TIPO  SITUADO"],
			});
		}

		return cleaned;
	});

	console.log(`✅ CSV parseado: ${cleanedRecords.length} registros`);
	return cleanedRecords;
};

/**
 * Convierte un registro CSV a formato de bin
 */
const csvToBin = (csvRow: any): any | null => {
	// Obtener código de distrito desde el nombre (normalizado)
	const districtName = normalizeDistrictName(csvRow.DISTRITO || "");
	const districtCode = DISTRICT_NAME_TO_CODE[districtName];

	if (!districtCode) {
		console.warn(`⚠️ Distrito no encontrado: "${districtName}" (original: "${csvRow.DISTRITO}")`);
		return null;
	}

	return {
		address: (csvRow["DIRECCIÓN COMPLETA AMPLIADA"] || csvRow["DIRECCION COMPLETA"] || "").trim(),
		lat: csvRow.LATITUD,
		lng: csvRow.LONGITUD,
		load_type: null,
		direction: null,
		subtype: null,
		placement_type: (csvRow["TIPO  SITUADO"] || csvRow["TIPO SITUADO"] || "").trim(),
		notes: null,
		bus_stop: null,
		interurban_node: null,
		district_code: districtCode,
		neighborhood_code: null, // No disponible en CSV
	};
};

/**
 * Importa un chunk de bins a Supabase
 */
const importChunk = async (
	bins: any[],
	chunkNumber: number,
	totalChunks: number,
): Promise<{ inserted: number; updated: number; errors: number }> => {
	console.log(`📦 Procesando chunk ${chunkNumber}/${totalChunks} (${bins.length} bins)...`);

	// Agrupar por distrito
	const binsByDistrict = new Map<string, any[]>();

	for (const bin of bins) {
		const key = bin.district_code;
		if (!binsByDistrict.has(key)) {
			binsByDistrict.set(key, []);
		}
		binsByDistrict.get(key)!.push(bin);
	}

	let totalInserted = 0;
	let totalUpdated = 0;
	let totalErrors = 0;

	// Procesar cada grupo
	for (const [districtCode, groupBins] of binsByDistrict.entries()) {
		const { data, error } = await supabase.rpc("import_bins", {
			p_table_name: TABLE_NAME,
			p_bin_data: groupBins,
			p_category_group_id: CATEGORY_GROUP_ID,
			p_category_id: CATEGORY_ID,
			p_district_code: districtCode,
			p_neighborhood_code: null,
		});

		if (error) {
			console.error(`❌ Error importando distrito ${districtCode}:`, error.message);
			totalErrors += groupBins.length;
		} else if (data && data.length > 0) {
			const result = data[0];
			totalInserted += result.inserted || 0;
			totalUpdated += result.updated || 0;
			totalErrors += result.errors || 0;
		}
	}

	return {
		inserted: totalInserted,
		updated: totalUpdated,
		errors: totalErrors,
	};
};

/**
 * Main: Importar todos los contenedores de aceite
 */
const main = async () => {
	console.log("🚀 Iniciando importación de OIL BINS...\n");

	try {
		// 1. Leer y parsear CSV
		const csvRecords = parseCsvFile(CSV_PATH);

		// 2. Convertir a formato de bins (filtrar nulos)
		const bins = csvRecords.map(csvToBin).filter((bin) => bin !== null) as any[];
		console.log(`✅ ${bins.length} bins preparados para importación\n`);

		// 3. Procesar en chunks
		const totalChunks = Math.ceil(bins.length / CHUNK_SIZE);
		let totalInserted = 0;
		let totalUpdated = 0;
		let totalErrors = 0;

		for (let i = 0; i < bins.length; i += CHUNK_SIZE) {
			const chunk = bins.slice(i, i + CHUNK_SIZE);
			const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;

			const result = await importChunk(chunk, chunkNumber, totalChunks);

			totalInserted += result.inserted;
			totalUpdated += result.updated;
			totalErrors += result.errors;

			console.log(
				`   ✓ Chunk ${chunkNumber}: ${result.inserted} insertados, ${result.updated} actualizados, ${result.errors} errores\n`,
			);
		}

		// 4. Resumen final
		console.log("━".repeat(60));
		console.log("📊 RESUMEN DE IMPORTACIÓN - OIL BINS");
		console.log("━".repeat(60));
		console.log(`✅ Total insertados: ${totalInserted}`);
		console.log(`🔄 Total actualizados: ${totalUpdated}`);
		console.log(`❌ Total errores: ${totalErrors}`);
		console.log(`📦 Total procesados: ${bins.length}`);
		console.log("━".repeat(60));
	} catch (error) {
		console.error("❌ Error fatal en importación:", error);
		process.exit(1);
	}
};

// Ejecutar
main();
