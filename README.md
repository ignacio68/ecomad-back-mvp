# EcoMAD Backend MVP

API REST para la gestión de contenedores de reciclaje en la ciudad de Madrid.

## 🚀 Características

- **Gestión de contenedores**: Obtener información sobre diferentes tipos de contenedores de reciclaje
- **Búsqueda por ubicación**: Filtrar contenedores por distrito o barrio
- **Búsqueda por proximidad**: Encontrar contenedores cercanos a una ubicación específica
- **Estadísticas**: Obtener conteos y estadísticas jerárquicas por distrito y barrio
- **Cache inteligente**: Respuestas optimizadas con cache headers para mejor rendimiento
- **API versionada**: Estructura preparada para futuras versiones de la API
- **Documentación OpenAPI**: Documentación automática con Swagger UI

## 📁 Estructura del Proyecto

```
src/
├── app.ts                          # Configuración principal de la aplicación
├── index.ts                        # Punto de entrada del servidor
├── api/                            # API REST
│   ├── apiRouter.ts                # Router principal de la API
│   ├── v1/                         # Versión 1 de la API
│   │   ├── v1Router.ts            # Router de la v1
│   │   ├── bins/                   # Módulo de contenedores
│   │   │   ├── controllers/        # Controladores HTTP
│   │   │   ├── middleware/         # Middleware específico
│   │   │   ├── routes/             # Rutas Express
│   │   │   ├── schemas/            # Esquemas Zod
│   │   │   ├── services/           # Lógica de negocio
│   │   │   ├── repositories/       # Acceso a datos
│   │   │   ├── types/              # Tipos TypeScript
│   │   │   ├── constants/          # Constantes y mensajes
│   │   │   ├── utils/              # Utilidades específicas
│   │   │   └── scripts/            # Scripts de utilidad
│   │   └── docs/                   # Documentación OpenAPI v1
│   └── common/                     # Utilidades comunes de la API
│       ├── lib/                    # Cliente Supabase
│       ├── utils/                  # Utilidades (geo, validación, etc.)
│       └── constants/              # Constantes globales
├── api-docs/                       # Documentación OpenAPI
│   ├── openAPIDocumentGenerator.ts # Generador de documentación
│   ├── openAPIRouter.ts            # Router de Swagger UI
│   └── responseBuilders.ts         # Constructores de respuestas
├── shared/                         # Utilidades compartidas
│   ├── lib/                        # Configuración OpenAPI
│   ├── middleware/                 # Middleware global
│   ├── models/                     # Modelos de respuesta
│   └── utils/                      # Utilidades generales
└── tests/                          # Tests y mocks
    ├── mocks/                      # Mocks para testing
    └── setup/                      # Configuración de tests
```

## 🛠️ Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Supabase** - Base de datos y autenticación
- **Zod** - Validación de esquemas
- **OpenAPI 3.0** - Documentación de API
- **Swagger UI** - Interfaz de documentación
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Control de velocidad de requests
- **Vitest** - Framework de testing
- **Biome** - Linter y formateador
- **Husky** - Git hooks
- **tsup** - Bundler para TypeScript

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- pnpm (gestor de paquetes recomendado)
- Cuenta de Supabase

> **Nota**: Este proyecto usa `pnpm` como gestor de paquetes. Si no lo tienes instalado:
>
> ```bash
> npm install -g pnpm
> ```

