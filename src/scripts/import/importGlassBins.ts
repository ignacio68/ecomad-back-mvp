/**
 * Script de importación para contenedores de VIDRIO
 * CSV 1: Contenedores_varios.csv (filtrar por Tipo Contenedor = "Vidrio")
 * CSV 2: contenedores_vidrio_con_publicidad.csv
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
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Configuración
const CSV_VARIOS_PATH = path.join(__dirname, "../../../data/csv/Contenedores_varios.csv");
const CSV_PUBLICIDAD_PATH = path.join(__dirname, "../../../data/csv/contenedores_vidrio_con_publicidad.csv");
const TABLE_NAME = "glass_bins";
const CATEGORY_GROUP_ID = 1; // Contenedores
const CATEGORY_ID = 11; // Vidrio
const CHUNK_SIZE = 1000;

// Cargar distritos y barrios desde JSON
const DISTRICTS_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../data/json/distritos.json"), "utf-8"));

/**
 * Normaliza nombres para matching (sin tildes, mayúsculas, sin espacios extra)
 */
const normalizeName = (name: string): string => {
	return name
		.toUpperCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s*-\s*/g, "-") // Normalizar guiones: " - " → "-"
		.replace(/\s+/g, " "); // Normalizar espacios múltiples
};

/**
 * Mapea nombre de distrito a código
 */
const getDistrictCode = (districtName: string): string | null => {
	let normalized = normalizeName(districtName);

	// Casos especiales de nombres incompletos en CSV
	if (normalized === "SAN BLAS") {
		normalized = "SAN BLAS-CANILLEJAS";
	}

	const district = DISTRICTS_JSON.find((d: any) => normalizeName(d.nom_dis) === normalized);
	return district ? district.cod_dis : null;
};

/**
 * Mapea nombre de barrio a código (dentro de un distrito)
 */
const getNeighborhoodCode = (districtCode: string, neighborhoodName: string): string | null => {
	const normalized = normalizeName(neighborhoodName);
	const district = DISTRICTS_JSON.find((d: any) => d.cod_dis === districtCode);

	if (!district) return null;

	const neighborhood = district.barrios.find((b: any) => normalizeName(b.nom_bar) === normalized);

	return neighborhood ? neighborhood.cod_barrio : null;
};

/**
 * Lee y parsea CSV
 */
const parseCsvFile = (filePath: string, delimiter = ";"): any[] => {
	console.log(`📖 Leyendo CSV: ${filePath}`);

	// Leer con UTF-8 (el CSV de varios está en UTF-8, no ISO-8859-1)
	const content = fs.readFileSync(filePath, "utf-8");

	const records = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		delimiter,
	});

	console.log(`✅ CSV parseado: ${records.length} registros`);
	return records;
};

/**
 * Convierte registro de Contenedores_varios.csv a bin
 */
const csvVariosToBin = (csvRow: any, index: number): any | null => {
	// Debug: imprimir columnas del primer registro
	if (index === 0) {
		console.log("🔍 Columnas disponibles:", Object.keys(csvRow));
	}

	const districtCode = getDistrictCode(csvRow.Distrito);
	if (!districtCode) {
		console.warn(`⚠️ Distrito no encontrado: "${csvRow.Distrito}"`);
		return null;
	}

	const neighborhoodCode = getNeighborhoodCode(districtCode, csvRow.Barrio);
	if (!neighborhoodCode) {
		console.warn(`⚠️ Barrio no encontrado: "${csvRow.Barrio}" en distrito ${districtCode}`);
	}

	return {
		address: (csvRow["Dirección"] || "").trim(),
		lat: csvRow.Latitud,
		lng: csvRow.Longitud,
		load_type: csvRow.Carga || null,
		direction: null,
		subtype: null, // NULL para contenedores normales
		placement_type: null,
		notes: null,
		bus_stop: null,
		interurban_node: null,
		district_code: districtCode,
		neighborhood_code: neighborhoodCode,
	};
};

/**
 * Convierte registro de vidrio_con_publicidad.csv a bin
 */
const csvPublicidadToBin = (csvRow: any): any | null => {
	const districtCode = getDistrictCode(csvRow.DISTRITO);
	if (!districtCode) {
		console.warn(`⚠️ Distrito no encontrado: "${csvRow.DISTRITO}"`);
		return null;
	}

	return {
		address: (csvRow.NOMBRE || "").trim(),
		lat: csvRow.LATITUD,
		lng: csvRow.LONGITUD,
		load_type: null,
		direction: null,
		subtype: "Con publicidad",
		placement_type: null,
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
 * Main: Importar contenedores de vidrio
 */
const main = async () => {
	console.log("🚀 Iniciando importación de GLASS BINS...\n");

	try {
		const allBins: any[] = [];

		// 1. Importar desde Contenedores_varios.csv (filtrar Vidrio)
		console.log("📥 Procesando Contenedores_varios.csv...");
		const variosRecords = parseCsvFile(CSV_VARIOS_PATH);
		const vidrioRecords = variosRecords.filter((r) => r["Tipo Contenedor"] === "Vidrio");
		console.log(`✅ Encontrados ${vidrioRecords.length} registros de Vidrio\n`);

		const binsVarios = vidrioRecords
			.map((row, index) => csvVariosToBin(row, index))
			.filter((bin) => bin !== null) as any[];
		allBins.push(...binsVarios);

		// 2. Importar desde vidrio_con_publicidad.csv
		console.log("📥 Procesando contenedores_vidrio_con_publicidad.csv...");
		const publicidadRecords = parseCsvFile(CSV_PUBLICIDAD_PATH);
		console.log(`✅ Encontrados ${publicidadRecords.length} registros con publicidad\n`);

		const binsPublicidad = publicidadRecords.map(csvPublicidadToBin).filter((bin) => bin !== null) as any[];
		allBins.push(...binsPublicidad);

		console.log(`✅ Total de bins preparados: ${allBins.length}\n`);

		// 3. Procesar en chunks
		const totalChunks = Math.ceil(allBins.length / CHUNK_SIZE);
		let totalInserted = 0;
		let totalUpdated = 0;
		let totalErrors = 0;

		for (let i = 0; i < allBins.length; i += CHUNK_SIZE) {
			const chunk = allBins.slice(i, i + CHUNK_SIZE);
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
		console.log("📊 RESUMEN DE IMPORTACIÓN - GLASS BINS");
		console.log("━".repeat(60));
		console.log(`✅ Total insertados: ${totalInserted}`);
		console.log(`🔄 Total actualizados: ${totalUpdated}`);
		console.log(`❌ Total errores: ${totalErrors}`);
		console.log(`📦 Total procesados: ${allBins.length}`);
		console.log(`   - Contenedores varios: ${binsVarios.length}`);
		console.log(`   - Con publicidad: ${binsPublicidad.length}`);
		console.log("━".repeat(60));
	} catch (error) {
		console.error("❌ Error fatal en importación:", error);
		process.exit(1);
	}
};

// Ejecutar
main();
