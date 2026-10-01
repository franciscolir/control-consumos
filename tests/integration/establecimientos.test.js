import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import establishmentsRouter from '../../src/modules/establecimientos/establecimientos.routes.js';

// app de test en memoria
const app = express();
app.use(express.json());
app.use('/api/establecimientos', establishmentsRouter);

beforeAll(() => {
  initDatabase();
});

describe('API /api/establecimientos', () => {
  it('crea y lista establecimientos', async () => {
    const resPost = await request(app)
      .post('/api/establecimientos')
      .send({ codigo: 'INT001', nombre: 'Test School', tipo: 'escuela' });
    expect(resPost.status).toBe(201);
    expect(resPost.body.codigo).toBe('INT001');

    const resGet = await request(app).get('/api/establecimientos');
    expect(resGet.status).toBe(200);
    expect(Array.isArray(resGet.body)).toBe(true);
    expect(resGet.body.some(e => e.codigo === 'INT001')).toBe(true);
  });

  it('rechaza código duplicado', async () => {
    const res = await request(app)
      .post('/api/establecimientos')
      .send({ codigo: 'INT001', nombre: 'Otro' });
    expect(res.status).toBe(409);
  });
});
