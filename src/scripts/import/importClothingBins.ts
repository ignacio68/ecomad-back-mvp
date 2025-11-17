/**
 * Script de importación para contenedores de ROPA
 * CSV: ContenedoresRopa.csv
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
// Los scripts de importación siempre usan .env.development
dotenv.config({ path: ".env.development" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error("❌ Missing required environment variables");
	console.error("SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌");
	console.error("SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌");
	process.exit(1);
}

// Cliente de Supabase con SERVICE_ROLE_KEY para operaciones privilegiadas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Configuración del CSV
const CSV_PATH = path.join(__dirname, "../../../data/csv/ContenedoresRopa.csv");
const TABLE_NAME = "clothing_bins";
const CATEGORY_GROUP_ID = 2; // Punto Limpio
const CATEGORY_ID = 14; // Ropa usada
const CHUNK_SIZE = 1000; // Procesar en lotes de 1000 registros

/**
 * Elimina BOM y limpia las claves de los objetos parseados
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
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	return value.replace(/,/g, ".");
};

/**
 * Lee y parsea el CSV
 */
const parseCsvFile = (filePath: string): any[] => {
	console.log(`📖 Leyendo CSV: ${filePath}`);

	let content = fs.readFileSync(filePath, "utf-8");
	content = removeBOM(content);

	const records = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		delimiter: ";",
	}) as any[];

	// Limpiar BOM de las claves y normalizar decimales
	const cleanedRecords = records.map((record) => {
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
		return cleaned;
	});

	console.log(`✅ CSV parseado: ${cleanedRecords.length} registros`);
	return cleanedRecords;
};

/**
 * Convierte un registro CSV a formato de bin
 */
const csvToBin = (csvRow: any): any => {
	// Normalizar códigos con padding
	const districtCode = String(csvRow.COD_DIST || "").padStart(2, "0");
	const neighborhoodCode = String(csvRow.COD_BARRIO || "").padStart(3, "0");

	return {
		address: csvRow["DIRECCION COMPLETA"] || csvRow.DIRECCION || "",
		lat: csvRow.LATITUD,
		lng: csvRow.LONGITUD,
		load_type: null,
		direction: null,
		subtype: null,
		placement_type: null,
		notes: csvRow["MÁS INFORMACIÓN"] || null,
		bus_stop: null,
		interurban_node: null,
		district_code: districtCode,
		neighborhood_code: neighborhoodCode || null,
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

	// Agrupar por distrito para llamar a la función RPC
	const binsByDistrict = new Map<string, any[]>();

	for (const bin of bins) {
		const key = `${bin.district_code}-${bin.neighborhood_code || "null"}`;
		if (!binsByDistrict.has(key)) {
			binsByDistrict.set(key, []);
		}
		binsByDistrict.get(key)!.push(bin);
	}

	let totalInserted = 0;
	let totalUpdated = 0;
	let totalErrors = 0;

	// Procesar cada grupo
	for (const [key, groupBins] of binsByDistrict.entries()) {
		const firstBin = groupBins[0];

		const { data, error } = await supabase.rpc("import_bins", {
			p_table_name: TABLE_NAME,
			p_bin_data: groupBins,
			p_category_group_id: CATEGORY_GROUP_ID,
			p_category_id: CATEGORY_ID,
			p_district_code: firstBin.district_code,
			p_neighborhood_code: firstBin.neighborhood_code || null,
		});

		if (error) {
			console.error(`❌ Error importando grupo ${key}:`, error.message);
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
 * Main: Importar todos los contenedores de ropa
 */
const main = async () => {
	console.log("🚀 Iniciando importación de CLOTHING BINS...\n");

	try {
		// 1. Leer y parsear CSV
		const csvRecords = parseCsvFile(CSV_PATH);

		// 2. Convertir a formato de bins
		const bins = csvRecords.map(csvToBin);
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
		console.log("📊 RESUMEN DE IMPORTACIÓN - CLOTHING BINS");
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
