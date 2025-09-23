import express, { type Router } from "express";
import rateLimiter from "@/shared/middleware/rateLimiter";
import {
	debugBinsController,
	getBins,
	getBinsByLocationController,
	getBinsCountController,
	getBinsCountsHierarchyController,
	getBinsNearbyController,
	loadBinsDataController,
} from "../controllers/binsController";
import { validateBinType } from "../middleware/binTypeValidation";

// Validaciones movidas a servicios/controllers

const router: Router = express.Router();

// Middleware global
router.use(rateLimiter);
router.use(validateBinType);

// GET /api/:binType - Obtener todos los contenedores
router.get("/", getBins);

// GET /api/:binType/count - Obtener conteo de contenedores
router.get("/count", getBinsCountController);

// GET /api/:binType/location/:locationType/:locationValue - Obtener contenedores por ubicación
// locationType puede ser: district o neighborhood
router.get("/location/:locationType/:locationValue", getBinsByLocationController);

// GET /api/:binType/nearby - Obtener contenedores cercanos
// Query params: lat, lng, radius (opcional, default: 5km)
router.get("/nearby", getBinsNearbyController);

// GET /api/:binType/counts - Conteos jerárquicos (distritos y barrios)
router.get("/counts", getBinsCountsHierarchyController);

// POST /api/:binType/load-data - Cargar datos desde CSV (temporal)
router.post("/load-data", loadBinsDataController);

// GET /api/:binType/debug - Debug endpoint (temporal)
router.get("/debug", debugBinsController);

export default router;
