import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server.js';

describe('Panel API', ()=>{
  it('GET /api/metricas/resumen returns data', async ()=>{
    const res = await request(app).get('/api/metricas/resumen');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRegistros');
    expect(res.body).toHaveProperty('consumoTotal');
  });
});
