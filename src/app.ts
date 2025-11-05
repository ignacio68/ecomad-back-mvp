import { createServer, type Server } from "node:http";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { apiRouter } from "@/api/apiRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/shared/middleware/errorHandler";
import rateLimiter from "@/shared/middleware/rateLimiter";
import requestLogger from "@/shared/middleware/requestLogger";
import { env } from "@/shared/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(
	express.json({
		limit: "10mb", // Límite para JSON
		strict: true, // Solo arrays y objetos
		type: "application/json",
	}),
);
app.use(
	express.urlencoded({
		extended: true,
		limit: "10mb", // Límite para URL-encoded
		parameterLimit: 1000, // Máximo 1000 parámetros
	}),
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
// Security headers with custom configuration
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"], // Para Swagger UI
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
		crossOriginEmbedderPolicy: false, // Para Swagger UI
	}),
);
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Request validation middleware
app.use((req, res, next) => {
	// Validar que el Content-Type sea correcto para POST/PUT/PATCH
	if (["POST", "PUT", "PATCH"].includes(req.method)) {
		const contentType = req.get("Content-Type");
		if (!contentType?.includes("application/json")) {
			return res.status(400).json({
				error: "Content-Type must be application/json for POST/PUT/PATCH requests",
			});
		}
	}

	// Validar que no haya caracteres peligrosos en la URL
	// Solo aplicar en producción, no en tests
	if (process.env.NODE_ENV !== "test") {
		const dangerousChars = /[<>"'%;()]/;
		if (dangerousChars.test(req.url)) {
			return res.status(400).json({
				error: "Invalid characters in URL",
			});
		}
	}

	next();
});

// Root endpoint - Redirección a documentación
app.get("/", (_req, res) => {
	res.status(200).json({
		message: "🌱 Bienvenido a EcoMAD API",
		version: "1.0.0",
		description: "API REST para contenedores de reciclaje en Madrid",
		totalBins: 37510,
		documentation: {
			swagger: `${_req.protocol}://${_req.get("host")}/api-docs`,
			info: `${_req.protocol}://${_req.get("host")}/api/info`,
			health: `${_req.protocol}://${_req.get("host")}/health`,
		},
		quickStart: {
			"Obtener conteo": `GET ${_req.protocol}://${_req.get("host")}/api/v1/bins/clothing_bins/count`,
			Cercanos: `GET ${_req.protocol}://${_req.get(
				"host",
			)}/api/v1/bins/clothing_bins/nearby?lat=40.4168&lng=-3.7038&radius=2`,
			"Por distrito": `GET ${_req.protocol}://${_req.get("host")}/api/v1/bins/glass_bins/location/district/1`,
		},
	});
});

// Health check endpoint (antes de otras rutas para mejor performance)
app.get("/health", (_req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: env.NODE_ENV,
		version: process.env.npm_package_version || "1.0.0",
	});
});

// Routes - API principal
app.use("/api", apiRouter);

// Swagger UI
app.use("/api-docs", openAPIRouter);

// Servir OpenAPI JSON directamente desde el root también
app.get("/swagger.json", (_req, res) => {
	res.redirect("/api-docs/swagger.json");
});

// Endpoint para obtener información rápida de la API
app.get("/api/info", (_req, res) => {
	res.status(200).json({
		name: "EcoMAD API",
		version: "1.0.0",
		description: "API REST para la gestión de contenedores de reciclaje en Madrid",
		endpoints: {
			health: "/health",
			documentation: "/api-docs",
			swagger: "/swagger.json",
			api: "/api/v1",
		},
		binTypes: {
			clothing_bins: { description: "Ropa y textil", total: 1175 },
			oil_bins: { description: "Aceite vegetal usado", total: 90 },
			glass_bins: { description: "Vidrio con publicidad", total: 7441 },
			paper_bins: { description: "Papel y cartón", total: 7320 },
			plastic_bins: {
				description: "Envases (plástico, metal, brik)",
				total: 6846,
			},
			organic_bins: { description: "Residuos orgánicos", total: 6685 },
			battery_bins: { description: "Pilas (mupis/marquesinas)", total: 1231 },
			other_bins: { description: "Resto (no reciclables)", total: 6722 },
		},
		totalBins: 37510,
	});
});

// Middleware para forzar el envío del body en códigos 204
app.use((req, res, next) => {
	const originalJson = res.json;
	res.json = function (data) {
		// Si el status code es 204, asegurar que se envíe el body
		if (res.statusCode === 204 && data !== undefined) {
			res.statusCode = 200; // Cambiar a 200 para que Express envíe el body
		}
		return originalJson.call(this, data);
	};
	next();
});

// Error handlers
app.use(errorHandler());

// Timeout middleware (30 segundos)
app.use((req, res, next) => {
	req.setTimeout(30000, () => {
		res.status(408).json({
			error: "Request timeout",
			message: "The request took too long to process",
		});
	});
	next();
});

// Crear servidor HTTP
const server: Server = createServer(app);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
	logger.info(`${signal} received, shutting down gracefully`);

	server.close(() => {
		logger.info("HTTP server closed");
		process.exit(0);
	});

	// Force shutdown after 10 seconds
	setTimeout(() => {
		logger.error("Could not close connections in time, forcefully shutting down");
		process.exit(1);
	}, 10000);
};

// Manejar señales de cierre
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
	logger.error("Uncaught Exception:", error);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	logger.error("Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});

export { app, server, logger };
