import { z } from "zod";
import type { clothingBinSchema } from "./clothingBinSchema";

// Esquema para validar parámetros de consulta
export const clothingBinQuerySchema = z.object({
	lat: z.string().optional(),
	lng: z.string().optional(),
	radius: z.string().optional(),
});

// Esquema para validar parámetros de ruta
export const clothingBinParamsSchema = z.object({
	district: z.string().min(1, "El distrito es requerido"),
});

// Tipo para los parámetros de consulta
export type ClothingBinQuery = z.infer<typeof clothingBinQuerySchema>;

// Tipo para los parámetros de ruta
export type ClothingBinParams = z.infer<typeof clothingBinParamsSchema>;

// Tipo para un contenedor de ropa validado
export type ClothingBinValidated = z.infer<typeof clothingBinSchema>;
