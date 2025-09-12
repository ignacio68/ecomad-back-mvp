import { type ClothingBin, supabase } from "../../common/lib/supabase";

export class ClothingBinRepository {
  /**
   * Obtener todos los contenedores de ropa
   */
  static async findAll(): Promise<ClothingBin[]> {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("*")
        .order("distrito", { ascending: true })
        .order("barrio", { ascending: true });

      if (error) {
        console.error("Error en ClothingBinRepository.findAll:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.findAll:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener contenedores por distrito
   */
  static async findByDistrict(district: string): Promise<ClothingBin[]> {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("*")
        .eq("distrito", district)
        .order("barrio", { ascending: true });

      if (error) {
        console.error("Error en ClothingBinRepository.findByDistrict:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.findByDistrict:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener contenedores por barrio
   */
  static async findByNeighborhood(
    neighborhood: string
  ): Promise<ClothingBin[]> {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("*")
        .eq("barrio", neighborhood)
        .order("distrito", { ascending: true });

      if (error) {
        console.error(
          "Error en ClothingBinRepository.findByNeighborhood:",
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.findByNeighborhood:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener contenedores cercanos a una ubicación
   */
  static async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
    limit: number = 1000
  ): Promise<ClothingBin[]> {
    try {
      // Fórmula aproximada para filtrar por distancia
      const latDiff = radiusKm / 111; // 1 grado ≈ 111 km
      const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

      const { data, error } = await supabase
        .from("clothing_bins")
        .select("*")
        .gte("latitud", lat - latDiff)
        .lte("latitud", lat + latDiff)
        .gte("longitud", lng - lngDiff)
        .lte("longitud", lng + lngDiff)
        .limit(limit);

      if (error) {
        console.error("Error en ClothingBinRepository.findNearby:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.findNearby:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener el conteo total de contenedores
   */
  static async count(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("clothing_bins")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error en ClothingBinRepository.count:", error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error inesperado en ClothingBinRepository.count:", error);
      throw error;
    }
  }

  /**
   * Obtener contenedor por ID
   */
  static async findById(id: number): Promise<ClothingBin | null> {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error en ClothingBinRepository.findById:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.findById:",
        error
      );
      throw error;
    }
  }

  /**
   * Obtener distritos únicos
   */
  static async getDistricts(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("distrito")
        .order("distrito", { ascending: true });

      if (error) {
        console.error("Error en ClothingBinRepository.getDistricts:", error);
        throw error;
      }

      // Extraer distritos únicos
      const districts = [...new Set(data?.map(item => item.distrito) || [])];
      return districts;
    } catch (error) {
      console.error(
        "Error inesperado en ClothingBinRepository.getDistricts:",
        error
      );
      throw error;
    }
  }

  // Nuevos métodos para COUNT directo sin filtrar por bounds
  static async getDistrictCounts(): Promise<
    Array<{
      distrito: string;
      count: number;
      centroid: { lat: number; lng: number };
    }>
  > {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("distrito, latitud, longitud");

      if (error) {
        console.error("Error en getDistrictCounts:", error);
        throw error;
      }

      const groups = new Map<
        string,
        { count: number; sumLat: number; sumLng: number }
      >();

      for (const row of data || []) {
        const key = row.distrito as string;
        const g = groups.get(key) || { count: 0, sumLat: 0, sumLng: 0 };
        g.count += 1;
        g.sumLat += Number(row.latitud);
        g.sumLng += Number(row.longitud);
        groups.set(key, g);
      }

      return Array.from(groups.entries()).map(([distrito, g]) => ({
        distrito,
        count: g.count,
        centroid: { lat: g.sumLat / g.count, lng: g.sumLng / g.count },
      }));
    } catch (error) {
      console.error("Error inesperado en getDistrictCounts:", error);
      throw error;
    }
  }

  static async getNeighborhoodCounts(): Promise<
    Array<{
      distrito: string;
      barrio: string;
      count: number;
      centroid: { lat: number; lng: number };
    }>
  > {
    try {
      const { data, error } = await supabase
        .from("clothing_bins")
        .select("distrito, barrio, latitud, longitud");

      if (error) {
        console.error("Error en getNeighborhoodCounts:", error);
        throw error;
      }

      const groups = new Map<
        string,
        { count: number; sumLat: number; sumLng: number }
      >();

      for (const row of data || []) {
        const key = `${row.distrito}-${row.barrio}`;
        const g = groups.get(key) || { count: 0, sumLat: 0, sumLng: 0 };
        g.count += 1;
        g.sumLat += Number(row.latitud);
        g.sumLng += Number(row.longitud);
        groups.set(key, g);
      }

      return Array.from(groups.entries()).map(([key, g]) => {
        const [distrito, barrio] = key.split("-");
        return {
          distrito,
          barrio,
          count: g.count,
          centroid: { lat: g.sumLat / g.count, lng: g.sumLng / g.count },
        };
      });
    } catch (error) {
      console.error("Error inesperado en getNeighborhoodCounts:", error);
      throw error;
    }
  }
}
