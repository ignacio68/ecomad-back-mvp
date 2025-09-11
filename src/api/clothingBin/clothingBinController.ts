import type { Request, RequestHandler, Response } from "express";
import { env } from "../../common/utils/envConfig";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { supabase } from "../../common/lib/supabase";
import {
  getAllClothingBins,
  getClothingBinsByDistrict,
  getClothingBinsByNeighborhood,
  getClothingBinsCount,
  getClothingBinsNearby,
  getDistrictAggregates,
  getNeighborhoodAggregates,
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

    res
      .setHeader(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=120"
      )
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.error("Error en getClothingBins:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res
      .setHeader(
        "Cache-Control",
        "public, max-age=120, stale-while-revalidate=300"
      )
      .status(response.statusCode)
      .json(response);
  }
};

export const getClothingBinsByDistrictController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { district } = req.params;
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || "1000", 10), 1),
      5000
    );

    if (!district) {
      const response = ServiceResponse.failure(
        "El parámetro 'district' es requerido",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const bins = await getClothingBinsByDistrict(district, page, limit);

    const response = ServiceResponse.success(
      `Contenedores de ropa del distrito ${district} obtenidos exitosamente`,
      bins
    );

    res
      .setHeader(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=600"
      )
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.error("Error en getClothingBinsByDistrict:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const getClothingBinsByNeighborhoodController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { neighborhood } = req.params;
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || "1000", 10), 1),
      5000
    );

    if (!neighborhood) {
      const response = ServiceResponse.failure(
        "El parámetro 'neighborhood' es requerido",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const bins = await getClothingBinsByNeighborhood(neighborhood, page, limit);

    const response = ServiceResponse.success(
      `Contenedores de ropa del barrio ${neighborhood} obtenidos exitosamente`,
      bins
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error en getClothingBinsByNeighborhood:", error);
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
    const { lat, lng, radius, limit } = req.query;

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
    const radiusKmRaw = radius
      ? parseFloat(radius as string)
      : env.MAX_RADIUS_KM;
    const radiusKm = Math.min(Math.max(radiusKmRaw, 0.05), env.MAX_RADIUS_KM);
    const limitNumRaw = limit
      ? parseInt(limit as string, 10)
      : env.DEFAULT_LIMIT;
    const limitNum = Math.min(Math.max(limitNumRaw, 1), 5000);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      const response = ServiceResponse.failure(
        "Los parámetros 'lat', 'lng' y 'radius' deben ser números válidos",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const bins = await getClothingBinsNearby(
      latitude,
      longitude,
      radiusKm,
      limitNum
    );

    const response = ServiceResponse.success(
      "Contenedores de ropa cercanos obtenidos exitosamente",
      bins
    );

    res
      .setHeader(
        "Cache-Control",
        "public, max-age=30, stale-while-revalidate=60"
      )
      .status(response.statusCode)
      .json(response);
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

export const getDistrictAggregatesController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { minLat, minLng, maxLat, maxLng } = req.query;
    if (!minLat || !minLng || !maxLat || !maxLng) {
      const response = ServiceResponse.failure(
        "Parámetros bbox requeridos: minLat,minLng,maxLat,maxLng",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }
    const data = await getDistrictAggregates(
      parseFloat(minLat as string),
      parseFloat(minLng as string),
      parseFloat(maxLat as string),
      parseFloat(maxLng as string)
    );

    const response = ServiceResponse.success(
      "Agregación por distrito obtenida",
      data
    );
    res
      .setHeader(
        "Cache-Control",
        "public, max-age=120, stale-while-revalidate=300"
      )
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.error("Error en getDistrictAggregatesController:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const getNeighborhoodAggregatesController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { minLat, minLng, maxLat, maxLng } = req.query;
    if (!minLat || !minLng || !maxLat || !maxLng) {
      const response = ServiceResponse.failure(
        "Parámetros bbox requeridos: minLat,minLng,maxLat,maxLng",
        null
      );
      res.status(response.statusCode).json(response);
      return;
    }
    const data = await getNeighborhoodAggregates(
      parseFloat(minLat as string),
      parseFloat(minLng as string),
      parseFloat(maxLat as string),
      parseFloat(maxLng as string)
    );

    const response = ServiceResponse.success(
      "Agregación por barrio obtenida",
      data
    );
    res
      .setHeader(
        "Cache-Control",
        "public, max-age=180, stale-while-revalidate=600"
      )
      .status(response.statusCode)
      .json(response);
  } catch (error) {
    console.error("Error en getNeighborhoodAggregatesController:", error);
    const response = ServiceResponse.failure(
      "Error interno del servidor",
      null
    );
    res.status(response.statusCode).json(response);
  }
};

export const debugClothingBinsController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("clothing_bins")
      .select("*")
      .limit(5);

    if (error) {
      console.error("Error en debug:", error);
      const response = ServiceResponse.failure(
        "Error al consultar datos",
        error
      );
      res.status(response.statusCode).json(response);
      return;
    }

    const response = ServiceResponse.success("Debug exitoso", {
      count: data?.length || 0,
      sample: data,
      error: error,
    });
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error inesperado en debug:", error);
    const response = ServiceResponse.failure("Error interno", error);
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
