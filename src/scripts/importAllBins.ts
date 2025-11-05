import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";

// Load environment variables from .env
config();

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error("❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY son requeridos");
	console.error("   Configúralos en .env");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuración de archivos CSV
const CSV_DIR = path.join(process.cwd(), "data", "csv");

interface ImportConfig {
	file: string;
	table: string;
	categoryGroupId: number;
	categoryId: number;
	source: string;
	subtype?: string | null;
	useSpecialFunction?: boolean;
}

const IMPORTS: ImportConfig[] = [
	{
		file: "ContenedoresRopa.csv",
		table: "clothing_bins",
		categoryGroupId: 1,
		categoryId: 14,
		source: "csv_ropa_2024",
		subtype: null,
	},
	{
		file: "contenedores_vidrio_con_publicidad.csv",
		table: "glass_bins",
		categoryGroupId: 1,
		categoryId: 11,
		source: "csv_vidrio_publicidad_2024",
		subtype: "advertising",
	},
	{
		file: "RecogidaContenedoresAceiteUsado.csv",
		table: "oil_bins",
		categoryGroupId: 1,
		categoryId: 15,
		source: "csv_aceite_2024",
		subtype: null,
	},
	{
		file: "mupis_pilas.csv",
		table: "battery_bins",
		categoryGroupId: 1,
		categoryId: 17,
		source: "csv_mupis_2024",
		subtype: "mupi",
	},
	{
		file: "Marquesinas_contenedores_pilas_2024_10_29.csv",
		table: "battery_bins",
		categoryGroupId: 1,
		categoryId: 17,
		source: "csv_marquesinas_2024",
		subtype: "marquesina",
	},
	{
		file: "Contenedores_varios.csv",
		table: "varios", // special handling
		categoryGroupId: 1,
		categoryId: 0, // will be determined by container type
		source: "csv_varios_2024",
		subtype: null,
		useSpecialFunction: true,
	},
];

async function parseCsvFile(filePath: string): Promise<Record<string, string>[]> {
	let fileContent = fs.readFileSync(filePath, "utf-8");

	// Remove BOM if present
	if (fileContent.codePointAt(0) === 0xfeff) {
		fileContent = fileContent.slice(1);
	}

	const records = parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
		delimiter: ";",
		relax_column_count: true,
		trim: true,
		quote: '"',
		escape: '"',
		relax_quotes: true,
		bom: true,
	});

	// Clean BOM from object keys and normalize decimal separators
	return (records as Record<string, string>[]).map((record: Record<string, string>) => {
		const cleaned: Record<string, string> = {};
		for (const [key, value] of Object.entries(record)) {
			// Remove BOM, zero-width chars, and trim
			const cleanKey = key.replace(/^[\uFEFF\uFFFE\u200B-\u200D]/, "").trim();

			// If it's a coordinate field, normalize decimal separator (comma to dot)
			let cleanValue = value || "";
			if (
				cleanKey === "LATITUD" ||
				cleanKey === "LAT" ||
				cleanKey === "LONGITUD" ||
				cleanKey === "LNG" ||
				cleanKey === "LON" ||
				cleanKey === "Latitud" ||
				cleanKey === "Longitud" ||
				cleanKey === "UTM_X" ||
				cleanKey === "UTM_Y" ||
				cleanKey === "Coordenada X" ||
				cleanKey === "Coordenada Y" ||
				cleanKey === "X ETRS89 U.T.M." ||
				cleanKey === "Y ETRS89 U.T.M." ||
				cleanKey === "Coord ED50_X" ||
				cleanKey === "Coord ED50_Y"
			) {
				// eslint-disable-next-line unicorn/prefer-string-replace-all
				cleanValue = cleanValue.replace(/,/g, ".");
			}

			cleaned[cleanKey] = cleanValue;
		}
		return cleaned;
	});
}

