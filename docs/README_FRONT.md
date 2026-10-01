# Frontend SPA - Control de Consumos

## Acceso
- SPA principal: `/spa.html`
- Panel estático original: `/`

## Navegación
- Panel
- Establecimientos
- Servicios
- Registros
- Validaciones
- Alertas
- Métricas
- Informes
- OCR
- Parámetros
- Historial
- Configuración

## Estructura
- `public/js/modules/base.js` → componentes base `card()`
- `public/js/modules/*.js` → módulos dinámicos conectados a `/api/*`
- `public/modules/` → maquetas estáticas originales

## API
Base: `/api/*`
- Establecimientos: GET/POST/DELETE `/api/establecimientos`
- Servicios: GET/POST/DELETE `/api/servicios`
- Registros: GET/POST/DELETE `/api/registros`
- Validaciones: GET `/api/registros/:id/validaciones`
- Alertas: GET `/api/alertas/resumen`, `/api/alertas/por-servicio/:id`
- Métricas: GET `/api/metricas/resumen`, `/api/metricas/servicio/:id`
- Informes: GET `/api/informes/registros?format=json|csv`
- OCR: POST/GET `/api/ocr/procesos`
- Parámetros: GET/POST `/api/parametros`
- Historial: GET `/api/historial`
- Configuración: GET `/api/configuracion`

## Desarrollo
Iniciar servidor: `npm run dev` o `node server.js`
Abrir http://localhost:3000/spa.html
