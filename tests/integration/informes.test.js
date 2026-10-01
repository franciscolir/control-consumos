import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import informesRouter from '../../src/modules/informes/informes.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';

const app = express();
app.use('/api/informes', informesRouter);

beforeAll(() => {
  initDatabase();
});

describe('GET /api/informes/registros', () => {
  it('lista registros por establecimiento en JSON', async () => {
    const est = establecimientosRepo.create({ codigo: `INF${Date.now()}`, nombre: 'Info', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', consumo_facturado: 120 });
    registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-02-01', fecha_fin:'2024-02-28', consumo_facturado: 130 });

    const res = await request(app).get(`/api/informes/registros?establecimiento_id=${est.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('servicio_tipo');
  });

  it('exporta registros en CSV', async () => {
    const est = establecimientosRepo.create({ codigo: `INFCSV${Date.now()}`, nombre: 'CSV', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', consumo_facturado: 100 });
    const res = await request(app).get(`/api/informes/registros?establecimiento_id=${est.id}&format=csv`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/csv/);
    expect(res.text).toContain('id,fecha_inicio');
    expect(res.text).toContain('100');
  });
});
