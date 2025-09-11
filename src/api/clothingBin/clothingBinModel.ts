import { z } from "zod";
import type { clothingBinSchema } from "./clothingBinSchema";

// Esquema para validar parámetros de consulta
export const clothingBinQuerySchema = z.object({
  lat: z.string().optional(),
  lng: z.string().optional(),
  radius: z.string().optional(),
  limit: z.string().optional(),
});

export const bboxQuerySchema = z.object({
  minLat: z.string().describe("Latitud mínima"),
  minLng: z.string().describe("Longitud mínima"),
  maxLat: z.string().describe("Latitud máxima"),
  maxLng: z.string().describe("Longitud máxima"),
});

// Esquema para validar parámetros de ruta
export const clothingBinParamsSchema = z.object({
  district: z.string().min(1, "El distrito es requerido"),
});

export const clothingBinNeighborhoodParamsSchema = z.object({
  neighborhood: z.string().min(1, "El barrio es requerido"),
});

// Tipo para los parámetros de consulta
export type ClothingBinQuery = z.infer<typeof clothingBinQuerySchema>;

// Tipo para los parámetros de ruta
export type ClothingBinParams = z.infer<typeof clothingBinParamsSchema>;
export type ClothingBinNeighborhoodParams = z.infer<
  typeof clothingBinNeighborhoodParamsSchema
>;
export type BBoxQuery = z.infer<typeof bboxQuerySchema>;

// Tipo para un contenedor de ropa validado
export type ClothingBinValidated = z.infer<typeof clothingBinSchema>;
