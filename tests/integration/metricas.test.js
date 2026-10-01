import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import metricasRouter from '../../src/modules/metricas/metricas.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use('/api/metricas', metricasRouter);

beforeAll(() => {
  initDatabase();
});

describe('API /api/metricas/resumen', () => {
  it('devuelve resumen con totales', async () => {
    const est = establecimientosRepo.create({ codigo: `MET${Date.now()}`, nombre: 'Test', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31',
      consumo_facturado: 100,
      monto_total: 5000
    });

    const res = await request(app).get('/api/metricas/resumen');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRegistros');
    expect(res.body).toHaveProperty('consumoTotal');
    expect(res.body.consumoTotal).toBeGreaterThanOrEqual(100);
  });
});
