import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

/**
 * Ejecuta el script SQL de migración
 */
const executeMigrationScript = async (): Promise<void> => {
	try {
		console.log("📋 Reading migration script...");
		const scriptPath = path.join(__dirname, "../../migrate-to-v3-optimized.sql");
		const sqlScript = fs.readFileSync(scriptPath, "utf-8");

		console.log("🔄 Executing migration script...");
		console.log("⚠️  This will DROP all bin tables and recreate them!");
		console.log("⚠️  All existing bin data will be LOST!");
		console.log("");

		// Ejecutar el script completo
		const { data, error } = await supabase.rpc("exec_sql", {
			sql_query: sqlScript,
		});

		if (error) {
			console.error("❌ Migration failed:", error);
			throw error;
		}

		console.log("✅ Migration completed successfully!");
		console.log("");
		console.log("📊 Next steps:");
		console.log("1. Run: npm run import:clothing");
		console.log("2. Run: npm run import:oil");
		console.log("3. Run: npm run import:glass");
		console.log("4. Run: npm run import:paper");
		console.log("5. Run: npm run import:plastic");
		console.log("6. Run: npm run import:organic");
		console.log("7. Run: npm run import:battery");
		console.log("8. Run: npm run import:other");
	} catch (error) {
		console.error("❌ Error during migration:", error);
		throw error;
	}
};

/**
 * Script principal
 */
const main = async (): Promise<void> => {
	console.log("🚀 Starting migration to Schema V3 (Optimized)");
	console.log("================================================");
	console.log("");

	try {
		await executeMigrationScript();
		console.log("");
		console.log("================================================");
		console.log("✅ Migration process completed!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration process failed:", error);
		process.exit(1);
	}
};

main();
