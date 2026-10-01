import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT clave, valor FROM configuracion").all();
  res.json(rows);
});

router.get("/:clave", (req, res) => {
  const row = db.prepare("SELECT clave, valor FROM configuracion WHERE clave = ?").get(req.params.clave);
  if (!row) return res.status(404).json({ error: "no encontrado" });
  res.json(row);
});

router.put("/:clave", (req, res) => {
  const { valor } = req.body;
  if (valor === undefined) return res.status(400).json({ error: "valor requerido" });
  db.prepare(`
    INSERT INTO configuracion (clave, valor) VALUES (?, ?)
    ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
  `).run(req.params.clave, String(valor));
  const row = db.prepare("SELECT clave, valor FROM configuracion WHERE clave = ?").get(req.params.clave);
  res.json(row);
});

router.delete("/:clave", (req, res) => {
  db.prepare("DELETE FROM configuracion WHERE clave = ?").run(req.params.clave);
  res.status(204).send();
});

export default router;
