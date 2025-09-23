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

   ```bash
   cp env.example config.env
   ```

   Editar `config.env` con tus credenciales de Supabase:

   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=development
   PORT=8080
   HOST=localhost
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Configurar base de datos**
   - Ejecutar el script SQL en `supabase-schema.sql`
   - O usar el setup documentado en `SUPABASE_SETUP.md`

## 🚀 Ejecución

### Desarrollo

```bash
pnpm run dev
```

### Producción

```bash
pnpm run build
pnpm start
```

### Scripts disponibles

```bash
pnpm run dev          # Desarrollo con hot reload
pnpm run build        # Compilar TypeScript
pnpm run start        # Ejecutar en producción
pnpm run start:prod   # Ejecutar versión compilada
pnpm run test         # Ejecutar tests
pnpm run test:watch   # Tests en modo watch
pnpm run test:cov     # Tests con coverage
pnpm run lint         # Linter
pnpm run lint:fix     # Linter con auto-fix
pnpm run check:ci     # Verificación completa (lint + test + build)
pnpm run prepare      # Configurar Husky (automático)
```

## 📚 API Endpoints

### Base URL

```
http://localhost:8080/api/v1
```

### Tipos de contenedores soportados

- `clothing_bins` - Contenedores de ropa y textil
- `oil_bins` - Contenedores de aceite vegetal usado
- `glass_bins` - Contenedores de vidrio
- `paper_bins` - Contenedores de papel y cartón
- `plastic_bins` - Contenedores de envases (plástico, metal, briks)
- `organic_bins` - Contenedores de residuos orgánicos
- `other_bins` - Contenedores de resto de residuos

### Endpoints principales

#### 📊 Obtener todos los contenedores

```http
GET /api/v1/bins/{binType}?page=1&limit=100
```

#### 📈 Obtener conteo de contenedores

```http
GET /api/v1/bins/{binType}/count
```

#### 🗺️ Obtener por ubicación

```http
GET /api/v1/bins/{binType}/location/{locationType}/{locationValue}
```

- `locationType`: `district` o `neighborhood`
- `locationValue`: Nombre del distrito o barrio

#### 📍 Obtener contenedores cercanos

```http
GET /api/v1/bins/{binType}/nearby?lat=40.4168&lng=-3.7038&radius=5&limit=100
```

#### 📊 Conteos jerárquicos

```http
GET /api/v1/bins/{binType}/counts
```

#### 🔧 Endpoints de administración

```http
POST /api/v1/bins/{binType}/load-data    # Cargar datos desde CSV
GET  /api/v1/bins/{binType}/debug        # Debug endpoint
```

### Health Check

```http
GET /health
```

## 📖 Documentación de la API

La documentación completa está disponible en:

- **Swagger UI**: http://localhost:8080/api-docs
- **OpenAPI JSON**: http://localhost:8080/swagger.json

## 🗄️ Base de Datos

### Estructura de tablas

#### `clothing_bins`

```sql
CREATE TABLE clothing_bins (
  id SERIAL PRIMARY KEY,
  tipo_dato TEXT,
  lote TEXT,
  cod_dist TEXT,
  distrito TEXT,
  cod_barrio TEXT,
  barrio TEXT,
  direccion_completa TEXT,
  via_clase TEXT,
  via_par TEXT,
  via_nombre TEXT,
  tipo_numero TEXT,
  numero TEXT,
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  direccion_completa_ampliada TEXT,
  mas_informacion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Scripts de Utilidad

### Actualizar datos de contenedores

```bash
# Ejecutar script de actualización
pnpm run update-data
```

El script descarga automáticamente los datos más recientes desde el portal de datos abiertos de Madrid.

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
