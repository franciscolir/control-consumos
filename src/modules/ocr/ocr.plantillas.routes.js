import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM ocr_plantillas ORDER BY id DESC").all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { nombre, proveedor, tipo_servicio, patrones_json, version, activa } = req.body;
  if (!nombre || !tipo_servicio) return res.status(400).json({ error: "nombre y tipo_servicio requeridos" });
  const stmt = db.prepare(`
    INSERT INTO ocr_plantillas (nombre, proveedor, tipo_servicio, patrones_json, version, activa)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(nombre, proveedor ?? null, tipo_servicio, patrones_json ?? null, version ?? 1, activa ?? 1);
  const row = db.prepare("SELECT * FROM ocr_plantillas WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM ocr_plantillas WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "no encontrado" });
  res.json(row);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nombre, proveedor, tipo_servicio, patrones_json, version, activa } = req.body;
  db.prepare(`
    UPDATE ocr_plantillas SET
      nombre = COALESCE(?, nombre),
      proveedor = COALESCE(?, proveedor),
      tipo_servicio = COALESCE(?, tipo_servicio),
      patrones_json = COALESCE(?, patrones_json),
      version = COALESCE(?, version),
      activa = COALESCE(?, activa)
    WHERE id = ?
  `).run(nombre, proveedor, tipo_servicio, patrones_json, version, activa, id);
  const row = db.prepare("SELECT * FROM ocr_plantillas WHERE id = ?").get(id);
  res.json(row);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM ocr_plantillas WHERE id = ?").run(Number(req.params.id));
  res.status(204).send();
});

export default router;
