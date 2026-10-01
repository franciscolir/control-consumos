import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import ocrPlantillasRouter from '../../src/modules/ocr/ocr.plantillas.routes.js';

const app = express();
app.use(express.json());
app.use('/api/ocr/plantillas', ocrPlantillasRouter);

beforeAll(() => {
  initDatabase();
});

describe('OCR Plantillas', () => {
  it('crea y lista plantilla', async () => {
    const createRes = await request(app).post('/api/ocr/plantillas').send({
      nombre: 'Agua v1',
      tipo_servicio: 'agua',
      patrones_json: '{}'
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.nombre).toBe('Agua v1');

    const listRes = await request(app).get('/api/ocr/plantillas');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
  });
});
