console.log("🚀 Script de prueba funcionando!");
console.log("✅ TypeScript se está ejecutando correctamente");

// Probar fetch básico
fetch("https://httpbin.org/get")
	.then((response) => response.json())
	.then((data) => {
		console.log("✅ Fetch funcionando:", data.url);
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Error en fetch:", error.message);
		process.exit(1);
	});
