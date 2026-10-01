import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import configuracionRouter from '../../src/modules/configuracion/configuracion.routes.js';

const app = express();
app.use(express.json());
app.use('/api/configuracion', configuracionRouter);

beforeAll(() => {
  initDatabase();
});

describe('Configuracion', () => {
  it('crea y lee clave valor', async () => {
    const putRes = await request(app).put('/api/configuracion/umbral_atipico').send({ valor: '2.5' });
    expect(putRes.status).toBe(200);
    expect(putRes.body.clave).toBe('umbral_atipico');

    const getRes = await request(app).get('/api/configuracion/umbral_atipico');
    expect(getRes.status).toBe(200);
    expect(getRes.body.valor).toBe('2.5');
  });
});
