import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/", (_req, res) => {
  res.json(db.prepare("SELECT * FROM establecimientos ORDER BY nombre").all());
});
router.post("/", (req, res) => {
  const { codigo, nombre, tipo = null, direccion = null, comuna = null } = req.body ?? {};
  if (!String(codigo ?? "").trim() || !String(nombre ?? "").trim())
    return res.status(400).json({ error: "Código y nombre son obligatorios." });
  try {
    const result = db.prepare(`INSERT INTO establecimientos (codigo,nombre,tipo,direccion,comuna)
      VALUES (@codigo,@nombre,@tipo,@direccion,@comuna)`).run({
      codigo: String(codigo).trim(), nombre: String(nombre).trim(), tipo, direccion, comuna
    });
    res.status(201).json(db.prepare("SELECT * FROM establecimientos WHERE id=?").get(result.lastInsertRowid));
  } catch (e) {
    res.status(e.code === "SQLITE_CONSTRAINT_UNIQUE" ? 409 : 400)
      .json({ error: e.code === "SQLITE_CONSTRAINT_UNIQUE" ? "El código ya existe." : "No se pudo guardar." });
  }
});
export default router;