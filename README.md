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
│   │   └── bins/                   # Módulo de contenedores
│   │       ├── controllers/        # Controladores
│   │       ├── middleware/         # Middleware específico
│   │       ├── routes/             # Rutas
│   │       ├── schemas/            # Esquemas Zod
│   │       ├── services/           # Lógica de negocio
│   │       ├── types/              # Tipos TypeScript
│   │       └── scripts/            # Scripts de utilidad
│   └── common/                     # Utilidades comunes de la API
│       ├── lib/                    # Cliente Supabase
│       └── utils/                  # Utilidades (geo, validación, etc.)
├── api-docs/                       # Documentación OpenAPI
│   ├── openAPIDocumentGenerator.ts # Generador de documentación
│   ├── openAPIRouter.ts            # Router de Swagger UI
│   └── responseBuilders.ts         # Constructores de respuestas
└── shared/                         # Utilidades compartidas
    ├── lib/                        # Configuración OpenAPI
    ├── middleware/                 # Middleware global
    ├── models/                     # Modelos de respuesta
    └── utils/                      # Utilidades generales
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

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Configuración

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd ecomad-back-mvp
   ```

2. **Instalar dependencias**

   ```bash
   npm install
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
npm run dev
```

### Producción

```bash
npm run build
npm start
```

### Scripts disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Ejecutar en producción
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run lint         # Linter
npm run lint:fix     # Linter con auto-fix
```

## 📚 API Endpoints

### Base URL

```
http://localhost:8080/api/v1
```

### Tipos de contenedores soportados

- `clothing_bins` - Contenedores de ropa
- `oil_bins` - Contenedores de aceite usado
- `glass_bins` - Contenedores de vidrio
- `paper_bins` - Contenedores de papel y cartón
- `plastic_bins` - Contenedores de envases
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
npm run update-data
```

El script descarga automáticamente los datos más recientes desde el portal de datos abiertos de Madrid.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

## 🔒 Seguridad

- **Rate Limiting**: 100 requests/minuto por IP
- **CORS**: Configurado para dominios específicos
- **Helmet**: Headers de seguridad HTTP
- **Validación**: Todos los inputs validados con Zod
- **Sanitización**: Caracteres peligrosos filtrados en URLs

## 🚀 Despliegue

### Variables de entorno de producción

```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker

```bash
docker build -t ecomad-backend .
docker run -p 8080:8080 ecomad-backend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **EcoMAD Team** - contact@ecomad.app
- **Proyecto**: https://ecomad.app
- **Documentación**: http://localhost:8080/api-docs

---

**Nota**: Este es un MVP (Minimum Viable Product) en desarrollo activo. La API puede cambiar en futuras versiones.
