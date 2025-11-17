-- ============================================
-- ECOMAD Database Schema v2.0
-- Estructura corregida usando códigos como PKs
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
-- ============================================

-- Contenedores de ROPA
CREATE TABLE IF NOT EXISTS clothing_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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
CREATE TABLE IF NOT EXISTS oil_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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

-- Contenedores de ENVASES (plástico)
CREATE TABLE IF NOT EXISTS plastic_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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

-- Contenedores de ORGÁNICA
CREATE TABLE IF NOT EXISTS organic_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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

-- Contenedores de PILAS/BATERÍAS
CREATE TABLE IF NOT EXISTS battery_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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

-- Contenedores OTROS
CREATE TABLE IF NOT EXISTS other_bins (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    category_group_id SMALLINT NOT NULL REFERENCES category_groups(id),
    category_id SMALLINT NOT NULL REFERENCES categories(id),
    district_code TEXT NOT NULL REFERENCES districts(code),
    neighborhood_code TEXT REFERENCES neighborhoods(code),
    address TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
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
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices espaciales para búsquedas geográficas
CREATE INDEX IF NOT EXISTS idx_clothing_bins_location ON clothing_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_oil_bins_location ON oil_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_glass_bins_location ON glass_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_paper_bins_location ON paper_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_location ON plastic_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_organic_bins_location ON organic_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_battery_bins_location ON battery_bins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_other_bins_location ON other_bins(lat, lng);

-- Índices para filtros por ubicación
CREATE INDEX IF NOT EXISTS idx_clothing_bins_district ON clothing_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_clothing_bins_neighborhood ON clothing_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_oil_bins_district ON oil_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_oil_bins_neighborhood ON oil_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_glass_bins_district ON glass_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_glass_bins_neighborhood ON glass_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_paper_bins_district ON paper_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_paper_bins_neighborhood ON paper_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_district ON plastic_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_plastic_bins_neighborhood ON plastic_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_organic_bins_district ON organic_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_organic_bins_neighborhood ON organic_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_battery_bins_district ON battery_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_battery_bins_neighborhood ON battery_bins(neighborhood_code);
CREATE INDEX IF NOT EXISTS idx_other_bins_district ON other_bins(district_code);
CREATE INDEX IF NOT EXISTS idx_other_bins_neighborhood ON other_bins(neighborhood_code);

-- ============================================
-- TABLAS AUXILIARES
-- ============================================

-- Mapeo de columnas CSV a campos canónicos
CREATE TABLE IF NOT EXISTS column_mappings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    csv_column TEXT NOT NULL,
    canonical_field TEXT NOT NULL,
    table_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de importaciones
CREATE TABLE IF NOT EXISTS import_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    table_name TEXT NOT NULL,
    category_id SMALLINT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    rows_processed INTEGER DEFAULT 0,
    rows_inserted INTEGER DEFAULT 0,
    rows_updated INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_summary JSONB,
    error_message TEXT,
    status TEXT DEFAULT 'running',
    created_by TEXT
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas de bins
ALTER TABLE clothing_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE glass_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plastic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Public read access" ON clothing_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON oil_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON glass_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON paper_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON plastic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON organic_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON battery_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON other_bins FOR SELECT USING (true);
CREATE POLICY "Public read access" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public read access" ON category_groups FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);

-- Políticas de escritura para funciones RPC (SECURITY DEFINER)
CREATE POLICY "Allow RPC insert" ON clothing_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON clothing_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON oil_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON oil_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON glass_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON glass_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON paper_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON paper_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON plastic_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON plastic_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON organic_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON organic_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON battery_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON battery_bins FOR UPDATE USING (true);
CREATE POLICY "Allow RPC insert" ON other_bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow RPC update" ON other_bins FOR UPDATE USING (true);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar distritos de Madrid (códigos con 2 dígitos: "01", "02"...)
INSERT INTO districts (code, name) VALUES
('01', 'CENTRO'),
('02', 'ARGANZUELA'),
('03', 'RETIRO'),
('04', 'SALAMANCA'),
('05', 'CHAMARTIN'),
('06', 'TETUAN'),
('07', 'CHAMBERI'),
('08', 'FUENCARRAL-EL PARDO'),
('09', 'MONCLOA-ARAVACA'),
('10', 'LATINA'),
('11', 'CARABANCHEL'),
('12', 'USERA'),
('13', 'PUENTE DE VALLECAS'),
('14', 'MORATALAZ'),
('15', 'CIUDAD LINEAL'),
('16', 'HORTALEZA'),
('17', 'VILLAVERDE'),
('18', 'VILLA DE VALLECAS'),
('19', 'VICALVARO'),
('20', 'SAN BLAS-CANILLEJAS'),
('21', 'BARAJAS')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Insertar barrios de Madrid (códigos con 3 dígitos: "011", "012"...)
-- Los códigos de barrio están formados por: código distrito (2 dígitos) + número de barrio (1 dígito)
INSERT INTO neighborhoods (code, district_code, name) VALUES
-- Distrito 01: CENTRO
('011', '01', 'PALACIO'),
('012', '01', 'EMBAJADORES'),
('013', '01', 'CORTES'),
('014', '01', 'JUSTICIA'),
('015', '01', 'UNIVERSIDAD'),
('016', '01', 'SOL'),
-- Distrito 02: ARGANZUELA
('021', '02', 'IMPERIAL'),
('022', '02', 'ACACIAS'),
('023', '02', 'CHOPERA'),
('024', '02', 'LEGAZPI'),
('025', '02', 'DELICIAS'),
('026', '02', 'PALOS DE LA FRONTERA'),
('027', '02', 'ATOCHA'),
-- Distrito 03: RETIRO
('031', '03', 'PACIFICO'),
('032', '03', 'ADELFAS'),
('033', '03', 'ESTRELLA'),
('034', '03', 'IBIZA'),
('035', '03', 'LOS JERONIMOS'),
('036', '03', 'NINO JESUS'),
-- Distrito 04: SALAMANCA
('041', '04', 'RECOLETOS'),
('042', '04', 'GOYA'),
('043', '04', 'FUENTE DEL BERRO'),
('044', '04', 'GUINDALERA'),
('045', '04', 'LISTA'),
('046', '04', 'CASTELLANA'),
-- Distrito 05: CHAMARTIN
('051', '05', 'EL VISO'),
('052', '05', 'PROSPERIDAD'),
('053', '05', 'CIUDAD JARDIN'),
('054', '05', 'HISPANOAMERICA'),
('055', '05', 'NUEVA ESPANA'),
('056', '05', 'CASTILLA'),
-- Distrito 06: TETUAN
('061', '06', 'BELLAS VISTAS'),
('062', '06', 'CUATRO CAMINOS'),
('063', '06', 'CASTILLEJOS'),
('064', '06', 'ALMENARA'),
('065', '06', 'VALDEACEDERAS'),
('066', '06', 'BERRUGUETE'),
-- Distrito 07: CHAMBERI
('071', '07', 'GAZTAMBIDE'),
('072', '07', 'ARAPILES'),
('073', '07', 'TRAFALGAR'),
('074', '07', 'ALMAGRO'),
('075', '07', 'RIOS ROSAS'),
('076', '07', 'VALLEHERMOSO'),
-- Distrito 08: FUENCARRAL-EL PARDO
('081', '08', 'EL PARDO'),
('082', '08', 'FUENTELARREINA'),
('083', '08', 'PENAGRANDE'),
('084', '08', 'PILAR'),
('085', '08', 'LA PAZ'),
('086', '08', 'VALVERDE'),
('087', '08', 'MIRASIERRA'),
('088', '08', 'EL GOLOSO'),
-- Distrito 09: MONCLOA-ARAVACA
('091', '09', 'CASA DE CAMPO'),
('092', '09', 'ARGUELLES'),
('093', '09', 'CIUDAD UNIVERSITARIA'),
('094', '09', 'VALDEZARZA'),
('095', '09', 'VALDEMARIN'),
('096', '09', 'EL PLANTIO'),
('097', '09', 'ARAVACA'),
-- Distrito 10: LATINA
('101', '10', 'LOS CARMENES'),
('102', '10', 'PUERTA DEL ANGEL'),
('103', '10', 'LUCERO'),
('104', '10', 'ALUCHE'),
('105', '10', 'CAMPAMENTO'),
('106', '10', 'CUATRO VIENTOS'),
('107', '10', 'AGUILAS'),
-- Distrito 11: CARABANCHEL
('111', '11', 'COMILLAS'),
('112', '11', 'OPANEL'),
('113', '11', 'SAN ISIDRO'),
('114', '11', 'VISTA ALEGRE'),
('115', '11', 'PUERTA BONITA'),
('116', '11', 'BUENAVISTA'),
('117', '11', 'ABRANTES'),
-- Distrito 12: USERA
('121', '12', 'ORCASITAS'),
('122', '12', 'ORCASUR'),
('123', '12', 'SAN FERMIN'),
('124', '12', 'ALMENDRALES'),
('125', '12', 'MOSCARDO'),
('126', '12', 'ZOFIO'),
('127', '12', 'PRADOLONGO'),
-- Distrito 13: PUENTE DE VALLECAS
('131', '13', 'ENTREVIAS'),
('132', '13', 'SAN DIEGO'),
('133', '13', 'PALOMERAS BAJAS'),
('134', '13', 'PALOMERAS SURESTE'),
('135', '13', 'PORTAZGO'),
('136', '13', 'NUMANCIA'),
-- Distrito 14: MORATALAZ
('141', '14', 'PAVONES'),
('142', '14', 'HORCAJO'),
('143', '14', 'MARROQUINA'),
('144', '14', 'MEDIA LEGUA'),
('145', '14', 'FONTARRON'),
('146', '14', 'VINATEROS'),
-- Distrito 15: CIUDAD LINEAL
('151', '15', 'VENTAS'),
('152', '15', 'PUEBLO NUEVO'),
('153', '15', 'QUINTANA'),
('154', '15', 'LA CONCEPCION'),
('155', '15', 'SAN PASCUAL'),
('156', '15', 'SAN JUAN BAUTISTA'),
('157', '15', 'COLINA'),
('158', '15', 'ATALAYA'),
('159', '15', 'COSTILLARES'),
-- Distrito 16: HORTALEZA
('161', '16', 'PALOMAS'),
('162', '16', 'PIOVERA'),
('163', '16', 'CANILLAS'),
('164', '16', 'PINAR DEL REY'),
('165', '16', 'APOSTOL SANTIAGO'),
('166', '16', 'VALDEFUENTES'),
-- Distrito 17: VILLAVERDE
('171', '17', 'VILLAVERDE ALTO - CASCO HISTORICO DE VILLAVERDE'),
('172', '17', 'SAN CRISTOBAL'),
('173', '17', 'BUTARQUE'),
('174', '17', 'LOS ROSALES'),
('175', '17', 'ANGELES'),
-- Distrito 18: VILLA DE VALLECAS
('181', '18', 'CASCO HISTORICO DE VALLECAS'),
('182', '18', 'SANTA EUGENIA'),
('183', '18', 'ENSANCHE DE VALLECAS'),
-- Distrito 19: VICALVARO
('191', '19', 'CASCO HISTORICO DE VICALVARO'),
('192', '19', 'VALDEBERNARDO'),
('193', '19', 'VALDERRIVAS'),
('194', '19', 'EL CANAVERAL'),
-- Distrito 20: SAN BLAS-CANILLEJAS
('201', '20', 'SIMANCAS'),
('202', '20', 'HELLIN'),
('203', '20', 'AMPOSTA'),
('204', '20', 'ARCOS'),
('205', '20', 'ROSAS'),
('206', '20', 'REJAS'),
('207', '20', 'CANILLEJAS'),
('208', '20', 'EL SALVADOR'),
-- Distrito 21: BARAJAS
('211', '21', 'ALAMEDA DE OSUNA'),
('212', '21', 'AEROPUERTO'),
('213', '21', 'CASCO HISTORICO DE BARAJAS'),
('214', '21', 'TIMON'),
('215', '21', 'CORRALEJOS')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    district_code = EXCLUDED.district_code,
    updated_at = NOW();

-- Insertar grupos de categorías
INSERT INTO category_groups (id, name, slug, external_code) VALUES
(1, 'Fracción', 'fraction', NULL),
(2, 'Punto Limpio', 'clean_point', NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    updated_at = NOW();

-- Insertar categorías
INSERT INTO categories (id, group_id, name, slug, external_code) VALUES
(1, 1, 'Vidrio con publicidad', 'glass_with_ads', '1'),
(2, 1, 'Vidrio sin publicidad', 'glass_without_ads', '2'),
(3, 1, 'Envases', 'containers', '3'),
(4, 1, 'Papel y cartón', 'paper_cardboard', '4'),
(5, 1, 'Orgánica', 'organic', '5'),
(6, 1, 'Resto', 'rest', '6'),
(11, 2, 'Aceites vegetales usados', 'used_vegetable_oils', NULL),
(12, 2, 'Pilas en mupis', 'batteries_mupis', NULL),
(13, 2, 'Pilas en marquesinas', 'batteries_shelters', NULL),
(14, 2, 'Ropa usada', 'used_clothing', NULL),
(15, 2, 'Punto Limpio Fijo', 'fixed_clean_point', NULL),
(16, 2, 'Punto Limpio Móvil', 'mobile_clean_point', NULL)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    group_id = EXCLUDED.group_id,
    updated_at = NOW();

-- ============================================
-- FUNCIONES POSTGRESQL
-- ============================================

/**
 * Función para buscar contenedores cercanos usando earthdistance
 * Usa códigos de distrito/barrio en lugar de IDs numéricos
 */
CREATE OR REPLACE FUNCTION find_nearby_bins(
    p_table_name TEXT,
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_radius_km NUMERIC DEFAULT 5.0,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
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
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query TEXT;
BEGIN
    query := FORMAT(
        'SELECT
            id,
            category_group_id,
            category_id,
            district_code,
            neighborhood_code,
            address,
            lat,
            lng,
            load_type,
            direction,
            subtype,
            placement_type,
            notes,
            bus_stop,
            interurban_node,
            created_at,
            updated_at,
            (earth_distance(
                ll_to_earth(%L::float8, %L::float8),
                ll_to_earth(lat::float8, lng::float8)
            ) / 1000.0)::numeric as distance_km
        FROM %I
        WHERE earth_box(ll_to_earth(%L::float8, %L::float8), %L::float8 * 1000) @> ll_to_earth(lat::float8, lng::float8)
        ORDER BY distance_km
        LIMIT %L',
        p_lat, p_lng, p_table_name, p_lat, p_lng, p_radius_km, p_limit
    );
    RETURN QUERY EXECUTE query;
END;
$$;

/**
 * Función para obtener conteos jerárquicos por distrito y barrio
 * Devuelve códigos de distrito/barrio en lugar de IDs
 */
CREATE OR REPLACE FUNCTION get_bins_counts_hierarchy(p_table_name TEXT)
RETURNS TABLE(
    distrito TEXT,
    barrio TEXT,
    count BIGINT,
    center_lat NUMERIC,
    center_lng NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query TEXT;
BEGIN
    query := FORMAT(
        'SELECT
            district_code::TEXT as distrito,
            COALESCE(neighborhood_code, '''')::TEXT as barrio,
            COUNT(*)::BIGINT as count,
            AVG(lat)::NUMERIC as center_lat,
            AVG(lng)::NUMERIC as center_lng
        FROM %I
        GROUP BY district_code, neighborhood_code
        ORDER BY district_code, neighborhood_code;',
        p_table_name
    );
    RETURN QUERY EXECUTE query;
END;
$$;

/**
 * Función para importar bins de forma idempotente
 * Actualizada para usar códigos en lugar de IDs
 */
CREATE OR REPLACE FUNCTION import_bins(
    p_table_name TEXT,
    p_bin_data JSONB,
    p_category_group_id INTEGER,
    p_category_id SMALLINT,
    p_district_code TEXT,
    p_neighborhood_code TEXT DEFAULT NULL
)
RETURNS TABLE(inserted INTEGER, updated INTEGER, errors INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inserted INTEGER := 0;
    v_updated INTEGER := 0;
    v_errors INTEGER := 0;
    v_bin JSONB;
    v_address TEXT;
    v_lat NUMERIC;
    v_lng NUMERIC;
    v_existing_id BIGINT;
BEGIN
    -- Procesar cada bin del array
    FOR v_bin IN SELECT * FROM jsonb_array_elements(p_bin_data)
    LOOP
        BEGIN
            v_address := v_bin->>'address';
            v_lat := (v_bin->>'lat')::NUMERIC;
            v_lng := (v_bin->>'lng')::NUMERIC;

            -- Buscar si ya existe un bin en la misma ubicación
            EXECUTE FORMAT(
                'SELECT id FROM %I WHERE address = $1 AND lat = $2 AND lng = $3 LIMIT 1',
                p_table_name
            ) INTO v_existing_id USING v_address, v_lat, v_lng;

            IF v_existing_id IS NOT NULL THEN
                -- UPDATE: Actualizar bin existente
                EXECUTE FORMAT(
                    'UPDATE %I SET
                        category_group_id = $1,
                        category_id = $2,
                        district_code = $3,
                        neighborhood_code = $4,
                        load_type = $5,
                        direction = $6,
                        subtype = $7,
                        placement_type = $8,
                        notes = $9,
                        bus_stop = $10,
                        interurban_node = $11,
                        updated_at = NOW()
                    WHERE id = $12',
                    p_table_name
                ) USING
                    p_category_group_id,
                    p_category_id,
                    p_district_code,
                    p_neighborhood_code,
                    v_bin->>'load_type',
                    v_bin->>'direction',
                    v_bin->>'subtype',
                    v_bin->>'placement_type',
                    v_bin->>'notes',
                    v_bin->>'bus_stop',
                    v_bin->>'interurban_node',
                    v_existing_id;

                v_updated := v_updated + 1;
            ELSE
                -- INSERT: Crear nuevo bin
                EXECUTE FORMAT(
                    'INSERT INTO %I (
                        category_group_id, category_id, district_code, neighborhood_code,
                        address, lat, lng, load_type, direction, subtype,
                        placement_type, notes, bus_stop, interurban_node
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    p_table_name
                ) USING
                    p_category_group_id,
                    p_category_id,
                    p_district_code,
                    p_neighborhood_code,
                    v_address,
                    v_lat,
                    v_lng,
                    v_bin->>'load_type',
                    v_bin->>'direction',
                    v_bin->>'subtype',
                    v_bin->>'placement_type',
                    v_bin->>'notes',
                    v_bin->>'bus_stop',
                    v_bin->>'interurban_node';

                v_inserted := v_inserted + 1;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors + 1;
            RAISE NOTICE 'Error importing bin: % (address: %)', SQLERRM, v_address;
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted, v_updated, v_errors;
END;
$$;

