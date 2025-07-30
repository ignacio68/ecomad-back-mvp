import { clothingBinSchema } from "../api/clothingBin/clothingBinSchema";
import { clearClothingBins, getClothingBinsCount, insertClothingBins } from "../api/clothingBin/clothingBinService";
import { validateCSV } from "../common/utils/validateCSV";

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
		const { valid, invalid } = await validateCSV(csvText, clothingBinSchema, {
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
			const existingCount = await getClothingBinsCount();
			console.log(`📊 Registros existentes en la base de datos: ${existingCount}`);

			// Limpiar tabla existente
			const clearResult = await clearClothingBins();
			if (!clearResult.success) {
				console.error("❌ Error al limpiar tabla:", clearResult.error);
				process.exit(1);
			}

			// Insertar nuevos datos
			const insertResult = await insertClothingBins(valid);

			console.log(`✅ Inserción completada:`);
			console.log(`   - Registros insertados: ${insertResult.success}`);
			console.log(`   - Errores: ${insertResult.errors.length}`);

			if (insertResult.errors.length > 0) {
				console.log("❌ Errores de inserción:");
				console.dir(insertResult.errors, { depth: null });
			}

			// Verificar inserción final
			const finalCount = await getClothingBinsCount();
			console.log(`📊 Registros finales en la base de datos: ${finalCount}`);
		}
	} catch (err) {
		console.error("❌ Error:", err);
		process.exit(1);
	}
};

main();
