import { Router } from "express";
import { registrosRepo } from "../../database/repositories/registros.repository.js";
import { validacionesRepo } from "../../database/repositories/validaciones.repository.js";
import { validarRegistro } from "../../services/validacion.service.js";
const router = Router();

router.get("/", (req, res) => {
  const servicio_id = req.query.servicio_id ? Number(req.query.servicio_id) : undefined;
  res.json(registrosRepo.findAll({ servicio_id }));
});

router.get("/:id", (req, res) => {
  const reg = registrosRepo.findById(Number(req.params.id));
  if (!reg) return res.status(404).json({ error: "No encontrado" });
  res.json(reg);
});

router.get("/:id/validaciones", (req, res) => {
  const id = Number(req.params.id);
  const reg = registrosRepo.findById(id);
  if (!reg) return res.status(404).json({ error: "No encontrado" });
  validarRegistro(id);
  res.json(validacionesRepo.findByRegistro(id));
});

router.post("/", (req, res) => {
  const b = req.body ?? {};
  if (!Number.isInteger(Number(b.servicio_id)) || !b.fecha_inicio || !b.fecha_fin)
    return res.status(400).json({ error: "servicio_id, fecha_inicio y fecha_fin son obligatorios" });
  if (b.fecha_fin < b.fecha_inicio)
    return res.status(400).json({ error: "fecha_fin debe ser >= fecha_inicio" });
  try {
    const created = registrosRepo.create({
      servicio_id: Number(b.servicio_id),
      fecha_inicio: b.fecha_inicio,
      fecha_fin: b.fecha_fin,
      lectura_anterior: b.lectura_anterior ?? null,
      lectura_actual: b.lectura_actual ?? null,
      consumo_calculado: b.consumo_calculado ?? null,
      consumo_facturado: b.consumo_facturado ?? null,
      tipo_lectura: b.tipo_lectura || null,
      folio: b.folio || null,
      monto_total: b.monto_total ?? null,
      observaciones: b.observaciones || null,
      documento_path: b.documento_path || null
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "No se pudo guardar el registro" });
  }
});

router.put("/:id", (req, res) => {
  const updated = registrosRepo.update(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  registrosRepo.delete(Number(req.params.id));
  res.status(204).end();
});

export default router;
