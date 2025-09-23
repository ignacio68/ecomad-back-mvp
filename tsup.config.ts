import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["esm", "cjs"],
	target: "es2020",
	sourcemap: true,
	clean: true,
	dts: true,
	splitting: false,
	skipNodeModulesBundle: true,
});
