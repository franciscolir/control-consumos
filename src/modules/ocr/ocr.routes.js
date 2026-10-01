import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.post("/procesos", (req, res) => {
  const { registro_id, archivo_origen, motor } = req.body;
  if (!registro_id || !archivo_origen) {
    return res.status(400).json({ error: "registro_id y archivo_origen requeridos" });
  }
  const stmt = db.prepare(`
    INSERT INTO ocr_procesos (registro_id, archivo_origen, estado, motor)
    VALUES (?, ?, 'pendiente', ?)
  `);
  const info = stmt.run(registro_id, archivo_origen, motor || null);
  const proceso = db.prepare("SELECT * FROM ocr_procesos WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(proceso);
});

router.get("/procesos/:id", (req, res) => {
  const id = Number(req.params.id);
  const proceso = db.prepare("SELECT * FROM ocr_procesos WHERE id = ?").get(id);
  if (!proceso) return res.status(404).json({ error: "no encontrado" });
  res.json(proceso);
});

export default router;
