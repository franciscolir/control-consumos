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

const migrationsDir = path.resolve(here, "migrations");
const migrationsApplied = new Set();

export function initDatabase() {
  // tabla de control de migraciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const already = db.prepare("SELECT 1 FROM _migrations WHERE filename = ?").get(file);
    if (already) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (filename) VALUES (?)").run(file);
  }
}
