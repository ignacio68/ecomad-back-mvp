-- Crear tabla de contenedores de ropa
CREATE TABLE IF NOT EXISTS clothing_bins (
  id BIGSERIAL PRIMARY KEY,
  tipo_dato TEXT NOT NULL,
  lote TEXT NOT NULL,
  cod_dist TEXT NOT NULL,
  distrito TEXT NOT NULL,
  cod_barrio TEXT NOT NULL,
  barrio TEXT NOT NULL,
  direccion_completa TEXT NOT NULL,
  via_clase TEXT NOT NULL,
  via_par TEXT NOT NULL,
  via_nombre TEXT NOT NULL,
  tipo_numero TEXT NOT NULL,
  numero TEXT NOT NULL,
  latitud DECIMAL(12, 8) NOT NULL,
  longitud DECIMAL(12, 8) NOT NULL,
  direccion_completa_ampliada TEXT NOT NULL,
  mas_informacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clothing_bins_distrito ON clothing_bins(distrito);
CREATE INDEX IF NOT EXISTS idx_clothing_bins_barrio ON clothing_bins(barrio);
CREATE INDEX IF NOT EXISTS idx_clothing_bins_location ON clothing_bins(latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_clothing_bins_direccion ON clothing_bins(direccion_completa);

-- Crear índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_clothing_bins_unique
ON clothing_bins(direccion_completa, distrito, barrio);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_clothing_bins_updated_at
    BEFORE UPDATE ON clothing_bins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) si es necesario
-- ALTER TABLE clothing_bins ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
-- CREATE POLICY "Allow public read access" ON clothing_bins
--   FOR SELECT USING (true);

-- Política para permitir inserción/actualización solo a usuarios autenticados
-- CREATE POLICY "Allow authenticated insert/update" ON clothing_bins
--   FOR ALL USING (auth.role() = 'authenticated');