import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (req, res) => {
  const { entidad, entidad_id } = req.query;
  let sql = "SELECT * FROM historial_cambios";
  const params = [];
  if (entidad) {
    sql += " WHERE entidad = ?";
    params.push(entidad);
    if (entidad_id) {
      sql += " AND entidad_id = ?";
      params.push(Number(entidad_id));
    }
  } else if (entidad_id) {
    sql += " WHERE entidad_id = ?";
    params.push(Number(entidad_id));
  }
  sql += " ORDER BY fecha DESC LIMIT 1000";
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.post("/", (req, res) => {
  const { entidad, entidad_id, campo, valor_anterior, valor_nuevo } = req.body;
  if (!entidad || !entidad_id || !campo) {
    return res.status(400).json({ error: "entidad, entidad_id y campo requeridos" });
  }
  const stmt = db.prepare(`
    INSERT INTO historial_cambios (entidad, entidad_id, campo, valor_anterior, valor_nuevo)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(entidad, entidad_id, campo, valor_anterior ?? null, valor_nuevo ?? null);
  const row = db.prepare("SELECT * FROM historial_cambios WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

export default router;
