-- ============================================
-- ECOMAD Database Schema v3.0 - OPTIMIZED
-- Cambios principales:
-- - Coordenadas: NUMERIC(8,5) en lugar de NUMERIC (ahorro ~60%)
-- - Precisión: 5 decimales = ~1.1 metros (suficiente para contenedores)
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- ============================================
-- TABLAS DE REFERENCIA (MAESTRAS)
-- ============================================

-- Distritos de Madrid (21 distritos)
CREATE TABLE IF NOT EXISTS districts (
    code TEXT PRIMARY KEY,  -- "01", "02", "03"... hasta "21"
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barrios de Madrid (131 barrios)
CREATE TABLE IF NOT EXISTS neighborhoods (
    code TEXT PRIMARY KEY,  -- "011", "012", "021", "027"...
    district_code TEXT NOT NULL REFERENCES districts(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grupos de categorías (Fracción, Punto Limpio, etc.)
CREATE TABLE IF NOT EXISTS category_groups (
    id SMALLINT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    external_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías específicas (Vidrio con publicidad, Envases, etc.)
CREATE TABLE IF NOT EXISTS categories (
    id SMALLINT PRIMARY KEY,
    group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    external_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLAS DE CONTENEDORES (BINS)
-- Estructura común para todos los tipos
-- OPTIMIZADO: lat/lng con NUMERIC(8,5)
-- ============================================

-- Contenedores de ROPA
CREATE TABLE IF NOT EXISTS clothing_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,  -- Formato: XX.XXXXX (ej: 40.36778)
    lng NUMERIC(8,5) NOT NULL,  -- Formato: -X.XXXXX (ej: -3.71712)
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,  -- TODO: Eliminar datos repetidos, mover a componente
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de ACEITE
CREATE TABLE IF NOT EXISTS oil_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de VIDRIO
CREATE TABLE IF NOT EXISTS glass_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de PAPEL
CREATE TABLE IF NOT EXISTS paper_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de PLÁSTICO/ENVASES
CREATE TABLE IF NOT EXISTS plastic_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de ORGÁNICO
CREATE TABLE IF NOT EXISTS organic_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de PILAS
CREATE TABLE IF NOT EXISTS battery_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contenedores de RESTO
CREATE TABLE IF NOT EXISTS other_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC(8,5) NOT NULL,
    lng NUMERIC(8,5) NOT NULL,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================

-- Índices para búsquedas geoespaciales (nearby)
CREATE INDEX IF NOT EXISTS idx_clothing_bins_coords ON clothing_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_oil_bins_coords ON oil_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_glass_bins_coords ON glass_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_paper_bins_coords ON paper_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_coords ON plastic_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_organic_bins_coords ON organic_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_battery_bins_coords ON battery_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_other_bins_coords ON other_bins(lat, lng);

-- Índices para búsquedas por ubicación (distrito/barrio)
CREATE INDEX IF NOT EXISTS idx_clothing_bins_district ON clothing_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_oil_bins_district ON oil_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_glass_bins_district ON glass_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_paper_bins_district ON paper_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_district ON plastic_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_organic_bins_district ON organic_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_battery_bins_district ON battery_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_other_bins_district ON other_bins(district_code);

CREATE INDEX IF NOT EXISTS idx_clothing_bins_neighborhood ON clothing_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_oil_bins_neighborhood ON oil_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_glass_bins_neighborhood ON glass_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_paper_bins_neighborhood ON paper_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_neighborhood ON plastic_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_organic_bins_neighborhood ON organic_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_battery_bins_neighborhood ON battery_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_other_bins_neighborhood ON other_bins(neighborhood_code);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Función para importar bins (bulk insert/update)
-- NOTA: Detecta duplicados por address + lat + lng + category_id
-- Si existe → UPDATE, si no existe → INSERT
CREATE OR REPLACE FUNCTION import_bins(
    table_name TEXT,
    bins_data JSONB
) RETURNS TABLE(inserted INTEGER, updated INTEGER) AS $$
DECLARE
    bin JSONB;
    inserted_count INTEGER := 0;
    updated_count INTEGER := 0;
    v_existing_id BIGINT;
BEGIN
    FOR bin IN SELECT * FROM jsonb_array_elements(bins_data)
    LOOP
        -- Buscar bin existente por dirección, coordenadas Y category_id
        EXECUTE format(
            'SELECT id FROM %I WHERE address = $1 AND lat = $2 AND lng = $3 AND category_id = $4 LIMIT 1',
            table_name
        ) INTO v_existing_id
        USING
            bin->>'address',
            (bin->>'lat')::NUMERIC(8,5),
            (bin->>'lng')::NUMERIC(8,5),
            (bin->>'category_id')::SMALLINT;

        IF v_existing_id IS NOT NULL THEN
            -- Actualizar bin existente
            EXECUTE format(
                'UPDATE %I SET
                    category_group_id = $1,
                    district_code = $2,
                    neighborhood_code = $3,
                    load_type = $4,
                    direction = $5,
                    subtype = $6,
                    placement_type = $7,
                    notes = $8,
                    bus_stop = $9,
                    interurban_node = $10,
                    updated_at = NOW()
                WHERE id = $11',
                table_name
            ) USING
                (bin->>'category_group_id')::SMALLINT,
                bin->>'district_code',
                bin->>'neighborhood_code',
                bin->>'load_type',
                bin->>'direction',
                bin->>'subtype',
                bin->>'placement_type',
                bin->>'notes',
                bin->>'bus_stop',
                bin->>'interurban_node',
                v_existing_id;

            updated_count := updated_count + 1;
        ELSE
            -- Insertar nuevo bin
            EXECUTE format(
                'INSERT INTO %I (
                    category_group_id, category_id, district_code, neighborhood_code,
                    address, lat, lng, load_type, direction, subtype,
                    placement_type, notes, bus_stop, interurban_node
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                table_name
            ) USING
                (bin->>'category_group_id')::SMALLINT,
                (bin->>'category_id')::SMALLINT,
                bin->>'district_code',
                bin->>'neighborhood_code',
                bin->>'address',
                (bin->>'lat')::NUMERIC(8,5),
                (bin->>'lng')::NUMERIC(8,5),
                bin->>'load_type',
                bin->>'direction',
                bin->>'subtype',
                bin->>'placement_type',
                bin->>'notes',
                bin->>'bus_stop',
                bin->>'interurban_node';

            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;

    RETURN QUERY SELECT inserted_count, updated_count;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar bins cercanos (nearby)
CREATE OR REPLACE FUNCTION find_nearby_bins(
    table_name TEXT,
    user_lat NUMERIC,
    user_lng NUMERIC,
    radius_km NUMERIC DEFAULT 1.0
) RETURNS TABLE(
    id BIGINT,
    category_group_id SMALLINT,
    category_id SMALLINT,
    district_code TEXT,
    neighborhood_code TEXT,
    address TEXT,
    lat NUMERIC,
    lng NUMERIC,
    load_type TEXT,
    direction TEXT,
    subtype TEXT,
    placement_type TEXT,
    notes TEXT,
    bus_stop TEXT,
    interurban_node TEXT,
    distance_km NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT
            id, category_group_id, category_id, district_code, neighborhood_code,
            address, lat, lng, load_type, direction, subtype, placement_type,
            notes, bus_stop, interurban_node,
            earth_distance(
                ll_to_earth($1, $2),
                ll_to_earth(lat, lng)
            ) / 1000.0 as distance_km,
            created_at, updated_at
        FROM %I
        WHERE earth_box(ll_to_earth($1, $2), $3 * 1000) @> ll_to_earth(lat, lng)
        ORDER BY distance_km
        LIMIT 100',
        table_name
    ) USING user_lat, user_lng, radius_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clothing_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE glass_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plastic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_bins ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública para todos
CREATE POLICY "Public read access" ON clothing_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON oil_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON glass_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON paper_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON plastic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON organic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON battery_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON other_bins FOR SELECT USING (true);

-- Políticas: Solo service_role puede insertar/actualizar/eliminar
CREATE POLICY "Service role full access" ON clothing_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON oil_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON glass_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON paper_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON plastic_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON organic_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON battery_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON other_bins FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE clothing_bins IS 'Contenedores de ropa usada';
COMMENT ON TABLE oil_bins IS 'Contenedores de aceite usado';
COMMENT ON TABLE glass_bins IS 'Contenedores de vidrio';
COMMENT ON TABLE paper_bins IS 'Contenedores de papel y cartón';
COMMENT ON TABLE plastic_bins IS 'Contenedores de envases (plástico, metal, briks)';
COMMENT ON TABLE organic_bins IS 'Contenedores de residuos orgánicos';
COMMENT ON TABLE battery_bins IS 'Contenedores de pilas';
COMMENT ON TABLE other_bins IS 'Contenedores de resto (fracción no reciclable)';

COMMENT ON COLUMN clothing_bins.lat IS 'Latitud con 5 decimales (~1.1m precisión)';
COMMENT ON COLUMN clothing_bins.lng IS 'Longitud con 5 decimales (~1.1m precisión)';

