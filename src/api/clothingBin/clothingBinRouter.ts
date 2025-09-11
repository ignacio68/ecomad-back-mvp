import express, { type Router } from "express";
import rateLimiter from "@/common/middleware/rateLimiter";
import {
  getClothingBins,
  getClothingBinsByDistrictController,
  getClothingBinsByNeighborhoodController,
  getClothingBinsCountController,
  getClothingBinsNearbyController,
  loadClothingBinsDataController,
  getDistrictAggregatesController,
  getNeighborhoodAggregatesController,
  debugClothingBinsController,
} from "./clothingBinController";

const router: Router = express.Router();
router.use(rateLimiter);

// GET /api/clothing-bins - Obtener todos los contenedores
router.get("/", getClothingBins);

// GET /api/clothing-bins/count - Obtener conteo de contenedores
router.get("/count", getClothingBinsCountController);

// GET /api/clothing-bins/district/:district - Obtener contenedores por distrito
router.get("/district/:district", getClothingBinsByDistrictController);

// GET /api/clothing-bins/neighborhood/:neighborhood - Obtener contenedores por barrio
router.get(
  "/neighborhood/:neighborhood",
  getClothingBinsByNeighborhoodController
);

// GET /api/clothing-bins/nearby - Obtener contenedores cercanos
// Query params: lat, lng, radius (opcional, default: 5km)
router.get("/nearby", getClothingBinsNearbyController);

// GET /api/clothing-bins/aggregate/district - Agregación por distrito dentro de un bbox
router.get("/aggregate/district", getDistrictAggregatesController);

// GET /api/clothing-bins/aggregate/neighborhood - Agregación por barrio dentro de un bbox
router.get("/aggregate/neighborhood", getNeighborhoodAggregatesController);

// POST /api/clothing-bins/load-data - Cargar datos desde CSV (temporal)
router.post("/load-data", loadClothingBinsDataController);

// GET /api/clothing-bins/debug - Debug endpoint (temporal)
router.get("/debug", debugClothingBinsController);

export default router;
