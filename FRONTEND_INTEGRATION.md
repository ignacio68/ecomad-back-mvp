# 📱 Guía de Integración con Frontend

Esta guía describe cómo consumir la API de EcoMAD desde el frontend (React Native / Expo).

## 🔗 Base URL

```typescript
const API_URL = "http://localhost:8080/api/v1"; // Desarrollo
// const API_URL = 'https://api.ecomad.app/api/v1'; // Producción
```

## 📦 Tipos TypeScript

```typescript
// Estructura de respuesta estándar de la API
interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}

// Registro de contenedor
interface BinRecord {
  id: number;
  category_group_id: number;
  category_id: number;
  district_id: number;
  neighborhood_id: number | null;
  address: string;
  lat: number;
  lng: number;
  load_type: string | null;
  direction: string | null;
  subtype: string | null;
  placement_type: string | null;
  notes: string | null;
  bus_stop: string | null;
  interurban_node: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos de contenedores disponibles
type BinType =
  | "clothing_bins" // Ropa y textil (1,175)
  | "oil_bins" // Aceite vegetal (90)
  | "glass_bins" // Vidrio con publicidad (7,441)
  | "paper_bins" // Papel y cartón (7,320)
  | "plastic_bins" // Envases: plástico, metal, briks (6,846)
  | "organic_bins" // Residuos orgánicos (6,685)
  | "battery_bins" // Pilas en mupis/marquesinas (1,231)
  | "other_bins"; // Resto: residuos no reciclables (6,722)

// Conteo jerárquico
interface HierarchyCount {
  distrito: string;
  barrio: string;
  count: number;
}
```

## 🎯 Endpoints Disponibles

### 1. Obtener Conteo

```typescript
async function getBinCount(binType: BinType): Promise<number> {
  const response = await fetch(`${API_URL}/bins/${binType}/count`);
  const data: ServiceResponse<{ count: number }> = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.responseObject.count;
}

// Ejemplo de uso
const count = await getBinCount("clothing_bins"); // 1175
```

### 2. Obtener Contenedores Cercanos (Recomendado para apps móviles)

```typescript
async function getNearbyBins(
  binType: BinType,
  lat: number,
  lng: number,
  radius: number = 2,
  limit: number = 20
): Promise<BinRecord[]> {
  const url =
    `${API_URL}/bins/${binType}/nearby?` +
    `lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`;

  const response = await fetch(url);
  const data: ServiceResponse<BinRecord[]> = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.responseObject;
}

// Ejemplo de uso
const nearbyBins = await getNearbyBins(
  "clothing_bins",
  40.4168, // Puerta del Sol - latitud
  -3.7038, // Puerta del Sol - longitud
  2, // 2 km de radio
  10 // Máximo 10 resultados
);
```

### 3. Obtener por Distrito o Barrio

```typescript
async function getBinsByLocation(
  binType: BinType,
  locationType: "district" | "neighborhood",
  locationId: number,
  page: number = 1,
  limit: number = 100
): Promise<BinRecord[]> {
  const url =
    `${API_URL}/bins/${binType}/location/${locationType}/${locationId}?` +
    `page=${page}&limit=${limit}`;

  const response = await fetch(url);
  const data: ServiceResponse<BinRecord[]> = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.responseObject;
}

// Ejemplo de uso
const districtBins = await getBinsByLocation(
  "glass_bins",
  "district",
  1, // Distrito Centro
  1, // Página 1
  50 // 50 resultados por página
);

const neighborhoodBins = await getBinsByLocation(
  "oil_bins",
  "neighborhood",
  5, // Barrio Universidad
  1,
  100
);
```

### 4. Obtener Conteos Jerárquicos

```typescript
async function getHierarchyCounts(binType: BinType): Promise<HierarchyCount[]> {
  const response = await fetch(`${API_URL}/bins/${binType}/counts`);
  const data: ServiceResponse<HierarchyCount[]> = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.responseObject;
}

// Ejemplo de uso
const counts = await getHierarchyCounts("clothing_bins");
// Devuelve array de {distrito, barrio, count}
```

### 5. Obtener Todos los Contenedores

```typescript
async function getAllBins(binType: BinType): Promise<BinRecord[]> {
  const response = await fetch(`${API_URL}/bins/${binType}`);
  const data: ServiceResponse<BinRecord[]> = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.responseObject;
}

// ⚠️ ADVERTENCIA: Este endpoint puede devolver miles de registros
// Solo usar para datasets pequeños o cuando necesites todos los datos
```

## 🎣 React Hooks Recomendados

