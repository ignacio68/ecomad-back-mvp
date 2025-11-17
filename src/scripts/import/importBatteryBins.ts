/**
 * Script de importación para contenedores de PILAS
 * CSV 1: Marquesinas_contenedores_pilas_2024_10_29.csv (category_id: 13)
 * CSV 2: mupis_pilas.csv (category_id: 12)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: ".env.development" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error("❌ Missing required environment variables");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_MARQUESINAS_PATH = path.join(__dirname, "../../../data/csv/Marquesinas_contenedores_pilas_2024_10_29.csv");
const CSV_MUPIS_PATH = path.join(__dirname, "../../../data/csv/mupis_pilas.csv");
const TABLE_NAME = "battery_bins";
const CATEGORY_GROUP_ID = 1; // Contenedores
const CATEGORY_ID_MARQUESINAS = 13; // Pilas en marquesinas
const CATEGORY_ID_MUPIS = 12; // Pilas en mupis
const CHUNK_SIZE = 1000;

// Cargar distritos desde JSON
const DISTRICTS_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../data/json/distritos.json"), "utf-8"));

const normalizeName = (name: string): string => {
	return name
		.toUpperCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s*-\s*/g, "-") // Normalizar guiones PRIMERO
		.replace(/\s+/g, " "); // Luego normalizar espacios
};

const getDistrictCode = (districtName: string): string | null => {
	if (!districtName || districtName.trim() === "") return null;

	let normalized = normalizeName(districtName);

	// Mapeo especial para distritos con nombres abreviados
	if (normalized === "SAN BLAS") {
		normalized = "SAN BLAS-CANILLEJAS";
	}

	const district = DISTRICTS_JSON.find((d: any) => normalizeName(d.nom_dis) === normalized);
	return district ? district.cod_dis : null;
};

const parseCsvFile = (filePath: string): any[] => {
	console.log(`📖 Leyendo CSV: ${filePath}`);
	const content = fs.readFileSync(filePath, "utf-8");

	const records = parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		delimiter: ";",
	});

	console.log(`✅ CSV parseado: ${records.length} registros`);
	return records;
};

/**
 * Convierte registro de Marquesinas a bin
 */
const csvMarquesinaToBin = (csvRow: any, index: number): any | null => {
	// Usar COD_DIS directamente (ya viene como número)
	const districtCode = String(csvRow.COD_DIS || "").trim();

	if (!districtCode || districtCode === "") {
		return null;
	}

	// Asegurar que tenga 2 dígitos con padding
	const paddedDistrictCode = districtCode.padStart(2, "0");

	const busStop = (csvRow.Parada || "").toString().trim();
	const interurbanNode = (csvRow["nodo Inter Urbano"] || "").toString().trim();
	const direction = (csvRow.sentido || "").toString().trim();

	return {
		address: (csvRow.Direccion_completa || "").trim(),
		lat: parseFloat(csvRow.Latitud),
		lng: parseFloat(csvRow.Longitud),
		load_type: null,
		direction: direction || null,
		subtype: "Marquesina",
		placement_type: null,
		notes: null,
		bus_stop: busStop || null,
		interurban_node: interurbanNode || null,
		district_code: paddedDistrictCode,
		neighborhood_code: null,
	};
};

/**
 * Convierte registro de Mupis a bin
 */
const csvMupiToBin = (csvRow: any): any | null => {
	const districtCode = getDistrictCode(csvRow.DISTRITO);
	if (!districtCode) {
		console.warn(`⚠️ Distrito no encontrado: "${csvRow.DISTRITO}"`);
		return null;
	}

	return {
		address: (csvRow.NOMBRE || "").trim(),
		lat: parseFloat(csvRow.LATITUD),
		lng: parseFloat(csvRow.LONGITUD),
		load_type: null,
		direction: null,
		subtype: "Mupi",
		placement_type: null,
		notes: null,
		bus_stop: null,
		interurban_node: null,
		district_code: districtCode,
		neighborhood_code: null,
	};
};