### Configuración

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd ecomad-back-mvp
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**

   **⚠️ IMPORTANTE**: Los archivos `.env` NO están en el repositorio por seguridad.

   Copia el archivo de ejemplo y configúralo:

   ```bash
   # Para desarrollo
   cp env.example .env.development

   # Para tests
   cp env.example .env.test

   # Para producción (Render usa variables de entorno directamente)
   cp env.example .env.production
   ```

   Luego edita cada archivo con tus valores reales:

   - `SUPABASE_URL`: https://supabase.com/dashboard/project/_/settings/api
   - `SUPABASE_ANON_KEY`: Tu clave anon/public de Supabase
   - `CORS_ORIGIN`: Orígenes permitidos (separados por comas)

   **Valores recomendados por entorno:**

   - **Development**: `COMMON_RATE_LIMIT_MAX_REQUESTS=1000`
   - **Production**: `COMMON_RATE_LIMIT_MAX_REQUESTS=20`
   - **Test**: `COMMON_RATE_LIMIT_MAX_REQUESTS=10000`

   > 📝 Ver `env.example` para la lista completa de variables

   **Ejemplo mínimo `.env.development`:**

   ```env
   NODE_ENV=development
   PORT=8080
   HOST=0.0.0.0
   CORS_ORIGIN=https://your-frontend-domain.com

   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # Rate limiting (estricto en producción)
   COMMON_RATE_LIMIT_MAX_REQUESTS=20
   COMMON_RATE_LIMIT_WINDOW_MS=900000

   # Nearby defaults
   MAX_RADIUS_KM=5
   DEFAULT_LIMIT=1000
   ```

4. **Configurar base de datos**
   - Ejecutar el script SQL en `supabase-schema.sql` en tu proyecto de Supabase
   - Configurar Row Level Security (RLS) según las políticas definidas
   - Importar datos CSV usando `pnpm run import:bins`

## 🚀 Ejecución

### Desarrollo

```bash
NODE_ENV=development pnpm run start:dev
```

### Producción

```bash
NODE_ENV=production pnpm run build
NODE_ENV=production pnpm run start:prod
```

### Scripts disponibles

```bash
pnpm run start:dev    # Desarrollo con hot reload
pnpm run start:prod   # Ejecutar versión compilada
pnpm run build        # Compilar TypeScript
pnpm run test         # Ejecutar tests
pnpm run test:cov     # Tests con coverage
pnpm run check        # Linter y formatter (auto-fix)
pnpm run check:ci     # Verificación CI (sin auto-fix)
pnpm run import:bins  # Importar datos CSV a Supabase
pnpm run prepare      # Configurar Husky (automático)
```

## 📚 API Endpoints

### Base URL

```
http://localhost:8080/api/v1
```

### Tipos de contenedores soportados

| Tipo            | Descripción                                     | Total      |
| --------------- | ----------------------------------------------- | ---------- |
| `clothing_bins` | Contenedores de ropa y textil                   | 1,175      |
| `oil_bins`      | Contenedores de aceite vegetal usado            | 90         |
| `glass_bins`    | Contenedores de vidrio con publicidad           | 7,441      |
| `paper_bins`    | Contenedores de papel y cartón                  | 7,320      |
| `plastic_bins`  | Contenedores de envases (plástico, metal, brik) | 6,846      |
| `organic_bins`  | Contenedores de residuos orgánicos              | 6,685      |
| `battery_bins`  | Puntos de recogida de pilas (mupis/marquesinas) | 1,231      |
| `other_bins`    | Contenedores de resto (residuos no reciclables) | 6,722      |
| **TOTAL**       |                                                 | **37,510** |

### Endpoints principales

Todos los endpoints devuelven respuestas en formato `ServiceResponse`:

```typescript
{
  success: boolean;
  message: string;
  responseObject: any | null;
  statusCode: number;
}
```

#### 📊 Obtener todos los contenedores

```http
GET /api/v1/bins/{binType}
```

**Response:**

```json
{
  "success": true,
  "message": "Contenedores obtenidos exitosamente",
  "responseObject": [
    {
      "id": 12947,
      "category_group_id": 1,
      "category_id": 14,
      "district_id": 1,
      "neighborhood_id": 2,
      "address": "CALLE DE ATOCHA, 108",
      "lat": 40.4098,
      "lng": -3.69396,
      "load_type": null,
      "direction": null,
      "subtype": null,
      "placement_type": null,
      "notes": "Información adicional...",
      "bus_stop": null,
      "interurban_node": null,
      "created_at": "2025-11-05T14:10:46.524733+00:00",
      "updated_at": "2025-11-05T14:12:16.932091+00:00"
    }
  ],
  "statusCode": 200
}
```

**Cache**: 60s (stale-while-revalidate: 120s)

