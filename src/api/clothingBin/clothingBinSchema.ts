import { z } from "zod";

export const clothingBinSchema = z.object({
	TIPO_DATO: z.string(),
	LOTE: z.string().or(z.number().transform(Number)),
	COD_DIST: z.string().or(z.number().transform(Number)),
	DISTRITO: z.string(),
	COD_BARRIO: z.string().or(z.number().transform(Number)),
	BARRIO: z.string(),
	DIRECCION_COMPLETA: z.string(),
	VIA_CLASE: z.string(),
	VIA_PAR: z.string(),
	VIA_NOMBRE: z.string(),
	TIPO_NUMERO: z.string(),
	NUMERO: z.string(),
	LATITUD: z.string().transform((s) => parseFloat(s.replace(",", "."))),
	LONGITUD: z.string().transform((s) => parseFloat(s.replace(",", "."))),
	"DIRECCIÓN COMPLETA AMPLIADA": z.string(),
	"MÁS INFORMACIÓN": z.string(),
});
