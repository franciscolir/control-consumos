import { describe, it, expect, beforeAll } from 'vitest';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';
import { db, initDatabase } from '../../src/database/connection.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';

beforeAll(() => {
  initDatabase();
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM registros');
  db.exec('DELETE FROM servicios');
  db.exec('DELETE FROM establecimientos');
  db.pragma('foreign_keys = ON');
});

describe('registrosRepo', () => {
  it('crea registro con servicio válido', async () => {
    const code = `R${Date.now()}`;
    const est = establecimientosRepo.create({ codigo: code, nombre: 'Test', tipo: 'escuela', direccion: 'Calle 1', matricula: 100, superficie_m2: 200, activo: 1 });
    const srv = serviciosRepo.create({
      establecimiento_id: est.id,
      tipo: 'agua',
      identificador: 'Med 1',
      unidad: 'm³',
      fecha_alta: '2024-01-01'
    });
    const reg = registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31',
      lectura_anterior: 100,
      lectura_actual: 150,
      consumo_facturado: 50,
      monto_total: 50000
    });
    expect(reg).toBeDefined();
    expect(reg.servicio_id).toBe(srv.id);
    expect(reg.consumo_facturado).toBe(50);
  });
});
