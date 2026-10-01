import { db } from "../database/connection.js";

export function atipicosPorServicio(servicioId, umbral = 2.5) {
  const rows = db.prepare("SELECT id, consumo_facturado FROM registros WHERE servicio_id = ? AND consumo_facturado IS NOT NULL").all(servicioId);
  if (rows.length < 2) return [];
  const values = rows.map(r => r.consumo_facturado).sort((a,b)=>a-b);
  const mean = values.reduce((a,b)=>a+b,0)/values.length;
  const variance = values.reduce((a,b)=>a+Math.pow(b-mean,2),0)/values.length;
  const std = Math.sqrt(variance);
  if (std === 0) return [];
  return rows.filter(r => {
    const z = Math.abs((r.consumo_facturado - mean)/std);
    return z > umbral;
  }).map(r => ({ ...r, z: (r.consumo_facturado - mean)/std }));
}

export function atipicosIQRPorServicio(servicioId) {
  const rows = db.prepare("SELECT id, consumo_facturado FROM registros WHERE servicio_id = ? AND consumo_facturado IS NOT NULL").all(servicioId);
  if (rows.length < 4) return [];
  const values = rows.map(r => r.consumo_facturado).sort((a,b)=>a-b);
  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return rows.filter(r => r.consumo_facturado < lower || r.consumo_facturado > upper).map(r => ({ ...r, metodo: 'IQR', lower, upper }));
}

function percentile(arr, p) {
  const idx = (arr.length -1) * p / 100;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return arr[lo];
  const w = idx - lo;
  return arr[lo] * (1-w) + arr[hi] * w;
}

export function resumenMetricas() {
  const totalRegistros = db.prepare("SELECT COUNT(*) as c FROM registros").get().c;
  const consumoTotal = db.prepare("SELECT COALESCE(SUM(consumo_facturado),0) as total FROM registros").get().total;
  const montoTotal = db.prepare("SELECT COALESCE(SUM(monto_total),0) as total FROM registros").get().total;
  const promedioMensual = db.prepare(`
    SELECT AVG(consumo_facturado) as avg FROM registros WHERE consumo_facturado IS NOT NULL
  `).get().avg;

  return {
    totalRegistros,
    consumoTotal,
    montoTotal,
    promedioMensual: promedioMensual ?? 0
  };
}

export function metricasPorServicio(servicioId) {
  const rows = db.prepare(`
    SELECT
      COUNT(*) as registros,
      COALESCE(SUM(consumo_facturado),0) as consumo_total,
      COALESCE(SUM(monto_total),0) as monto_total,
      AVG(consumo_facturado) as promedio
    FROM registros
    WHERE servicio_id = ?
  `).get(servicioId);
  return rows;
}
