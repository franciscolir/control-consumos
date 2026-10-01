import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import detalleBoletaRouter from '../../src/modules/detalleBoleta/detalle.boleta.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use(express.json());
app.use('/api/detalle-boleta', detalleBoletaRouter);

beforeAll(() => {
  initDatabase();
});

describe('Detalle Boleta', () => {
  it('crea y obtiene detalle', async () => {
    const est = establecimientosRepo.create({ codigo: `DB${Date.now()}`, nombre: 'D', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31' });

    const createRes = await request(app).post('/api/detalle-boleta').send({
      registro_id: reg.id,
      cargo_fijo: 1000,
      total: 5000
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.registro_id).toBe(reg.id);

    const getRes = await request(app).get(`/api/detalle-boleta/${reg.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.total).toBe(5000);
  });
});
