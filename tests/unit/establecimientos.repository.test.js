import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { db, initDatabase } from '../../src/database/connection.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.resolve(here, '../../data/database/test_consumos.sqlite');

beforeAll(() => {
  initDatabase();
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM registros');
  db.exec('DELETE FROM servicios');
  db.exec('DELETE FROM establecimientos');
  db.pragma('foreign_keys = ON');
});

afterAll(() => {
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM registros');
  db.exec('DELETE FROM servicios');
  db.exec('DELETE FROM establecimientos');
  db.pragma('foreign_keys = ON');
});

describe('establecimientosRepo', () => {
  it('crea y recupera establecimiento', () => {
    const code = `ESC${Date.now()}`;
    const data = {
      codigo: code,
      nombre: 'Escuela Test',
      tipo: 'escuela',
      direccion: 'Calle 1',
      matricula: 200,
      superficie_m2: 500,
      activo: 1
    };
    const created = establecimientosRepo.create(data);
    expect(created).toBeDefined();
    expect(created.codigo).toBe(code);
    expect(created.nombre).toBe('Escuela Test');

    const found = establecimientosRepo.findByCodigo(code);
    expect(found.id).toBe(created.id);
  });

  it('lista establecimientos', () => {
    const code = `ESC${Date.now()}_list`;
    establecimientosRepo.create({
      codigo: code,
      nombre: 'Escuela List',
      tipo: 'escuela',
      direccion: 'Calle 2',
      matricula: 100,
      superficie_m2: 300,
      activo: 1
    });
    const list = establecimientosRepo.findAll();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });
});
