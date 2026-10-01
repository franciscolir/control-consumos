import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { initDatabase } from '../../src/database/connection.js';
import alertasRouter from '../../src/modules/alertas/alertas.routes.js';
import { establecimientosRepo } from '../../src/database/repositories/establecimientos.repository.js';
import { serviciosRepo } from '../../src/database/repositories/servicios.repository.js';
import { registrosRepo } from '../../src/database/repositories/registros.repository.js';
import { validarRegistro } from '../../src/services/validacion.service.js';

const app = express();
app.use('/api/alertas', alertasRouter);

beforeAll(() => {
  initDatabase();
});

describe('GET /api/alertas/resumen', () => {
  it('resume alertas abiertas por severidad', async () => {
    const est = establecimientosRepo.create({ codigo: `ALT${Date.now()}`, nombre: 'A', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'agua', unidad: 'm³', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', lectura_anterior:100, lectura_actual:80 });
    validarRegistro(reg.id);
    const res = await request(app).get('/api/alertas/resumen');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/alertas/por-servicio/:id', () => {
  it('lista alertas por servicio', async () => {
    const est = establecimientosRepo.create({ codigo: `ALT2${Date.now()}`, nombre: 'B', direccion: 'C' });
    const srv = serviciosRepo.create({ establecimiento_id: est.id, tipo: 'electricidad', unidad: 'kWh', fecha_alta: '2024-01-01' });
    const reg = registrosRepo.create({ servicio_id: srv.id, fecha_inicio:'2024-01-01', fecha_fin:'2024-01-31', lectura_anterior:100, lectura_actual:80 });
    validarRegistro(reg.id);
    const res = await request(app).get(`/api/alertas/por-servicio/${srv.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
