import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    const line = headers.map(h => {
      const v = r[h];
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

router.get("/registros", (req, res) => {
  const establecimientoId = Number(req.query.establecimiento_id);
  if (!establecimientoId) return res.status(400).json({ error: "establecimiento_id requerido" });
  const format = req.query.format || 'json';

  const rows = db.prepare(`
    SELECT
      r.id,
      r.fecha_inicio,
      r.fecha_fin,
      r.consumo_facturado,
      r.monto_total,
      s.tipo as servicio_tipo,
      s.identificador as servicio_identificador
    FROM registros r
    JOIN servicios s ON s.id = r.servicio_id
    WHERE s.establecimiento_id = ?
    ORDER BY r.fecha_inicio DESC
  `).all(establecimientoId);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registros.csv"');
    res.send(toCSV(rows));
  } else {
    res.json(rows);
  }
});

export default router;
