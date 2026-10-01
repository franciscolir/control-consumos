import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/:registroId", (req, res) => {
  const registroId = Number(req.params.registroId);
  const row = db.prepare("SELECT * FROM detalle_boleta WHERE registro_id = ?").get(registroId);
  if (!row) return res.status(404).json({ error: "no encontrado" });
  res.json(row);
});

router.post("/", (req, res) => {
  const { registro_id, cargo_fijo, consumo_facturado_monto, otros_cargos, impuestos, total } = req.body;
  if (!registro_id) return res.status(400).json({ error: "registro_id requerido" });
  const stmt = db.prepare(`
    INSERT INTO detalle_boleta (registro_id, cargo_fijo, consumo_facturado_monto, otros_cargos, impuestos, total)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(registro_id) DO UPDATE SET
      cargo_fijo = excluded.cargo_fijo,
      consumo_facturado_monto = excluded.consumo_facturado_monto,
      otros_cargos = excluded.otros_cargos,
      impuestos = excluded.impuestos,
      total = excluded.total
  `);
  stmt.run(registro_id, cargo_fijo ?? null, consumo_facturado_monto ?? null, otros_cargos ?? null, impuestos ?? null, total ?? null);
  const row = db.prepare("SELECT * FROM detalle_boleta WHERE registro_id = ?").get(registro_id);
  res.status(201).json(row);
});

router.put("/:registroId", (req, res) => {
  const registroId = Number(req.params.registroId);
  const { cargo_fijo, consumo_facturado_monto, otros_cargos, impuestos, total } = req.body;
  db.prepare(`
    UPDATE detalle_boleta SET
      cargo_fijo = COALESCE(?, cargo_fijo),
      consumo_facturado_monto = COALESCE(?, consumo_facturado_monto),
      otros_cargos = COALESCE(?, otros_cargos),
      impuestos = COALESCE(?, impuestos),
      total = COALESCE(?, total)
    WHERE registro_id = ?
  `).run(cargo_fijo, consumo_facturado_monto, otros_cargos, impuestos, total, registroId);
  const row = db.prepare("SELECT * FROM detalle_boleta WHERE registro_id = ?").get(registroId);
  res.json(row);
});

router.delete("/:registroId", (req, res) => {
  db.prepare("DELETE FROM detalle_boleta WHERE registro_id = ?").run(Number(req.params.registroId));
  res.status(204).send();
});

export default router;
