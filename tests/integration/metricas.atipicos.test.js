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

describe('GET /api/metricas/atipicos', () => {
  it('detecta consumo atípico por Z-score con umbral por defecto', async () => {
    const est = establecimientosRepo.create({ codigo: `ATIP${Date.now()}`, nombre: 'Test', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    // valores normales
    for (let i=0;i<20;i++) {
      registrosRepo.create({
        servicio_id: srv.id,
        fecha_inicio: `2024-01-${String(i+1).padStart(2,'0')}`,
        fecha_fin: `2024-01-${String(i+2).padStart(2,'0')}`,
        consumo_facturado: 100
      });
    }
    // valor atípico
    registrosRepo.create({
      servicio_id: srv.id,
      fecha_inicio: '2024-02-01',
      fecha_fin: '2024-02-28',
      consumo_facturado: 1000000
    });

    const res = await request(app).get(`/api/metricas/atipicos?servicio_id=${srv.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].consumo_facturado).toBe(1000000);
  });

  it('respeta umbral personalizado', async () => {
    const est = establecimientosRepo.create({ codigo: `ATIP2-${Date.now()}`, nombre: 'Test2', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'electricidad', unidad: 'kWh', fecha_alta: '2024-01-01' });
    for (let i=0;i<20;i++) {
      registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', consumo_facturado: 100 });
    }
    registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-02-01', fecha_fin:'2024-02-28', consumo_facturado: 500 });
    // con umbral 1.5 debe detectar
    const res = await request(app).get(`/api/metricas/atipicos?servicio_id=${srv.id}&umbral=1.5`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('detecta atípicos por IQR', async () => {
    const est = establecimientosRepo.create({ codigo: `ATIP3-${Date.now()}`, nombre: 'Test3', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    for (let i=0;i<20;i++) {
      registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', consumo_facturado: 100 });
    }
    registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-02-01', fecha_fin:'2024-02-28', consumo_facturado: 1000 });
    const res = await request(app).get(`/api/metricas/atipicos?servicio_id=${srv.id}&metodo=iqr`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].metodo).toBe('IQR');
  });
});
