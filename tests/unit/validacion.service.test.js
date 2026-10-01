import { describe, it, expect, beforeAll } from 'vitest';
import { initDatabase } from '../../src/database/connection.js';
import { db } from '../../src/database/connection.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';
import { validarRegistro } from '../../src/services/validacion.service.js';

beforeAll(() => {
  initDatabase();
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM validaciones');
  db.exec('DELETE FROM registros');
  db.exec('DELETE FROM servicios');
  db.exec('DELETE FROM establecimientos');
  db.pragma('foreign_keys = ON');
});

describe('validacion.service', () => {
  it('detecta lectura regresiva V03', () => {
    const est = establecimientosRepo.create({ codigo: `V03-${Date.now()}-${Math.random()}`, nombre: 'Test', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31',
      lectura_anterior: 100,
      lectura_actual: 80
    });
    const vals = validarRegistro(reg.id);
    expect(vals.some(v => v.tipo === 'lectura' && v.severidad === 'advertencia')).toBe(true);
  });

  it('detecta duración inusual V02', () => {
    const est = establecimientosRepo.create({ codigo: `V02-${Date.now()}-${Math.random()}`, nombre: 'Test2', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'electricidad', unidad: 'kWh', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-10',
      lectura_anterior: 10,
      lectura_actual: 20
    });
    const vals = validarRegistro(reg.id);
    expect(vals.some(v => v.descripcion.includes('Duración inusual'))).toBe(true);
  });
});
