import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Cargar variables de entorno
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipo para los contenedores de ropa
export interface ClothingBin {
	tipo_dato: string;
	lote: string;
	cod_dist: string;
	distrito: string;
	cod_barrio: string;
	barrio: string;
	direccion_completa: string;
	via_clase: string;
	via_par: string;
	via_nombre: string;
	tipo_numero: string;
	numero: string;
	latitud: number;
	longitud: number;
	direccion_completa_ampliada: string;
	mas_informacion: string;
	created_at?: string;
	updated_at?: string;
}
