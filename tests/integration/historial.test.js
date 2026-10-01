import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import historialRouter from '../../src/modules/historial/historial.routes.js';

const app = express();
app.use(express.json());
app.use('/api/historial', historialRouter);

beforeAll(() => {
  initDatabase();
});

describe('Historial', () => {
  it('crea y consulta historial', async () => {
    const createRes = await request(app).post('/api/historial').send({
      entidad: 'establecimientos',
      entidad_id: 1,
      campo: 'nombre',
      valor_anterior: 'A',
      valor_nuevo: 'B'
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.entidad).toBe('establecimientos');

    const listRes = await request(app).get('/api/historial?entidad=establecimientos&entidad_id=1');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThan(0);
  });
});
