import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Flujo completo API', () => {
  test('crear establecimiento, servicio, registro y validar', async ({ request }) => {
    // Establecimiento
    const estRes = await request.post(`${BASE}/api/establecimientos`, {
      data: {
        codigo: `E2E-${Date.now()}`,
        nombre: 'E2E Test',
        direccion: 'Calle'
      }
    });
    expect(estRes.status()).toBe(201);
    const est = await estRes.json();
    expect(est.id).toBeTruthy();

    // Servicio
    const srvRes = await request.post(`${BASE}/api/servicios`, {
      data: {
        establecimiento_id: est.id,
        tipo: 'agua',
        unidad: 'm³',
        fecha_alta: '2024-01-01'
      }
    });
    expect(srvRes.status()).toBe(201);
    const srv = await srvRes.json();

    // Registro con lectura regresiva
    const regRes = await request.post(`${BASE}/api/registros`, {
      data: {
        servicio_id: srv.id,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-31',
        lectura_anterior: 100,
        lectura_actual: 80
      }
    });
    expect(regRes.status()).toBe(201);
    const reg = await regRes.json();

    // Validaciones
    const valRes = await request.get(`${BASE}/api/registros/${reg.id}/validaciones`);
    expect(valRes.status()).toBe(200);
    const vals = await valRes.json();
    expect(vals.length).toBeGreaterThan(0);
  });
});
