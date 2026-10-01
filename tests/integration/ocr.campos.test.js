import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import ocrRouter from '../../src/modules/ocr/ocr.routes.js';
import ocrCamposRouter from '../../src/modules/ocr/ocr.campos.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use(express.json());
app.use('/api/ocr', ocrRouter);
app.use('/api/ocr/campos', ocrCamposRouter);

beforeAll(() => {
  initDatabase();
});

describe('OCR Campos', () => {
  it('crea proceso y campo OCR', async () => {
    const est = establecimientosRepo.create({ codigo: `OCRC${Date.now()}`, nombre: 'O', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31' });

    const procRes = await request(app).post('/api/ocr/procesos').send({ registro_id: reg.id, archivo_origen: '/tmp/x.pdf' });
    expect(procRes.status).toBe(201);
    const procesoId = procRes.body.id;

    const campoRes = await request(app).post('/api/ocr/campos/procesos/' + procesoId + '/campos').send({
      campo: 'lectura_actual',
      valor_extraido: '123',
      confianza: 0.9
    });
    // Note route is /api/ocr/campos/procesos/:procesoId/campos -> our mount is /api/ocr/campos, router has /procesos/:procesoId/campos
    // So full path is /api/ocr/campos/procesos/:procesoId/campos which is correct
    expect(campoRes.status).toBe(201);
    expect(campoRes.body.campo).toBe('lectura_actual');
  });
});