const importChunk = async (
	bins: any[],
	categoryId: number,
	chunkNumber: number,
	totalChunks: number,
): Promise<{ inserted: number; updated: number; errors: number }> => {
	console.log(`📦 Procesando chunk ${chunkNumber}/${totalChunks} (${bins.length} bins)...`);

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

	for (const [districtCode, groupBins] of binsByDistrict.entries()) {
		console.log(`   📍 Importando distrito ${districtCode}: ${groupBins.length} bins...`);

		const { data, error } = await supabase.rpc("import_bins", {
			p_table_name: TABLE_NAME,
			p_bin_data: groupBins,
			p_category_group_id: CATEGORY_GROUP_ID,
			p_category_id: categoryId,
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
			console.log(`      ✓ ${result.inserted} insertados, ${result.updated} actualizados`);
		} else {
			console.warn(`⚠️ No data returned for distrito ${districtCode}`);
			totalErrors += groupBins.length;
		}
	}

	return {
		inserted: totalInserted,
		updated: totalUpdated,
		errors: totalErrors,
	};
};

const main = async () => {
	console.log("🚀 Iniciando importación de BATTERY BINS...\n");

	try {
		const allBins: any[] = [];

		// 1. Importar Marquesinas
		console.log("📥 Procesando Marquesinas...");
		const marquesinasRecords = parseCsvFile(CSV_MARQUESINAS_PATH);
		const marquesinasRaw = marquesinasRecords.map((row, index) => csvMarquesinaToBin(row, index));
		const nullCount = marquesinasRaw.filter((b) => b === null).length;
		console.log(`⚠️ ${nullCount} marquesinas descartadas (COD_DIS vacío)`);
		const binsMarquesinas = marquesinasRaw.filter((bin) => bin !== null) as any[];
		console.log(`✅ ${binsMarquesinas.length} marquesinas preparadas\n`);

		// 2. Importar Mupis
		console.log("📥 Procesando Mupis...");
		const mupisRecords = parseCsvFile(CSV_MUPIS_PATH);
		const binsMupis = mupisRecords.map(csvMupiToBin).filter((bin) => bin !== null) as any[];
		console.log(`✅ ${binsMupis.length} mupis preparados\n`);

		console.log(`✅ Total de bins preparados: ${binsMarquesinas.length + binsMupis.length}\n`);

		// 3. Importar marquesinas (category_id: 13)
		console.log("=".repeat(60));
		console.log("📥 Importando MARQUESINAS");
		console.log("=".repeat(60));

		const totalChunksMarquesinas = Math.ceil(binsMarquesinas.length / CHUNK_SIZE);
		let totalInsertedMarquesinas = 0;
		let totalUpdatedMarquesinas = 0;
		let totalErrorsMarquesinas = 0;

		for (let i = 0; i < binsMarquesinas.length; i += CHUNK_SIZE) {
			const chunk = binsMarquesinas.slice(i, i + CHUNK_SIZE);
			const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;

			const result = await importChunk(chunk, CATEGORY_ID_MARQUESINAS, chunkNumber, totalChunksMarquesinas);

			totalInsertedMarquesinas += result.inserted;
			totalUpdatedMarquesinas += result.updated;
			totalErrorsMarquesinas += result.errors;

			console.log(`   ✓ Chunk ${chunkNumber}: ${result.inserted} insertados, ${result.updated} actualizados\n`);
		}

		// 4. Importar mupis (category_id: 12)
		console.log("\n" + "=".repeat(60));
		console.log("📥 Importando MUPIS");
		console.log("=".repeat(60));

		const totalChunksMupis = Math.ceil(binsMupis.length / CHUNK_SIZE);
		let totalInsertedMupis = 0;
		let totalUpdatedMupis = 0;
		let totalErrorsMupis = 0;

		for (let i = 0; i < binsMupis.length; i += CHUNK_SIZE) {
			const chunk = binsMupis.slice(i, i + CHUNK_SIZE);
			const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;

			const result = await importChunk(chunk, CATEGORY_ID_MUPIS, chunkNumber, totalChunksMupis);

			totalInsertedMupis += result.inserted;
			totalUpdatedMupis += result.updated;
			totalErrorsMupis += result.errors;

			console.log(`   ✓ Chunk ${chunkNumber}: ${result.inserted} insertados, ${result.updated} actualizados\n`);
		}

		// 5. Resumen final
		console.log("━".repeat(60));
		console.log("📊 RESUMEN DE IMPORTACIÓN - BATTERY BINS");
		console.log("━".repeat(60));
		console.log("\nMarquesinas:");
		console.log(`   ✅ Insertados: ${totalInsertedMarquesinas}`);
		console.log(`   🔄 Actualizados: ${totalUpdatedMarquesinas}`);
		console.log(`   ❌ Errores: ${totalErrorsMarquesinas}`);
		console.log(`   📦 Total: ${binsMarquesinas.length}`);
		console.log("\nMupis:");
		console.log(`   ✅ Insertados: ${totalInsertedMupis}`);
		console.log(`   🔄 Actualizados: ${totalUpdatedMupis}`);
		console.log(`   ❌ Errores: ${totalErrorsMupis}`);
		console.log(`   📦 Total: ${binsMupis.length}`);
		console.log("\nTOTAL:");
		console.log(`   ✅ Insertados: ${totalInsertedMarquesinas + totalInsertedMupis}`);
		console.log(`   🔄 Actualizados: ${totalUpdatedMarquesinas + totalUpdatedMupis}`);
		console.log(`   📦 Total: ${binsMarquesinas.length + binsMupis.length}`);
		console.log("━".repeat(60));
	} catch (error) {
		console.error("❌ Error fatal en importación:", error);
		process.exit(1);
	}
};

main();
