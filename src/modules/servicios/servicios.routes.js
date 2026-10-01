import { Router } from "express";
import { serviciosRepo } from "../../database/repositories/servicios.repository.js";
const router = Router();

router.get("/", (_req, res) => {
  res.json(serviciosRepo.findAll());
});
router.get("/:id", (req, res) => {
  const srv = serviciosRepo.findById(Number(req.params.id));
  if (!srv) return res.status(404).json({ error: "No encontrado" });
  res.json(srv);
});
router.post("/", (req, res) => {
  const b = req.body ?? {};
  const establecimiento_id = Number(b.establecimiento_id);
  const tipo = String(b.tipo ?? "").toLowerCase();
  const unidad = String(b.unidad ?? "").trim();
  if (!Number.isInteger(establecimiento_id) || !["agua","electricidad"].includes(tipo) || !unidad)
    return res.status(400).json({ error: "Establecimiento, tipo y unidad son obligatorios." });
  try {
    const created = serviciosRepo.create({
      establecimiento_id,
      tipo,
      identificador: b.identificador ? String(b.identificador).trim() : null,
      numero_medidor: b.numero_medidor ? String(b.numero_medidor).trim() : null,
      unidad,
      fecha_alta: b.fecha_alta || new Date().toISOString().slice(0,10),
      fecha_baja: b.fecha_baja || null,
      activo: b.activo ? Number(b.activo) : 1
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "No se pudo guardar el servicio." });
  }
});
router.put("/:id", (req, res) => {
  const updated = serviciosRepo.update(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});
router.delete("/:id", (req, res) => {
  serviciosRepo.delete(Number(req.params.id));
  res.status(204).end();
});
export default router;