---

#### 📈 Obtener conteo de contenedores

```http
GET /api/v1/bins/{binType}/count
```

**Response:**

```json
{
  "success": true,
  "message": "Conteo de contenedores obtenido exitosamente",
  "responseObject": {
    "count": 1175
  },
  "statusCode": 200
}
```

**Cache**: 300s (stale-while-revalidate: 600s)

---

#### 🗺️ Obtener por ubicación

```http
GET /api/v1/bins/{binType}/location/{locationType}/{locationValue}?page=1&limit=100
```

**Parámetros:**

- `locationType`: `district` o `neighborhood`
- `locationValue`: ID numérico del distrito (1-35) o barrio (1-218)
- `page` (opcional): Número de página, default 1
- `limit` (opcional): Registros por página, default 100, max 1000

**Ejemplo:**

```bash
# Contenedores de ropa en distrito 1 (Centro)
GET /api/v1/bins/clothing_bins/location/district/1

# Contenedores de vidrio en barrio 5
GET /api/v1/bins/glass_bins/location/neighborhood/5
```

**Response:** Array de bins (mismo formato que endpoint principal)

**Cache**: 300s (stale-while-revalidate: 600s)

---

#### 📍 Obtener contenedores cercanos

```http
GET /api/v1/bins/{binType}/nearby?lat={latitude}&lng={longitude}&radius={km}&limit={n}
```

**Parámetros:**

- `lat` (requerido): Latitud (-90 a 90)
- `lng` (requerido): Longitud (-180 a 180)
- `radius` (opcional): Radio en kilómetros, default 5km, max 100km
- `limit` (opcional): Número máximo de resultados, default 100, max 1000

**Ejemplo:**

```bash
# Contenedores de ropa a 2km de la Puerta del Sol
GET /api/v1/bins/clothing_bins/nearby?lat=40.4168&lng=-3.7038&radius=2&limit=50
```

**Response:** Array de bins ordenados por distancia (cercano → lejano)

**Cache**: 30s (stale-while-revalidate: 60s)

**Nota**: Este endpoint filtra en memoria. Para datasets grandes (>5000 bins), puede ser lento.

---

#### 📊 Conteos jerárquicos

```http
GET /api/v1/bins/{binType}/counts
```

**Response:**

```json
{
  "success": true,
  "message": "Conteos jerárquicos obtenidos exitosamente",
  "responseObject": [
    {
      "distrito": "1",
      "barrio": "5",
      "count": 17
    },
    {
      "distrito": "1",
      "barrio": "2",
      "count": 7
    }
  ],
  "statusCode": 200
}
```

**Cache**: 300s (stale-while-revalidate: 600s)

---

#### 🔧 Endpoints de administración

**⚠️ Estos endpoints están en desarrollo y serán protegidos con autenticación:**

```http
POST /api/v1/bins/{binType}/load-data    # Cargar datos desde CSV
GET  /api/v1/bins/{binType}/debug        # Debug endpoint
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T16:14:16.238Z",
  "uptime": 90.547,
  "environment": "development",
  "version": "1.0.1"
}
```

---

### API Info

```http
GET /api/info
```

**Response:**

```json
{
  "name": "EcoMAD API",
  "version": "1.0.0",
  "description": "API REST para la gestión de contenedores de reciclaje en Madrid",
  "endpoints": {
    "health": "/health",
    "documentation": "/api-docs",
    "swagger": "/swagger.json",
    "api": "/api/v1"
  },
  "binTypes": {
    "clothing_bins": { "description": "Ropa y textil", "total": 1175 },
    ...
  },
  "totalBins": 37510
}
```

## 📖 Documentación de la API

La documentación completa está disponible en:

- **Swagger UI** (interactiva): http://localhost:8080/api-docs
- **OpenAPI JSON**: http://localhost:8080/swagger.json
- **API Info** (resumen): http://localhost:8080/api/info
- **Health Check**: http://localhost:8080/health

### Verificación rápida

