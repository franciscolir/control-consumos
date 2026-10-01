import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (req, res) => {
  const servicioId = Number(req.query.servicio_id);
  if (!servicioId) return res.status(400).json({ error: "servicio_id requerido" });
  const rows = db.prepare("SELECT * FROM parametros WHERE servicio_id = ? ORDER BY vigencia_desde DESC").all(servicioId);
  res.json(rows);
});

router.post("/", (req, res) => {
  const { servicio_id, consumo_minimo, consumo_maximo, metodo, vigencia_desde, vigencia_hasta } = req.body;
  if (!servicio_id || !vigencia_desde) return res.status(400).json({ error: "servicio_id y vigencia_desde requeridos" });
  const stmt = db.prepare(`
    INSERT INTO parametros (servicio_id, consumo_minimo, consumo_maximo, metodo, vigencia_desde, vigencia_hasta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(servicio_id, consumo_minimo ?? null, consumo_maximo ?? null, metodo ?? null, vigencia_desde, vigencia_hasta ?? null);
  const param = db.prepare("SELECT * FROM parametros WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(param);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { consumo_minimo, consumo_maximo, metodo, vigencia_desde, vigencia_hasta } = req.body;
  db.prepare(`
    UPDATE parametros SET
      consumo_minimo = COALESCE(?, consumo_minimo),
      consumo_maximo = COALESCE(?, consumo_maximo),
      metodo = COALESCE(?, metodo),
      vigencia_desde = COALESCE(?, vigencia_desde),
      vigencia_hasta = COALESCE(?, vigencia_hasta)
    WHERE id = ?
  `).run(consumo_minimo, consumo_maximo, metodo, vigencia_desde, vigencia_hasta, id);
  const param = db.prepare("SELECT * FROM parametros WHERE id = ?").get(id);
  res.json(param);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM parametros WHERE id = ?").run(Number(req.params.id));
  res.status(204).send();
});

export default router;
