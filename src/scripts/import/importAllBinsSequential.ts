/**
 * Script para importar todos los tipos de bins en secuencia
 * Ejecuta los scripts de importación uno por uno
 */

import { spawn } from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMPORT_SCRIPTS = [
	{ name: "Clothing (Ropa)", script: "import:clothing" },
	{ name: "Oil (Aceite)", script: "import:oil" },
	{ name: "Glass (Vidrio)", script: "import:glass" },
	{ name: "Battery (Pilas)", script: "import:battery" },
	{
		name: "Various (Papel, Plástico, Orgánico, Resto)",
		script: "import:various",
	},
];

/**
 * Ejecuta un script npm y espera a que termine
 */
const runScript = (scriptName: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		console.log(`\n🚀 Running: npm run ${scriptName}`);
		console.log("=".repeat(60));

		const child = spawn("npm", ["run", scriptName], {
			cwd: path.join(__dirname, "../../.."),
			stdio: "inherit",
			shell: true,
		});

		child.on("close", (code) => {
			if (code === 0) {
				console.log(`✅ ${scriptName} completed successfully`);
				resolve();
			} else {
				console.error(`❌ ${scriptName} failed with code ${code}`);
				reject(new Error(`Script ${scriptName} failed`));
			}
		});

		child.on("error", (error) => {
			console.error(`❌ Error running ${scriptName}:`, error);
			reject(error);
		});
	});
};

/**
 * Script principal
 */
const main = async (): Promise<void> => {
	console.log("🚀 Starting sequential import of all bins");
	console.log("=".repeat(60));
	console.log(`Total scripts to run: ${IMPORT_SCRIPTS.length}`);
	console.log("");

	const startTime = Date.now();
	let successCount = 0;
	let failCount = 0;

	for (const { name, script } of IMPORT_SCRIPTS) {
		try {
			console.log(`\n📦 Importing: ${name}`);
			await runScript(script);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import ${name}:`, error);
			failCount++;
			// Continuar con el siguiente script incluso si este falla
		}
	}

	const duration = Math.round((Date.now() - startTime) / 1000);

	console.log("\n" + "=".repeat(60));
	console.log("📊 Import Summary:");
	console.log(`   ✅ Success: ${successCount}`);
	console.log(`   ❌ Failed: ${failCount}`);
	console.log(`   ⏱️  Total time: ${duration}s`);
	console.log("=".repeat(60));

	if (failCount > 0) {
		console.error("\n⚠️  Some imports failed. Check logs above.");
		process.exit(1);
	} else {
		console.log("\n✅ All imports completed successfully!");
		process.exit(0);
	}
};

main();
