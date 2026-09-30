import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (req, res) => {
  const sql = `SELECT s.*, e.codigo AS establecimiento_codigo, e.nombre AS establecimiento
    FROM servicios s JOIN establecimientos e ON e.id=s.establecimiento_id
    ORDER BY e.nombre, s.tipo, s.nombre`;
  res.json(db.prepare(sql).all());
});
router.post("/", (req, res) => {
  const b = req.body ?? {};
  if (!Number.isInteger(Number(b.establecimiento_id)) || !["AGUA","ELECTRICIDAD"].includes(b.tipo) ||
      !String(b.nombre ?? "").trim() || !String(b.unidad ?? "").trim())
    return res.status(400).json({ error: "Establecimiento, tipo, nombre y unidad son obligatorios." });
  try {
    const r = db.prepare(`INSERT INTO servicios
      (establecimiento_id,tipo,nombre,empresa,numero_cliente,numero_medidor,unidad,factor_conversion)
      VALUES (@establecimiento_id,@tipo,@nombre,@empresa,@numero_cliente,@numero_medidor,@unidad,@factor_conversion)`)
      .run({ establecimiento_id:Number(b.establecimiento_id), tipo:b.tipo, nombre:b.nombre.trim(),
        empresa:b.empresa||null, numero_cliente:b.numero_cliente||null, numero_medidor:b.numero_medidor||null,
        unidad:b.unidad.trim(), factor_conversion:Number(b.factor_conversion||1) });
    res.status(201).json(db.prepare("SELECT * FROM servicios WHERE id=?").get(r.lastInsertRowid));
  } catch { res.status(400).json({ error: "No se pudo guardar el servicio. Verifique el establecimiento y los datos." }); }
});
export default router;