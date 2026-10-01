import { Router } from "express";
import { resumenMetricas, metricasPorServicio, atipicosPorServicio, atipicosIQRPorServicio } from "../../services/metricas.service.js";
const router = Router();

router.get("/resumen", (_req, res) => {
  res.json(resumenMetricas());
});

router.get("/servicio/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "id inválido" });
  res.json(metricasPorServicio(id));
});

router.get("/atipicos", (req, res) => {
  const servicioId = Number(req.query.servicio_id);
  if (!servicioId) return res.status(400).json({ error: "servicio_id requerido" });
  const umbral = req.query.umbral ? Number(req.query.umbral) : 2.5;
  const metodo = req.query.metodo || 'zscore';
  if (metodo === 'iqr') {
    res.json(atipicosIQRPorServicio(servicioId));
  } else {
    res.json(atipicosPorServicio(servicioId, umbral));
  }
});

export default router;
