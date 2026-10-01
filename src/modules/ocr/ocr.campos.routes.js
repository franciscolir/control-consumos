import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/procesos/:procesoId/campos", (req, res) => {
  const procesoId = Number(req.params.procesoId);
  const rows = db.prepare("SELECT * FROM ocr_campos WHERE ocr_proceso_id = ?").all(procesoId);
  res.json(rows);
});

router.post("/procesos/:procesoId/campos", (req, res) => {
  const procesoId = Number(req.params.procesoId);
  const { campo, valor_extraido, valor_normalizado, confianza, metodo } = req.body;
  if (!campo) return res.status(400).json({ error: "campo requerido" });
  const stmt = db.prepare(`
    INSERT INTO ocr_campos (ocr_proceso_id, campo, valor_extraido, valor_normalizado, confianza, metodo, validado)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);
  const info = stmt.run(procesoId, campo, valor_extraido ?? null, valor_normalizado ?? null, confianza ?? null, metodo ?? null);
  const row = db.prepare("SELECT * FROM ocr_campos WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.put("/campos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { valor_normalizado, validado } = req.body;
  db.prepare(`
    UPDATE ocr_campos SET
      valor_normalizado = COALESCE(?, valor_normalizado),
      validado = COALESCE(?, validado)
    WHERE id = ?
  `).run(valor_normalizado, validado, id);
  const row = db.prepare("SELECT * FROM ocr_campos WHERE id = ?").get(id);
  res.json(row);
});

export default router;
