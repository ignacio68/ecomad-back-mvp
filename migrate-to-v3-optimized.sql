-- ============================================
-- MIGRACIÓN A SCHEMA V3 OPTIMIZADO
-- ============================================
-- ADVERTENCIA: Este script ELIMINARÁ todas las tablas de bins
-- y las recreará con el nuevo schema optimizado.
--
-- Cambios principales:
-- - lat/lng: NUMERIC → NUMERIC(8,5) (ahorro ~60% espacio)
-- - Precisión: 5 decimales = ~1.1 metros
--
-- EJECUTAR SOLO SI ESTÁS SEGURO
-- ============================================

-- Paso 1: Eliminar tablas de bins (en orden inverso por dependencias)
DROP TABLE IF EXISTS other_bins CASCADE;
DROP TABLE IF EXISTS battery_bins CASCADE;
DROP TABLE IF EXISTS organic_bins CASCADE;
DROP TABLE IF EXISTS plastic_bins CASCADE;
DROP TABLE IF EXISTS paper_bins CASCADE;
DROP TABLE IF EXISTS glass_bins CASCADE;
DROP TABLE IF EXISTS oil_bins CASCADE;
DROP TABLE IF EXISTS clothing_bins CASCADE;

-- Paso 2: Eliminar funciones RPC antiguas
DROP FUNCTION IF EXISTS import_bins(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_bins(TEXT, NUMERIC, NUMERIC, NUMERIC) CASCADE;

-- Paso 3: Recrear tablas con schema optimizado
-- (Las tablas de referencia districts, neighborhoods, categories no se tocan)

-- Contenedores de ROPA
CREATE TABLE clothing_bins (
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

-- Contenedores de ACEITE
CREATE TABLE oil_bins (
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
CREATE TABLE glass_bins (
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
CREATE TABLE paper_bins (
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
CREATE TABLE plastic_bins (
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
CREATE TABLE organic_bins (
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
CREATE TABLE battery_bins (
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
CREATE TABLE other_bins (
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

-- Paso 4: Recrear índices
CREATE INDEX idx_clothing_bins_coords ON clothing_bins(lat, lng);
CREATE INDEX idx_oil_bins_coords ON oil_bins(lat, lng);
CREATE INDEX idx_glass_bins_coords ON glass_bins(lat, lng);
CREATE INDEX idx_paper_bins_coords ON paper_bins(lat, lng);
CREATE INDEX idx_plastic_bins_coords ON plastic_bins(lat, lng);
CREATE INDEX idx_organic_bins_coords ON organic_bins(lat, lng);
CREATE INDEX idx_battery_bins_coords ON battery_bins(lat, lng);
CREATE INDEX idx_other_bins_coords ON other_bins(lat, lng);

CREATE INDEX idx_clothing_bins_district ON clothing_bins(district_code);
CREATE INDEX idx_oil_bins_district ON oil_bins(district_code);
CREATE INDEX idx_glass_bins_district ON glass_bins(district_code);
CREATE INDEX idx_paper_bins_district ON paper_bins(district_code);
CREATE INDEX idx_plastic_bins_district ON plastic_bins(district_code);
CREATE INDEX idx_organic_bins_district ON organic_bins(district_code);
CREATE INDEX idx_battery_bins_district ON battery_bins(district_code);
CREATE INDEX idx_other_bins_district ON other_bins(district_code);

CREATE INDEX idx_clothing_bins_neighborhood ON clothing_bins(neighborhood_code);
CREATE INDEX idx_oil_bins_neighborhood ON oil_bins(neighborhood_code);
CREATE INDEX idx_glass_bins_neighborhood ON glass_bins(neighborhood_code);
CREATE INDEX idx_paper_bins_neighborhood ON paper_bins(neighborhood_code);
CREATE INDEX idx_plastic_bins_neighborhood ON plastic_bins(neighborhood_code);
CREATE INDEX idx_organic_bins_neighborhood ON organic_bins(neighborhood_code);
CREATE INDEX idx_battery_bins_neighborhood ON battery_bins(neighborhood_code);
CREATE INDEX idx_other_bins_neighborhood ON other_bins(neighborhood_code);

-- Paso 5: Recrear funciones RPC
CREATE OR REPLACE FUNCTION import_bins(
    table_name TEXT,
    bins_data JSONB
) RETURNS TABLE(inserted INTEGER, updated INTEGER) AS $$
DECLARE
    bin JSONB;
    inserted_count INTEGER := 0;
    updated_count INTEGER := 0;
BEGIN
    FOR bin IN SELECT * FROM jsonb_array_elements(bins_data)
    LOOP
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
    END LOOP;

    RETURN QUERY SELECT inserted_count, updated_count;
END;
$$ LANGUAGE plpgsql;

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

-- Paso 6: Recrear políticas RLS
ALTER TABLE clothing_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE glass_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plastic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_bins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON clothing_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON oil_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON glass_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON paper_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON plastic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON organic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON battery_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON other_bins FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON clothing_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON oil_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON glass_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON paper_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON plastic_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON organic_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON battery_bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON other_bins FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================
-- Las tablas están listas para recibir datos
-- Ejecutar los scripts de importación:
-- 1. npm run import:clothing
-- 2. npm run import:oil
-- 3. npm run import:glass
-- 4. npm run import:paper
-- 5. npm run import:plastic
-- 6. npm run import:organic
-- 7. npm run import:battery
-- 8. npm run import:other
-- ============================================

