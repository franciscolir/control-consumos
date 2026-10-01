import { Router } from "express";
import { establecimientosRepo } from "../../database/repositories/establecimientos.repository.js";
const router = Router();

router.get("/", (_req, res) => {
  res.json(establecimientosRepo.findAll());
});
router.post("/", (req, res) => {
  const { codigo, nombre, tipo = null, direccion = null, matricula = null, superficie_m2 = null, activo = 1 } = req.body ?? {};
  if (!String(codigo ?? "").trim() || !String(nombre ?? "").trim())
    return res.status(400).json({ error: "Código y nombre son obligatorios." });
  try {
    const created = establecimientosRepo.create({
      codigo: String(codigo).trim(),
      nombre: String(nombre).trim(),
      tipo,
      direccion,
      matricula: matricula ? Number(matricula) : null,
      superficie_m2: superficie_m2 ? Number(superficie_m2) : null,
      activo: Number(activo)
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(e.code === "SQLITE_CONSTRAINT_UNIQUE" ? 409 : 400)
      .json({ error: e.code === "SQLITE_CONSTRAINT_UNIQUE" ? "El código ya existe." : "No se pudo guardar." });
  }
});
router.get("/:id", (req, res) => {
  const est = establecimientosRepo.findById(Number(req.params.id));
  if (!est) return res.status(404).json({ error: "No encontrado" });
  res.json(est);
});
router.put("/:id", (req, res) => {
  const updated = establecimientosRepo.update(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});
router.delete("/:id", (req, res) => {
  establecimientosRepo.delete(Number(req.params.id));
  res.status(204).end();
});
export default router;