### Hook para Contenedores Cercanos

```typescript
import { useState, useEffect } from "react";

function useNearbyBins(
  binType: BinType,
  lat: number,
  lng: number,
  radius: number = 2
) {
  const [bins, setBins] = useState<BinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBins() {
      try {
        setLoading(true);
        setError(null);

        const data = await getNearbyBins(binType, lat, lng, radius);

        if (!cancelled) {
          setBins(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBins();

    return () => {
      cancelled = true;
    };
  }, [binType, lat, lng, radius]);

  return { bins, loading, error };
}

// Uso en componente
function BinMap() {
  const { bins, loading, error } = useNearbyBins(
    "clothing_bins",
    40.4168,
    -3.7038,
    2
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Map>
      {bins.map(bin => (
        <Marker
          key={bin.id}
          coordinate={{ latitude: bin.lat, longitude: bin.lng }}
          title={bin.address}
          description={bin.notes || ""}
        />
      ))}
    </Map>
  );
}
```

### Hook para Conteo de Bins

```typescript
function useBinCount(binType: BinType) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const total = await getBinCount(binType);
        if (!cancelled) {
          setCount(total);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCount();

    return () => {
      cancelled = true;
    };
  }, [binType]);

  return { count, loading };
}
```

## 🗺️ Ejemplo Completo: Mapa de Contenedores Cercanos

```typescript
import React, { useState } from "react";
import { View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export function NearbyBinsMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [binType, setBinType] = useState<BinType>("clothing_bins");

  // Obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    })();
  }, []);

  // Obtener bins cercanos
  const { bins, loading, error } = useNearbyBins(
    binType,
    location?.lat || 40.4168,
    location?.lng || -3.7038,
    2 // 2km de radio
  );

  if (!location || loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        {/* Ubicación del usuario */}
        <Marker
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          pinColor="blue"
          title="Tu ubicación"
        />

        {/* Contenedores cercanos */}
        {bins.map(bin => (
          <Marker
            key={bin.id}
            coordinate={{ latitude: bin.lat, longitude: bin.lng }}
            pinColor="green"
            title={bin.address}
            description={`Distrito: ${bin.district_id} | Barrio: ${bin.neighborhood_id}`}
          />
        ))}
      </MapView>

      {/* Selector de tipo de contenedor */}
      <BinTypeSelector value={binType} onChange={setBinType} />

      {/* Contador de resultados */}
      <Text
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          backgroundColor: "white",
          padding: 10,
        }}>
        {bins.length} contenedores encontrados
      </Text>
    </View>
  );
}
```

## 📊 IDs de Distritos y Barrios

### Distritos de Madrid (1-35)

| ID  | Nombre              |
| --- | ------------------- |
| 1   | Centro              |
| 2   | Arganzuela          |
| 3   | Retiro              |
| 4   | Salamanca           |
| 5   | Chamartín           |
| 6   | Tetuán              |
| 7   | Chamberí            |
| 8   | Fuencarral-El Pardo |
| 9   | Moncloa-Aravaca     |
| 10  | Latina              |
| 11  | Carabanchel         |
| 12  | Usera               |
| 13  | Puente de Vallecas  |
| 14  | Moratalaz           |
| 15  | Ciudad Lineal       |
| 16  | Hortaleza           |
| 17  | Villaverde          |
| 18  | Villa de Vallecas   |
| 19  | Vicálvaro           |
| 20  | San Blas-Canillejas |
| 21  | Barajas             |

_Nota_: Los IDs de barrios (neighborhood_id) van del 1 al 218. Consulta el endpoint `/counts` para ver qué barrios tienen contenedores de cada tipo.

## 🎯 Casos de Uso Recomendados

### Caso 1: App móvil con geolocalización

**Endpoint recomendado**: `/nearby`

```typescript
const bins = await getNearbyBins("clothing_bins", userLat, userLng, 2, 20);
```

### Caso 2: Búsqueda por distrito

**Endpoint recomendado**: `/location/district/:id`

```typescript
const bins = await getBinsByLocation("glass_bins", "district", 1);
```

### Caso 3: Estadísticas y visualizaciones

**Endpoint recomendado**: `/counts`

```typescript
const counts = await getHierarchyCounts("oil_bins");
```

### Caso 4: Mapa completo de la ciudad

**Endpoint recomendado**: `/:binType` con cache

```typescript
// Cargar una vez y cachear en el cliente
const allBins = await getAllBins("clothing_bins");
// Guardar en AsyncStorage o similar para uso offline
```

## ⚡ Optimización y Performance

