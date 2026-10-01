import { Router } from "express";
import { db } from "../../database/connection.js";
const router = Router();

router.get("/resumen", (_req, res) => {
  const rows = db.prepare(`
    SELECT severidad, COUNT(*) as cantidad
    FROM validaciones
    WHERE estado = 'pendiente'
    GROUP BY severidad
  `).all();
  res.json(rows);
});

router.get("/por-servicio/:id", (req, res) => {
  const servicioId = Number(req.params.id);
  if (!servicioId) return res.status(400).json({ error: "id inválido" });
  const rows = db.prepare(`
    SELECT v.*
    FROM validaciones v
    JOIN registros r ON r.id = v.registro_id
    WHERE r.servicio_id = ? AND v.estado = 'pendiente'
    ORDER BY v.creada_en DESC
  `).all(servicioId);
  res.json(rows);
});

export default router;