```bash
# Información de la API
curl http://localhost:8080/api/info | jq .

# Estado del servidor
curl http://localhost:8080/health | jq .

# Especificación OpenAPI
curl http://localhost:8080/swagger.json | jq .

# Probar un endpoint
curl "http://localhost:8080/api/v1/bins/clothing_bins/count" | jq .
```

## 🗄️ Base de Datos

### Estructura de tablas

Todas las tablas de contenedores (`*_bins`) comparten el mismo esquema:

```typescript
interface BinRecord {
  id: number; // ID único del contenedor
  category_group_id: number; // ID del grupo de categoría
  category_id: number; // ID de la categoría específica
  district_id: number; // ID del distrito (1-35)
  neighborhood_id: number | null; // ID del barrio (1-218) - opcional
  address: string; // Dirección completa
  lat: number; // Latitud (WGS84)
  lng: number; // Longitud (WGS84)
  load_type: string | null; // Tipo de carga (opcional)
  direction: string | null; // Dirección adicional (opcional)
  subtype: string | null; // Subtipo de contenedor (opcional)
  placement_type: string | null; // Tipo de emplazamiento (opcional)
  notes: string | null; // Notas adicionales (opcional)
  bus_stop: string | null; // Parada de bus (solo battery_bins)
  interurban_node: string | null; // Nodo interurbano (solo battery_bins)
  created_at: string; // Fecha de creación (ISO 8601)
  updated_at: string; // Fecha de actualización (ISO 8601)
}
```

### Tablas auxiliares

- `districts` - Información de los 35 distritos de Madrid
- `neighborhoods` - Información de los 218 barrios
- `categories` - Categorías de residuos (textil, vidrio, aceite, etc.)
- `category_groups` - Grupos de categorías (reciclaje, residuos, etc.)
- `column_mappings` - Mapeo de columnas CSV a campos de BD
- `import_logs` - Registro de importaciones de datos

## 🔧 Scripts de Utilidad

### Importar datos de contenedores

```bash
# Importar todos los CSVs a Supabase
pnpm run import:bins
```

El script importa datos desde los archivos CSV en `/data/bins/` y los sube a Supabase usando las funciones PL/pgSQL de importación.

**Archivos CSV soportados:**

- `Contenedores_textil.csv` → `clothing_bins` (1,175 registros)
- `Contenedores_aceite.csv` → `oil_bins` (90 registros)
- `Contenedores_vidrio_pub.csv` → `glass_bins` (7,441 registros)
- `Mupis_Marquesinas_pilas.csv` → `battery_bins` (1,231 registros)
- `Contenedores_varios.csv` → `paper_bins`, `plastic_bins`, `organic_bins`, `other_bins` (27,573 registros)

---

## 📱 Integración con Frontend

### Ejemplo de uso en React Native / Expo

```typescript
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8080/api/v1";

interface BinRecord {
  id: number;
  address: string;
  lat: number;
  lng: number;
  district_id: number;
  neighborhood_id: number | null;
  notes: string | null;
  // ... otros campos
}

interface ServiceResponse<T> {
  success: boolean;
  message: string;
  responseObject: T;
  statusCode: number;
}

// Hook para obtener contenedores cercanos
export function useNearbyBins(lat: number, lng: number, radius = 2) {
  const [bins, setBins] = useState<BinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearbyBins() {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/bins/clothing_bins/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
        );

        const data: ServiceResponse<BinRecord[]> = await response.json();

        if (data.success) {
          setBins(data.responseObject);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error al cargar contenedores");
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyBins();
  }, [lat, lng, radius]);

  return { bins, loading, error };
}

// Hook para obtener conteos por distrito
export async function getBinCounts(binType: string) {
  const response = await fetch(`${API_URL}/bins/${binType}/count`);
  const data: ServiceResponse<{ count: number }> = await response.json();
  return data.responseObject.count;
}
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm run test

# Tests en modo watch
pnpm run test:watch

# Tests con coverage
pnpm run test:cov
```

### Cobertura de tests

- **Repositories**: Acceso a datos y operaciones de base de datos
- **Services**: Lógica de negocio y validaciones
- **Controllers**: Manejo de HTTP requests/responses
- **Middleware**: Validación de tipos y parámetros
- **Utils**: Funciones de utilidad y helpers

