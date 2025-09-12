import express, { type Router } from "express";
import rateLimiter from "@/common/middleware/rateLimiter";
import {
  getClothingBins,
  getClothingBinsByDistrictController,
  getClothingBinsByNeighborhoodController,
  getClothingBinsCountController,
  getClothingBinsNearbyController,
  loadClothingBinsDataController,
  getDistrictCountsController,
  getNeighborhoodCountsController,
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

// GET /api/clothing-bins/counts/district - Conteos por distrito (sin filtrar por bounds)
router.get("/counts/district", getDistrictCountsController);

// GET /api/clothing-bins/counts/neighborhood - Conteos por barrio (sin filtrar por bounds)
router.get("/counts/neighborhood", getNeighborhoodCountsController);

// POST /api/clothing-bins/load-data - Cargar datos desde CSV (temporal)
router.post("/load-data", loadClothingBinsDataController);

// GET /api/clothing-bins/debug - Debug endpoint (temporal)
router.get("/debug", debugClothingBinsController);

export default router;
