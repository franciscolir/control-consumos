import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import parametrosRouter from '../../src/modules/parametros/parametros.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';

const app = express();
app.use(express.json());
app.use('/api/parametros', parametrosRouter);

beforeAll(() => {
  initDatabase();
});

describe('Parametros', () => {
  it('crea y lista parámetros por servicio', async () => {
    const est = establecimientosRepo.create({ codigo: `PAR${Date.now()}`, nombre: 'P', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });

    const createRes = await request(app).post('/api/parametros').send({
      servicio_id: srv.id,
      consumo_minimo: 10,
      consumo_maximo: 1000,
      metodo: 'fijo',
      vigencia_desde: '2024-01-01'
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.servicio_id).toBe(srv.id);

    const listRes = await request(app).get(`/api/parametros?servicio_id=${srv.id}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);
  });
});
