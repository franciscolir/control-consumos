import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (req, res) => {
  const where = req.query.servicio_id ? "WHERE b.servicio_id=?" : "";
  const args = req.query.servicio_id ? [Number(req.query.servicio_id)] : [];
  res.json(db.prepare(`SELECT b.*, s.nombre AS servicio, s.tipo, e.nombre AS establecimiento
    FROM boletas b JOIN servicios s ON s.id=b.servicio_id
    JOIN establecimientos e ON e.id=s.establecimiento_id ${where}
    ORDER BY b.fecha_inicio DESC`).all(...args));
});
router.post("/", (req, res) => {
  const b = req.body ?? {};
  const n = Number(b.consumo_facturado), monto = Number(b.monto_total || 0);
  if (!Number.isInteger(Number(b.servicio_id)) || !b.fecha_inicio || !b.fecha_fin ||
      !Number.isFinite(n) || n < 0 || !Number.isSafeInteger(monto) || monto < 0 ||
      b.fecha_fin < b.fecha_inicio)
    return res.status(400).json({ error: "Revise servicio, período, consumo y monto." });
  try {
    const r = db.prepare(`INSERT INTO boletas
      (servicio_id,folio,fecha_emision,fecha_inicio,fecha_fin,dias_facturados,lectura_anterior,
       lectura_actual,consumo_calculado,consumo_facturado,monto_total,origen,observacion)
      VALUES (@servicio_id,@folio,@fecha_emision,@fecha_inicio,@fecha_fin,@dias_facturados,
       @lectura_anterior,@lectura_actual,@consumo_calculado,@consumo_facturado,@monto_total,@origen,@observacion)`)
      .run({ servicio_id:Number(b.servicio_id), folio:b.folio||null, fecha_emision:b.fecha_emision||null,
        fecha_inicio:b.fecha_inicio, fecha_fin:b.fecha_fin, dias_facturados:b.dias_facturados||null,
        lectura_anterior:b.lectura_anterior===""?null:(b.lectura_anterior??null),
        lectura_actual:b.lectura_actual===""?null:(b.lectura_actual??null),
        consumo_calculado:b.consumo_calculado===""?null:(b.consumo_calculado??null),
        consumo_facturado:n, monto_total:monto, origen:b.origen||"MANUAL", observacion:b.observacion||null });
    res.status(201).json(db.prepare("SELECT * FROM boletas WHERE id=?").get(r.lastInsertRowid));
  } catch { res.status(400).json({ error: "No se pudo guardar la boleta. Verifique que el servicio exista." }); }
});
export default router;