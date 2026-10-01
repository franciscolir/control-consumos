PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS establecimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT,
  direccion TEXT,
  matricula INTEGER,
  superficie_m2 REAL,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS servicios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id) ON DELETE RESTRICT,
  tipo TEXT NOT NULL CHECK(tipo IN ('agua','electricidad')),
  identificador TEXT,
  numero_medidor TEXT,
  unidad TEXT NOT NULL CHECK(unidad IN ('m³','kWh')),
  fecha_alta TEXT NOT NULL,
  fecha_baja TEXT,
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS registros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  lectura_anterior REAL,
  lectura_actual REAL,
  consumo_calculado REAL,
  consumo_facturado REAL,
  tipo_lectura TEXT CHECK(tipo_lectura IN ('real','estimada','corregida')),
  folio TEXT,
  monto_total REAL,
  observaciones TEXT,
  documento_path TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(fecha_fin >= fecha_inicio)
);

CREATE TABLE IF NOT EXISTS detalle_boleta (
  registro_id INTEGER PRIMARY KEY REFERENCES registros(id) ON DELETE RESTRICT,
  cargo_fijo REAL,
  consumo_facturado_monto REAL,
  otros_cargos REAL,
  impuestos REAL,
  total REAL
);

CREATE TABLE IF NOT EXISTS validaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registro_id INTEGER NOT NULL REFERENCES registros(id) ON DELETE RESTRICT,
  tipo TEXT NOT NULL,
  severidad TEXT NOT NULL CHECK(severidad IN ('error','advertencia','info')),
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','revisada','justificada')),
  creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resuelta_en TEXT
);

CREATE TABLE IF NOT EXISTS parametros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
  consumo_minimo REAL,
  consumo_maximo REAL,
  metodo TEXT CHECK(metodo IN ('fijo','historico','manual')),
  vigencia_desde TEXT NOT NULL,
  vigencia_hasta TEXT
);

CREATE TABLE IF NOT EXISTS historial_cambios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entidad TEXT NOT NULL,
  entidad_id INTEGER NOT NULL,
  campo TEXT NOT NULL,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ocr_procesos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registro_id INTEGER REFERENCES registros(id) ON DELETE SET NULL,
  archivo_origen TEXT NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('pendiente','procesando','listo','error','confirmado')),
  motor TEXT,
  confianza_global REAL,
  texto_crudo TEXT,
  json_extraido TEXT,
  iniciado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizado_en TEXT
);

CREATE TABLE IF NOT EXISTS ocr_campos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ocr_proceso_id INTEGER NOT NULL REFERENCES ocr_procesos(id) ON DELETE RESTRICT,
  campo TEXT NOT NULL,
  valor_extraido TEXT,
  valor_normalizado TEXT,
  confianza REAL,
  metodo TEXT,
  validado INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ocr_plantillas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  proveedor TEXT,
  tipo_servicio TEXT CHECK(tipo_servicio IN ('agua','electricidad')),
  patrones_json TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  activa INTEGER NOT NULL DEFAULT 1
);