### Cache en Cliente

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getCachedBins(binType: BinType): Promise<BinRecord[]> {
  const cacheKey = `bins_${binType}`;
  const cacheDuration = 5 * 60 * 1000; // 5 minutos

  // Verificar cache
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheDuration) {
      return data;
    }
  }

  // Fetch nuevo
  const bins = await getAllBins(binType);

  // Guardar en cache
  await AsyncStorage.setItem(
    cacheKey,
    JSON.stringify({
      data: bins,
      timestamp: Date.now(),
    })
  );

  return bins;
}
```

### Paginación

Para datasets grandes, usa paginación:

```typescript
async function getBinsPaginated(
  binType: BinType,
  district: number,
  page: number = 1
): Promise<BinRecord[]> {
  return await getBinsByLocation(binType, "district", district, page, 100);
}

// Cargar más al hacer scroll
let currentPage = 1;
const loadMore = async () => {
  const moreBins = await getBinsPaginated("glass_bins", 1, ++currentPage);
  setBins(prev => [...prev, ...moreBins]);
};
```

### Debouncing para Búsquedas en Tiempo Real

```typescript
import { useDebounce } from "use-debounce";

function LiveSearch() {
  const [lat, setLat] = useState(40.4168);
  const [lng, setLng] = useState(-3.7038);

  // Debounce para evitar llamadas excesivas
  const [debouncedLat] = useDebounce(lat, 500);
  const [debouncedLng] = useDebounce(lng, 500);

  const { bins } = useNearbyBins(
    "clothing_bins",
    debouncedLat,
    debouncedLng,
    2
  );

  return <Map bins={bins} />;
}
```

## 🔥 Características de los Datos

### Coordenadas

- **Sistema**: WGS84 (mismo que GPS)
- **Formato**: Decimal (ej: 40.4168, -3.7038)
- **Rango Madrid**:
  - Latitud: 40.33 a 40.52
  - Longitud: -3.84 a -3.55

### Notas Importantes

1. **`neighborhood_id` puede ser `null`** en algunos registros
2. **Campos opcionales** (`load_type`, `subtype`, etc.) pueden ser `null`
3. **`notes`** contiene información adicional útil para mostrar al usuario
4. **`bus_stop` e `interurban_node`** solo están presentes en `battery_bins`

### Filtrado en Cliente

Si necesitas filtrar en el cliente, recuerda que algunos campos son `null`:

```typescript
// ✅ Correcto
const validBins = bins.filter(bin => bin.neighborhood_id !== null);

// ✅ Correcto
const binsWithNotes = bins.filter(bin => bin.notes && bin.notes.length > 0);

// ❌ Incorrecto (puede causar errores)
const filtered = bins.filter(bin => bin.neighborhood_id > 0); // Error si es null
```

## 🚀 Rendimiento

### Tiempos de Respuesta Estimados

| Endpoint            | Dataset Pequeño | Dataset Grande |
| ------------------- | --------------- | -------------- |
| `/count`            | ~50ms           | ~100ms         |
| `/nearby`           | ~100ms          | ~200ms         |
| `/location`         | ~150ms          | ~300ms         |
| `/counts`           | ~200ms          | ~500ms         |
| `/:binType` (todos) | ~500ms          | ~2000ms        |

### Recomendaciones

1. **Usa `/nearby`** para apps móviles con geolocalización
2. **Cachea resultados** en el cliente cuando sea posible
3. **Usa paginación** para `/location` con datasets grandes
4. **Evita llamar a `/:binType`** sin necesidad (1000+ registros)
5. **Implementa debouncing** en búsquedas en tiempo real

## 🧪 Testing

```typescript
// Mock para testing
const mockBin: BinRecord = {
  id: 1,
  category_group_id: 1,
  category_id: 14,
  district_id: 1,
  neighborhood_id: 5,
  address: "CALLE DEL DESENGAÑO, 16",
  lat: 40.42091,
  lng: -3.70348,
  load_type: null,
  direction: null,
  subtype: null,
  placement_type: null,
  notes: "Punto limpio disponible",
  bus_stop: null,
  interurban_node: null,
  created_at: "2025-11-05T14:10:46.524733+00:00",
  updated_at: "2025-11-05T14:12:16.932091+00:00",
};
```

## 📞 Soporte

- **API Base URL**: `http://localhost:8080/api/v1`
- **Documentación Swagger**: `http://localhost:8080/api-docs`
- **Health Check**: `http://localhost:8080/health`

---

**✨ ¡La API está lista para ser consumida por el frontend!** 🚀
