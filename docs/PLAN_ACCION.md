# Plan de Acción - Control de Consumos

## Estado final
Proyecto alineado con `docs/ESPECIFICACION.md.txt`. Migraciones, repositorios, servicios, rutas y tests implementados.

## Entregables
- Migraciones SQLite con esquema spec
- Repositorios: establecimientos, servicios, registros, validaciones
- Servicios: validación V02/V03/V04/V07, métricas resumen/por servicio, atípicos Z-score e IQR
- APIs:
  - /api/establecimientos
  - /api/servicios
  - /api/registros y /api/registros/:id/validaciones
  - /api/metricas/resumen, /servicio/:id, /atipicos?servicio_id=&umbral=&metodo=zscore|iqr
  - /api/informes/registros?establecimiento_id=&format=json|csv
  - /api/alertas/resumen y /por-servicio/:id
  - /api/ocr/procesos
- Tests: 17 tests pasando, 10 archivos, unit + integración

## Próximos pasos opcionales
- E2E con Playwright
- Export PDF en informes
- Motor OCR real y extracción de campos
- Dashboard frontend

Plan cerrado.
