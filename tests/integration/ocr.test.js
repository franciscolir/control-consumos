import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import ocrRouter from '../../src/modules/ocr/ocr.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use(express.json());
app.use('/api/ocr', ocrRouter);

beforeAll(() => {
  initDatabase();
});

describe('POST /api/ocr/procesos', () => {
  it('crea proceso OCR', async () => {
    const est = establecimientosRepo.create({ codigo: `OCR${Date.now()}`, nombre: 'O', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31' });
    const res = await request(app)
      .post('/api/ocr/procesos')
      .send({ registro_id: reg.id, archivo_origen: '/tmp/doc.pdf', motor: 'tesseract' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('pendiente');
  });
});