async function importSingleFile(config: ImportConfig): Promise<void> {
	const filePath = path.join(CSV_DIR, config.file);

	console.log(`\n📄 Procesando: ${config.file}`);
	console.log(`   Tabla: ${config.table}`);
	console.log(`   Categoría: ${config.categoryId}${config.subtype ? ` (${config.subtype})` : ""}`);

	if (!fs.existsSync(filePath)) {
		console.error(`   ❌ Archivo no encontrado: ${filePath}`);
		return;
	}

	// Parse CSV
	console.log("   📖 Leyendo CSV...");
	const records = await parseCsvFile(filePath);
	console.log(`   📊 Filas encontradas: ${records.length}`);

	if (records.length === 0) {
		console.log("   ⚠️  CSV vacío, saltando...");
		return;
	}

	// Split large CSVs into chunks to avoid timeout
	const CHUNK_SIZE = 1000;
	const chunks = [];
	for (let i = 0; i < records.length; i += CHUNK_SIZE) {
		chunks.push(records.slice(i, i + CHUNK_SIZE));
	}

	console.log(`   🔄 Procesando en ${chunks.length} lote(s) de ${CHUNK_SIZE} filas máx...`);

	let totalInserted = 0;
	let totalUpdated = 0;
	let totalErrors = 0;

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		console.log(`   📦 Lote ${i + 1}/${chunks.length} (${chunk.length} filas)...`);

		try {
			let result: {
				inserted?: number;
				updated?: number;
				errors?: number;
				total_inserted?: number;
				total_updated?: number;
				total_errors?: number;
			};

			if (config.useSpecialFunction) {
				// Use import_contenedores_varios for mixed CSV
				const { data, error } = await supabase.rpc("import_contenedores_varios", {
					p_csv_data: chunk,
					p_source: config.source,
				});

				if (error) throw error;
				result = data;
			} else {
				// Use import_bins for single-type CSV
				const { data, error } = await supabase.rpc("import_bins", {
					p_table_name: config.table,
					p_csv_data: chunk,
					p_category_group_id: config.categoryGroupId,
					p_category_id: config.categoryId,
					p_source: config.source,
					p_subtype: config.subtype || undefined,
				});

				if (error) throw error;
				result = data;
			}

			totalInserted += result.inserted || result.total_inserted || 0;
			totalUpdated += result.updated || result.total_updated || 0;
			totalErrors += result.errors || result.total_errors || 0;

			console.log(
				`      ✓ Insertados: ${result.inserted || result.total_inserted || 0}, Actualizados: ${
					result.updated || result.total_updated || 0
				}, Errores: ${result.errors || result.total_errors || 0}`,
			);
		} catch (error) {
			console.error(`   ❌ Error en lote ${i + 1}:`, error);
			throw error;
		}
	}

	console.log("   ✅ Importación completada:");
	console.log(`      • Total insertados: ${totalInserted}`);
	console.log(`      • Total actualizados: ${totalUpdated}`);
	console.log(`      • Total errores: ${totalErrors}`);
	console.log(`      • Total procesado: ${records.length}`);
}

async function importAllBins(): Promise<void> {
	console.log("🌱 EcoMAD - Importación de Contenedores");
	console.log("==========================================\n");

	const startTime = Date.now();
	let successCount = 0;
	let failCount = 0;

	for (const config of IMPORTS) {
		try {
			await importSingleFile(config);
			successCount++;
		} catch (error) {
			console.error(`❌ Error en ${config.file}:`, error);
			failCount++;
		}
	}

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);

	console.log("\n==========================================");
	console.log("📊 Resumen de importación:");
	console.log(`   ✅ Exitosas: ${successCount}/${IMPORTS.length}`);
	console.log(`   ❌ Fallidas: ${failCount}/${IMPORTS.length}`);
	console.log(`   ⏱️  Tiempo total: ${duration}s`);
	console.log("==========================================\n");

	if (failCount > 0) {
		process.exit(1);
	}
}

// Execute
await importAllBins();
