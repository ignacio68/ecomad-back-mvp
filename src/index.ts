// Importar setup de OpenAPI ANTES que cualquier otra cosa
import "@/shared/lib/openapi-setup";

import { logger, server } from "@/app";
import { env } from "@/shared/utils/envConfig";

// Iniciar servidor
server.listen(env.PORT, () => {
	const { NODE_ENV, HOST, PORT } = env;
	logger.info(`🚀 EcoMAD API Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
	logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
	logger.info(`🏥 Health Check: http://${HOST}:${PORT}/health`);
	logger.info(`🔧 API Endpoints: http://${HOST}:${PORT}/api/v1/bins/:binType/...`);
});
