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