### Estructura de tests

```
src/
├── tests/
│   ├── mocks/           # Mocks reutilizables
│   │   ├── supabaseMocks.ts
│   │   └── binsDataMocks.ts
│   └── setup/           # Configuración global
│       └── supabase.mock.ts
└── **/__tests__/        # Tests por módulo
    ├── repositories/
    ├── services/
    ├── controllers/
    └── middleware/
```

## 🔒 Seguridad

- **Rate Limiting**: 100 requests/minuto por IP
- **CORS**: Configurado para dominios específicos
- **Helmet**: Headers de seguridad HTTP
- **Validación**: Todos los inputs validados con Zod
- **Sanitización**: Caracteres peligrosos filtrados en URLs
- **Request Size Limits**: Límites en tamaño de requests
- **Content-Type Validation**: Validación de tipos de contenido
- **Graceful Shutdown**: Manejo seguro de cierre del servidor

## 🚀 Despliegue

### Variables de entorno de producción

```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=https://your-frontend-domain.com
```

### Render (Recomendado)

```bash
# Configurar variables de entorno en Render Dashboard
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=https://your-frontend-domain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands para Render

```bash
Build Command: pnpm run build
Start Command: pnpm run start:prod
```

## 🏗️ Arquitectura

### Patrón de Diseño

El proyecto implementa una **arquitectura en capas** con separación clara de responsabilidades:

```
┌─────────────────┐
│   Controllers   │ ← Manejo de HTTP requests/responses
├─────────────────┤
│    Services     │ ← Lógica de negocio
├─────────────────┤
│  Repositories   │ ← Acceso a datos (Supabase)
├─────────────────┤
│    Database     │ ← Supabase PostgreSQL
└─────────────────┘
```

### Principios de Calidad

- **Separación de Responsabilidades**: Cada capa tiene una función específica
- **Inmutabilidad**: Uso de métodos como `toSorted()` para evitar mutaciones
- **Error Handling**: Manejo consistente de errores con códigos HTTP apropiados
- **Type Safety**: TypeScript estricto con validación Zod
- **Testing**: Cobertura completa de tests unitarios
- **Documentación**: OpenAPI/Swagger automática y actualizada

### Git Hooks (Husky)

- **pre-commit**: Lint + format + tests rápidos
- **pre-push**: Tests completos + build verification

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- **Usar `pnpm` como package manager** (no npm ni yarn)
- Seguir las reglas de Biome para linting/formatting
- Escribir tests para nuevas funcionalidades
- Mantener la cobertura de tests > 80%
- Actualizar documentación OpenAPI cuando sea necesario
- Usar `pnpm run` para ejecutar scripts

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **EcoMAD Team** - contact@ecomad.app
- **Proyecto**: https://ecomad.app
- **Documentación**: http://localhost:8080/api-docs

---

## 📊 Estado del Proyecto

### ✅ Completado

- ✅ API REST completa con 7 endpoints
- ✅ Documentación OpenAPI/Swagger actualizada
- ✅ Arquitectura en capas (Controller-Service-Repository)
- ✅ Testing completo con cobertura > 80%
- ✅ Validación de datos con Zod
- ✅ Manejo de errores consistente
- ✅ Seguridad y rate limiting
- ✅ Git hooks con Husky
- ✅ Linting y formatting automático
- ✅ Build optimizado con tsup

### 🚀 Listo para Producción

- ✅ Código estable y probado
- ✅ Documentación completa
- ✅ Configuración para Render
- ✅ Variables de entorno configuradas
- ✅ Scripts de deployment listos

### 📋 Próximos Pasos

- 🔄 Integración con frontend React Native
- 📱 Optimizaciones para móvil
- 🔍 Búsqueda avanzada por texto
- 📊 Dashboard de administración
- 🔐 Autenticación de usuarios

---

**Nota**: Este es un MVP (Minimum Viable Product) **completado y listo para producción**. La API es estable y está documentada.
