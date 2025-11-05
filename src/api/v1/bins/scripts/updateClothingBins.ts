import { validateCSV } from "@/api/common/utils/validateCSV";
import { csvBinSchema } from "@/api/v1/bins/schemas/binsSchema";
import { clearBins, getBinsCount, insertBins } from "@/api/v1/bins/services/binsService";

const CSV_URL = "https://datos.madrid.es/egob/catalogo/204410-1-contenedores-ropa.csv";

const downloadCSV = async (): Promise<string> => {
	console.log("🔄 Iniciando fetch a:", CSV_URL);

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

	try {
		const response = await fetch(CSV_URL, {
			signal: controller.signal,
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; EcoMAD-Back/1.0)",
			},
		});

		clearTimeout(timeoutId);

		console.log("📡 Response status:", response.status);
		console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
		}

		const text = await response.text();
		console.log("📄 Texto recibido, primeros 200 caracteres:", text.substring(0, 200));
		return text;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error("Timeout: La descarga tardó más de 10 segundos");
		}
		throw error;
	}
};

const main = async () => {
	try {
		console.log("🔄 Descargando CSV desde:", CSV_URL);
		const csvText = await downloadCSV();
		console.log("✅ CSV descargado, tamaño:", csvText.length, "caracteres");

		console.log("🔄 Validando CSV...");
		const { valid, invalid } = await validateCSV(csvText, csvBinSchema, {
			delimiter: ";",
			skipEmptyLines: true,
		});

		console.log("✅ Valid records:", valid.length);
		console.log("❌ Invalid records:", invalid.length);

		if (invalid.length > 0) {
			console.log("📋 Primeros errores de validación:");
			console.dir(invalid.slice(0, 2), { depth: null });
		}

		if (valid.length > 0) {
			console.log("📋 Primeros registros válidos:");
			console.dir(valid.slice(0, 2), { depth: null });

			// Verificar registros existentes
			const existingCount = await getBinsCount("clothing_bins");
			console.log(`📊 Registros existentes en la base de datos: ${JSON.stringify(existingCount)}`);

			// Limpiar tabla existente
			try {
				await clearBins("clothing_bins");
				console.log("✅ Tabla limpiada exitosamente");
			} catch (error) {
				console.error("❌ Error al limpiar tabla:", error);
				process.exit(1);
			}

			// Insertar nuevos datos
			try {
				const insertResult = await insertBins("clothing_bins", valid as any);

				console.log(`✅ Inserción completada:`);
				console.log(`   - Registros insertados: ${insertResult.inserted}`);
				console.log(`   - Errores: ${insertResult.errors.length}`);

				if (insertResult.errors.length > 0) {
					console.log("❌ Errores de inserción:");
					console.dir(insertResult.errors, { depth: null });
				}
			} catch (error) {
				console.error("❌ Error al insertar datos:", error);
				process.exit(1);
			}

			// Verificar inserción final
			const finalCount = await getBinsCount("clothing_bins");
			console.log(`📊 Registros finales en la base de datos: ${JSON.stringify(finalCount.count)}`);
		}
	} catch (err) {
		console.error("❌ Error:", err);
		process.exit(1);
	}
};

main();
