import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../../data/database");
fs.mkdirSync(dataDir, { recursive: true });
export const db = new Database(path.join(dataDir, "consumos.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS establecimientos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      tipo TEXT,
      direccion TEXT,
      comuna TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      establecimiento_id INTEGER NOT NULL REFERENCES establecimientos(id),
      tipo TEXT NOT NULL CHECK(tipo IN ('AGUA','ELECTRICIDAD')),
      nombre TEXT NOT NULL,
      empresa TEXT,
      numero_cliente TEXT,
      numero_medidor TEXT,
      unidad TEXT NOT NULL,
      factor_conversion REAL NOT NULL DEFAULT 1,
      activo INTEGER NOT NULL DEFAULT 1,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS boletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_id INTEGER NOT NULL REFERENCES servicios(id),
      folio TEXT,
      fecha_emision TEXT,
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      dias_facturados INTEGER,
      lectura_anterior REAL,
      lectura_actual REAL,
      consumo_calculado REAL,
      consumo_facturado REAL NOT NULL,
      monto_total INTEGER NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'BORRADOR'
        CHECK(estado IN ('BORRADOR','REVISADA','VALIDADA','ANULADA')),
      origen TEXT NOT NULL DEFAULT 'MANUAL'
        CHECK(origen IN ('MANUAL','EXCEL','OCR')),
      observacion TEXT,
      creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK(fecha_fin >= fecha_inicio)
    );
    CREATE INDEX IF NOT EXISTS idx_servicios_establecimiento ON servicios(establecimiento_id);
    CREATE INDEX IF NOT EXISTS idx_boletas_servicio_periodo ON boletas(servicio_id, fecha_inicio, fecha_fin);
  `);
}