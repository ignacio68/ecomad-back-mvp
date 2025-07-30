# Configuración de Supabase para Contenedores de Ropa

## 1. Configurar Supabase

### Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota tu `Project URL` y `anon public key`

### Configurar variables de entorno

1. Copia el archivo `env.example` a `.env`:

   ```bash
   cp env.example .env
   ```

2. Edita `.env` con tus credenciales de Supabase:
   ```env
   SUPABASE_URL=https://tu-proyecto-id.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

## 2. Crear la tabla en Supabase

### Opción A: Usando el SQL Editor de Supabase

1. Ve a tu proyecto de Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase-schema.sql`
4. Ejecuta el script

### Opción B: Usando la línea de comandos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref tu-proyecto-id

# Ejecutar migración
supabase db push
```

## 3. Ejecutar el script de actualización

```bash
# Compilar TypeScript
npx tsc src/scripts/updateClothingBins.ts --outDir dist --target es2020 --module commonjs --esModuleInterop

# Ejecutar script
node dist/scripts/updateClothingBins.js
```

## 4. Verificar la inserción

Puedes verificar que los datos se insertaron correctamente en:

- **Table Editor** de Supabase
- **SQL Editor** ejecutando: `SELECT COUNT(*) FROM clothing_bins;`

## Estructura de la tabla

La tabla `clothing_bins` contiene:

| Campo                         | Tipo      | Descripción                         |
| ----------------------------- | --------- | ----------------------------------- |
| `id`                          | BIGSERIAL | ID único autoincremental            |
| `tipo_dato`                   | TEXT      | Tipo de contenedor                  |
| `lote`                        | TEXT      | Número de lote                      |
| `cod_dist`                    | TEXT      | Código de distrito                  |
| `distrito`                    | TEXT      | Nombre del distrito                 |
| `cod_barrio`                  | TEXT      | Código de barrio                    |
| `barrio`                      | TEXT      | Nombre del barrio                   |
| `direccion_completa`          | TEXT      | Dirección completa                  |
| `via_clase`                   | TEXT      | Tipo de vía                         |
| `via_par`                     | TEXT      | Preposición de la vía               |
| `via_nombre`                  | TEXT      | Nombre de la vía                    |
| `tipo_numero`                 | TEXT      | Tipo de número                      |
| `numero`                      | TEXT      | Número de la vía                    |
| `utm_x`                       | DECIMAL   | Coordenada UTM X                    |
| `utm_y`                       | DECIMAL   | Coordenada UTM Y                    |
| `latitud`                     | DECIMAL   | Latitud                             |
| `longitud`                    | DECIMAL   | Longitud                            |
| `direccion_completa_ampliada` | TEXT      | Dirección con información adicional |
| `mas_informacion`             | TEXT      | Información adicional               |
| `created_at`                  | TIMESTAMP | Fecha de creación                   |
| `updated_at`                  | TIMESTAMP | Fecha de última actualización       |

## Índices creados

- `idx_clothing_bins_distrito`: Para búsquedas por distrito
- `idx_clothing_bins_barrio`: Para búsquedas por barrio
- `idx_clothing_bins_location`: Para búsquedas geográficas
- `idx_clothing_bins_direccion`: Para búsquedas por dirección
- `idx_clothing_bins_unique`: Índice único para evitar duplicados
