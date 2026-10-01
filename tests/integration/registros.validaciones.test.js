import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import registrosRouter from '../../src/modules/registros/registros.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use(express.json());
app.use('/api/registros', registrosRouter);

beforeAll(() => {
  initDatabase();
});

describe('GET /api/registros/:id/validaciones', () => {
  it('devuelve validaciones tras crear registro con lectura regresiva', async () => {
    const est = establecimientosRepo.create({ codigo: `INTV${Date.now()}`, nombre: 'Test', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-10',
      lectura_anterior: 100,
      lectura_actual: 50
    });

    const res = await request(app).get(`/api/registros/${reg.id}/validaciones`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(v => v.tipo === 'lectura')).toBe(true);
  });
});
