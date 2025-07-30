import type { Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "../../common/models/serviceResponse";
import {
  getAllClothingBins,
  getClothingBinsByDistrict,
  getClothingBinsCount,
  getClothingBinsNearby,
} from "./clothingBinService";

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
