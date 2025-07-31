import type { Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "../../common/models/serviceResponse";
import {
  getAllClothingBins,
  getClothingBinsByDistrict,
  getClothingBinsCount,
  getClothingBinsNearby,
  insertClothingBins,
  clearClothingBins,
} from "./clothingBinService";
import { clothingBinSchema } from "./clothingBinSchema";
import { validateCSV } from "../../common/utils/validateCSV";

export const getClothingBins: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bins = await getAllClothingBins();

    const response = ServiceResponse.success(
      "Contenedores de ropa obtenidos exitosamente",
      bins
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error en getClothingBins:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const getClothingBinsByDistrictController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { district } = req.params;

    if (!district) {
      const response = ServiceResponse.failure(
        "El parámetro 'district' es requerido",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const bins = await getClothingBinsByDistrict(district);

    const response = ServiceResponse.success(
      `Contenedores de ropa del distrito ${district} obtenidos exitosamente`,
      bins
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error en getClothingBinsByDistrict:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const getClothingBinsNearbyController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      const response = ServiceResponse.failure(
        "Los parámetros 'lat' y 'lng' son requeridos",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = radius ? parseFloat(radius as string) : 5;

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      const response = ServiceResponse.failure(
        "Los parámetros 'lat', 'lng' y 'radius' deben ser números válidos",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const bins = await getClothingBinsNearby(latitude, longitude, radiusKm);

    const response = ServiceResponse.success(
      "Contenedores de ropa cercanos obtenidos exitosamente",
      bins
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error en getClothingBinsNearby:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const getClothingBinsCountController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const count = await getClothingBinsCount();

    const response = ServiceResponse.success(
      "Conteo de contenedores obtenido exitosamente",
      { count }
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error en getClothingBinsCount:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const loadClothingBinsDataController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const CSV_URL =
      "https://datos.madrid.es/egob/catalogo/204410-1-contenedores-ropa.csv";

    console.log("🔄 Descargando CSV desde:", CSV_URL);

    const fetchResponse = await fetch(CSV_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EcoMAD-Back/1.0)",
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(
        `Failed to download CSV: ${fetchResponse.status} ${fetchResponse.statusText}`
      );
    }

    const csvText = await fetchResponse.text();
    console.log("✅ CSV descargado, tamaño:", csvText.length, "caracteres");

    console.log("🔄 Validando CSV...");
    const { valid, invalid } = await validateCSV(csvText, clothingBinSchema, {
      delimiter: ";",
      skipEmptyLines: true,
    });

    console.log("✅ Valid records:", valid.length);
    console.log("❌ Invalid records:", invalid.length);

    if (valid.length === 0) {
      const serviceResponse = ServiceResponse.failure(
        "No se encontraron registros válidos en el CSV",
        null
      );
      res.status(serviceResponse.statusCode).json(serviceResponse);
      return;
    }

    // Limpiar tabla existente
    const clearResult = await clearClothingBins();
    if (!clearResult.success) {
      const serviceResponse = ServiceResponse.failure(
        "Error al limpiar tabla existente",
        clearResult.error
      );
      res.status(serviceResponse.statusCode).json(serviceResponse);
      return;
    }

    // Insertar nuevos datos
    const insertResult = await insertClothingBins(valid);

    const serviceResponse = ServiceResponse.success(
      "Datos de contenedores de ropa cargados exitosamente",
      {
        inserted: insertResult.success,
        errors: insertResult.errors.length,
        totalRecords: valid.length,
      }
    );

    res.status(serviceResponse.statusCode).json(serviceResponse);
  } catch (error) {
    console.error("Error en loadClothingBinsData:", error);
    const serviceResponse = ServiceResponse.failure(
      "Error interno del servidor al cargar datos",
      error instanceof Error ? error.message : "Error desconocido"
    );
    res.status(serviceResponse.statusCode).json(serviceResponse);
  }
};
