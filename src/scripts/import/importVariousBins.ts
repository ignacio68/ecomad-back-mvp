/**
 * Script de importación para contenedores VARIOS
 * CSV: Contenedores_varios.csv
 * Importa 4 tipos de contenedores:
 * - Papel-Cartón → paper_bins (category_id: 12)
 * - Envases → plastic_bins (category_id: 13)
 * - Orgánica → organic_bins (category_id: 16)
 * - Resto → other_bins (category_id: 18)
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

const CSV_PATH = path.join(__dirname, "../../../data/csv/Contenedores_varios.csv");
const CATEGORY_GROUP_ID = 1; // Contenedores
const CHUNK_SIZE = 1000;

// Mapeo de tipos de contenedor a tabla y category_id
const BIN_TYPE_MAPPING: Record<string, { table: string; categoryId: number }> = {
	"Papel-Cartón": { table: "paper_bins", categoryId: 4 },
	Envases: { table: "plastic_bins", categoryId: 3 },
	Orgánica: { table: "organic_bins", categoryId: 5 },
	Resto: { table: "other_bins", categoryId: 6 },
};

// Cargar distritos desde JSON
const DISTRICTS_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../data/json/distritos.json"), "utf-8"));

const normalizeName = (name: string): string => {
	return name
		.toUpperCase()
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ");
};

const getDistrictCode = (districtName: string): string | null => {
	const normalized = normalizeName(districtName);
	const district = DISTRICTS_JSON.find((d: any) => normalizeName(d.nom_dis) === normalized);
	return district ? district.cod_dis : null;
};

const getNeighborhoodCode = (districtCode: string, neighborhoodName: string): string | null => {
	const normalized = normalizeName(neighborhoodName);
	const district = DISTRICTS_JSON.find((d: any) => d.cod_dis === districtCode);

	if (!district) return null;

	const neighborhood = district.barrios.find((b: any) => normalizeName(b.nom_bar) === normalized);

	return neighborhood ? neighborhood.cod_barrio : null;
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

const csvToBin = (csvRow: any): any | null => {
	const districtCode = getDistrictCode(csvRow.Distrito);
	if (!districtCode) {
		return null;
	}

	const neighborhoodCode = getNeighborhoodCode(districtCode, csvRow.Barrio);

	return {
		address: (csvRow["Dirección"] || "").trim(),
		lat: Number.parseFloat(csvRow.Latitud),
		lng: Number.parseFloat(csvRow.Longitud),
		load_type: csvRow.Carga || null,
		direction: null,
		subtype: null,
		placement_type: null,
		notes: null,
		bus_stop: null,
		interurban_node: null,
		district_code: districtCode,
		neighborhood_code: neighborhoodCode,
	};
};

const importChunk = async (
	tableName: string,
	categoryId: number,
	bins: any[],
	chunkNumber: number,
	totalChunks: number,
): Promise<{ inserted: number; updated: number; errors: number }> => {
	console.log(`📦 [${tableName}] Procesando chunk ${chunkNumber}/${totalChunks} (${bins.length} bins)...`);

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
			p_table_name: tableName,
			p_bin_data: groupBins,
			p_category_group_id: CATEGORY_GROUP_ID,
			p_category_id: categoryId,
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

const main = async () => {
	console.log("🚀 Iniciando importación de CONTENEDORES VARIOS...\n");

	try {
		// Leer CSV
		const allRecords = parseCsvFile(CSV_PATH);

		// Agrupar por tipo de contenedor
		const recordsByType: Record<string, any[]> = {
			"Papel-Cartón": [],
			Envases: [],
			Orgánica: [],
			Resto: [],
		};

		for (const record of allRecords) {
			const tipo = record["Tipo Contenedor"];
			if (recordsByType[tipo]) {
				recordsByType[tipo].push(record);
			}
		}

		console.log("📊 Registros por tipo:");
		for (const [tipo, records] of Object.entries(recordsByType)) {
			console.log(`   - ${tipo}: ${records.length} registros`);
		}
		console.log();

		// Procesar cada tipo
		const results: Record<string, any> = {};

		for (const [tipo, records] of Object.entries(recordsByType)) {
			const mapping = BIN_TYPE_MAPPING[tipo];
			if (!mapping || records.length === 0) continue;

			console.log(`\n${"=".repeat(60)}`);
			console.log(`📥 Procesando ${tipo} → ${mapping.table}`);
			console.log("=".repeat(60));

			// Convertir a bins
			const bins = records.map(csvToBin).filter((bin) => bin !== null) as any[];
			console.log(`✅ ${bins.length} bins preparados\n`);

			// Importar en chunks
			const totalChunks = Math.ceil(bins.length / CHUNK_SIZE);
			let totalInserted = 0;
			let totalUpdated = 0;
			let totalErrors = 0;

			for (let i = 0; i < bins.length; i += CHUNK_SIZE) {
				const chunk = bins.slice(i, i + CHUNK_SIZE);
				const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;

				const result = await importChunk(mapping.table, mapping.categoryId, chunk, chunkNumber, totalChunks);

				totalInserted += result.inserted;
				totalUpdated += result.updated;
				totalErrors += result.errors;

				console.log(`   ✓ Chunk ${chunkNumber}: ${result.inserted} insertados, ${result.updated} actualizados\n`);
			}

			results[tipo] = {
				inserted: totalInserted,
				updated: totalUpdated,
				errors: totalErrors,
				total: bins.length,
			};
		}

		// Resumen final
		console.log("\n" + "━".repeat(60));
		console.log("📊 RESUMEN FINAL - CONTENEDORES VARIOS");
		console.log("━".repeat(60));
		for (const [tipo, stats] of Object.entries(results)) {
			console.log(`\n${tipo}:`);
			console.log(`   ✅ Insertados: ${stats.inserted}`);
			console.log(`   🔄 Actualizados: ${stats.updated}`);
			console.log(`   ❌ Errores: ${stats.errors}`);
			console.log(`   📦 Total: ${stats.total}`);
		}
		console.log("━".repeat(60));
	} catch (error) {
		console.error("❌ Error fatal en importación:", error);
		process.exit(1);
	}
};

main();
