import express, { type Router } from "express";
import {
  getClothingBins,
  getClothingBinsByDistrictController,
  getClothingBinsCountController,
  getClothingBinsNearbyController,
  loadClothingBinsDataController,
} from "./clothingBinController";

const router: Router = express.Router();

// GET /api/clothing-bins - Obtener todos los contenedores
router.get("/", getClothingBins);

// GET /api/clothing-bins/count - Obtener conteo de contenedores
router.get("/count", getClothingBinsCountController);

// GET /api/clothing-bins/district/:district - Obtener contenedores por distrito
router.get("/district/:district", getClothingBinsByDistrictController);

// GET /api/clothing-bins/nearby - Obtener contenedores cercanos
// Query params: lat, lng, radius (opcional, default: 5km)
router.get("/nearby", getClothingBinsNearbyController);

// POST /api/clothing-bins/load-data - Cargar datos desde CSV (temporal)
router.post("/load-data", loadClothingBinsDataController);

export default router;
