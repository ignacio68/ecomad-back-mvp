import { type ClothingBin, supabase } from "../../common/lib/supabase";
import { ClothingBinRepository } from "./clothingBinRepository";

export const insertClothingBins = async (
  bins: any[]
): Promise<{ success: number; errors: any[] }> => {
  const errors: any[] = [];
  let successCount = 0;

  // Transformar los datos del CSV al formato de la base de datos
  const transformedBins: ClothingBin[] = bins.map(bin => ({
    tipo_dato: bin.TIPO_DATO,
    lote: bin.LOTE,
    cod_dist: bin.COD_DIST,
    distrito: bin.DISTRITO,
    cod_barrio: bin.COD_BARRIO,
    barrio: bin.BARRIO,
    direccion_completa: bin.DIRECCION_COMPLETA,
    via_clase: bin.VIA_CLASE,
    via_par: bin.VIA_PAR,
    via_nombre: bin.VIA_NOMBRE,
    tipo_numero: bin.TIPO_NUMERO,
    numero: bin.NUMERO,
    latitud: bin.LATITUD,
    longitud: bin.LONGITUD,
    direccion_completa_ampliada: bin["DIRECCIÓN COMPLETA AMPLIADA"],
    mas_informacion: bin["MÁS INFORMACIÓN"],
  }));

  console.log(
    `🔄 Insertando ${transformedBins.length} contenedores en Supabase...`
  );

  // Insertar en lotes de 100 para evitar límites de tamaño
  const batchSize = 100;
  for (let i = 0; i < transformedBins.length; i += batchSize) {
    const batch = transformedBins.slice(i, i + batchSize);

    try {
      const { error } = await supabase.from("clothing_bins").upsert(batch, {
        onConflict: "direccion_completa,distrito,barrio",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(
          `❌ Error en lote ${Math.floor(i / batchSize) + 1}:`,
          error
        );
        errors.push({ batch: Math.floor(i / batchSize) + 1, error });
      } else {
        successCount += batch.length;
        console.log(
          `✅ Lote ${Math.floor(i / batchSize) + 1} insertado: ${
            batch.length
          } registros`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error inesperado en lote ${Math.floor(i / batchSize) + 1}:`,
        error
      );
      errors.push({ batch: Math.floor(i / batchSize) + 1, error });
    }
  }

  return { success: successCount, errors };
};

export const clearClothingBins = async (): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    console.log("🗑️ Limpiando tabla de contenedores de ropa...");

    const { error } = await supabase
      .from("clothing_bins")
      .delete()
      .neq("id", 0); // Eliminar todos los registros

    if (error) {
      console.error("❌ Error al limpiar tabla:", error);
      return { success: false, error };
    }

    console.log("✅ Tabla limpiada correctamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error inesperado al limpiar tabla:", error);
    return { success: false, error };
  }
};

export const getClothingBinsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("clothing_bins")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Error al contar registros:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("❌ Error inesperado al contar registros:", error);
    return 0;
  }
};

// Métodos para la API
export const getAllClothingBins = async (): Promise<ClothingBin[]> => {
  try {
    const { data, error } = await supabase
      .from("clothing_bins")
      .select("*")
      .order("distrito", { ascending: true })
      .order("barrio", { ascending: true });

    if (error) {
      console.error("❌ Error al obtener contenedores:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("❌ Error inesperado al obtener contenedores:", error);
    return [];
  }
};

export const getClothingBinsByDistrict = async (
  district: string,
  page: number = 1,
  limit: number = 1000
): Promise<ClothingBin[]> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from("clothing_bins")
      .select("*")
      .eq("distrito", district)
      .order("barrio", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("❌ Error al obtener contenedores por distrito:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(
      "❌ Error inesperado al obtener contenedores por distrito:",
      error
    );
    return [];
  }
};

export const getClothingBinsByNeighborhood = async (
  neighborhood: string,
  page: number = 1,
  limit: number = 1000
): Promise<ClothingBin[]> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from("clothing_bins")
      .select("*")
      .eq("barrio", neighborhood)
      .order("distrito", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("❌ Error al obtener contenedores por barrio:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(
      "❌ Error inesperado al obtener contenedores por barrio:",
      error
    );
    return [];
  }
};

export const getClothingBinsNearby = async (
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 1000
): Promise<ClothingBin[]> => {
  try {
    // Fórmula aproximada para filtrar por distancia
    const latDiff = radiusKm / 111; // 1 grado ≈ 111 km
    const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    // Recuperar un poco más para poder ordenar por distancia real
    const fetchLimit = Math.min(Math.max(limit * 2, limit), 5000);

    const { data, error } = await supabase
      .from("clothing_bins")
      .select("*")
      .gte("latitud", lat - latDiff)
      .lte("latitud", lat + latDiff)
      .gte("longitud", lng - lngDiff)
      .lte("longitud", lng + lngDiff)
      .limit(fetchLimit);

    if (error) {
      console.error("❌ Error al obtener contenedores cercanos:", error);
      return [];
    }

    const bins = data || [];

    // Orden por distancia Haversine
    const R = 6371000; // metros
    const toRad = (d: number) => (d * Math.PI) / 180;
    const lat1 = toRad(lat);
    const lng1 = toRad(lng);

    bins.sort((a, b) => {
      const dLatA = toRad(a.latitud) - lat1;
      const dLngA = toRad(a.longitud) - lng1;
      const sa =
        Math.sin(dLatA / 2) ** 2 +
        Math.cos(lat1) * Math.cos(toRad(a.latitud)) * Math.sin(dLngA / 2) ** 2;
      const distA = 2 * R * Math.asin(Math.min(1, Math.sqrt(sa)));

      const dLatB = toRad(b.latitud) - lat1;
      const dLngB = toRad(b.longitud) - lng1;
      const sb =
        Math.sin(dLatB / 2) ** 2 +
        Math.cos(lat1) * Math.cos(toRad(b.latitud)) * Math.sin(dLngB / 2) ** 2;
      const distB = 2 * R * Math.asin(Math.min(1, Math.sqrt(sb)));

      return distA - distB;
    });

    return bins.slice(0, limit);
  } catch (error) {
    console.error(
      "❌ Error inesperado al obtener contenedores cercanos:",
      error
    );
    return [];
  }
};

// Nuevos servicios para COUNT directo
export const getDistrictCounts = async () =>
  ClothingBinRepository.getDistrictCounts();

export const getNeighborhoodCounts = async () =>
  ClothingBinRepository.getNeighborhoodCounts();
