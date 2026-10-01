# Roadmap — Control de Consumos: front funcional conectado al back

**Objetivo:** `public/index.html` (mockup Material 2907 líneas) deja de ser una maqueta y pasa a ser la app real, alimentada por `/api/*` → SQLite. Cero datos hardcodeados. Tests verdes.

**Estado de partida verificado**
- ✅ `public/index.html` = mockup (restaurado, 11 vistas con router por hash)
- ✅ Backend: 14 routers montados, BD `consumos.sqlite` con 13 tablas, 24 tests verdes
- ✅ Joins ya resueltos en `registros.repository.js:5-11` y `servicios.repository.js:5-10`
- ❌ Front paralelo y muerto: `public/spa.html`, `public/js/modules/*` (16 archivos con `prompt()`)
- ❌ Router sin montar con SQL a tabla inexistente: `src/modules/boletas/`
- ❌ E2E `homepage.spec.js` apunta al front viejo (`#count-est`)
- ⚠️ Cobertura 64,18% (meta 80%)

---

## Fase 0 — Despeje de escombros

*Sin esto hay dos fronts y código que miente.*

| # | Tarea | Entregable |
|---|---|---|
| 0.1 | Borrar `public/spa.html` + `public/js/modules/` | Un solo front |
| 0.2 | Borrar `src/modules/boletas/` | Sin código muerto |
| 0.3 | Borrar `check_db.js`, `consumos.db`, `copy_modules.ps1` | Raíz limpia |
| 0.4 | Actualizar `tests/e2e/homepage.spec.js` | E2E alineado al mockup |

**Criterio:** `npm test` ✅ · `npx playwright test` ✅ · `/` sirve el mockup.

---

## Fase 1 — Hormigón armado (capa de datos)

*Pre-requisito de todo lo demás.*

| # | Tarea | Archivo |
|---|---|---|
| 1.1 | `api(url, opts)` con manejo de `data.error`, `esc()`, `setKpi()`, `openModal/closeModal` | `public/js/api.js` (nuevo) |
| 1.2 | Inyectar ids en KPIs: `#kpi-agua`, `#kpi-luz`, `#kpi-alertas`, `#kpi-atipicos`, `#kpi-cobertura`, `#kpi-verificado` | `index.html` |
| 1.3 | Vaciar `<tbody>` hardcodeados → `#tb-establecimientos`, `#tb-servicios`, `#tb-dash-bol`, `#tb-validaciones`, `#tb-auditoria`, `#tb-informes`, `#tb-config` | `index.html` |
| 1.4 | Ids en selects y contadores: `#sel-est-header`, `#sel-periodo`, `#sel-est-boleta`, `#sel-serv-boleta`, `#nav-pend`, `#nav-alertas`, `#db-size` | `index.html` |
| 1.5 | Cargar `api.js` como module en el script inline | `index.html` |

**Criterio:** abrir `/` no muestra filas fantasma; consola sin errores.

---

## Fase 2 — Conexión de vistas (por orden de visibilidad)

| Paso | Vista | Endpoints | Incluye | Bloqueado por |
|---|---|---|---|---|
| 2.1 | **dashboard** | `metricas/resumen`, `alertas/resumen`, `registros` | KPIs + 2 tablas + filtros que afectan todo (§7) | Fase 1 |
| 2.2 | **establecimientos** | `/api/establecimientos` CRUD | **Crear modal `#estModal` (no existe)**, badges reales | Fase 1 |
| 2.3 | **servicios** | `/api/servicios` CRUD | Modal `#newServiceModal` (existe) → POST, 4 KPIs calculados | Fase 1 |
| — | ▶ **hito A:** primer front real | | e2e nuevos `crud-establecimientos` | 2.1-2.3 |
| 2.4 | **boletas** | POST `/api/registros` | selects poblados, validación V01–V14 en vivo | Fase 3.1, 3.5 |
| 2.5 | **validaciones** | `alertas/por-servicio/:id`, `registros/:id/validaciones` | bandeja + KPIs reales | Fase 3.5 |
| — | ▶ **hito B:** alta y validación reales | | e2e `boletas.spec.js` | 2.4-2.5 |
| 2.6 | **metricas** | `metricas/resumen\|servicio/:id\|atipicos` | tabla por establecimiento + serie mensual SVG | Fase 3.3 |
| 2.7 | **alertas** | `alertas/resumen` | contadores críticas/advertencias/resueltas | Fase 1 |
| 2.8 | **auditoria** | `GET /api/historial` | tabla con acciones | Fase 1 |
| 2.9 | **informes** | `informes/registros?establecimiento_id&format=csv\|json` | descarga real | Fase 1 |
| 2.10 | **configuracion** | `GET/PUT /api/configuracion`, `/api/parametros` | CRUD | Fase 1 |
| 2.11 | **ocr-boletas** | `ocr/procesos`, `ocr/campos`, `ocr/plantillas` | preview + confirmar | Fase 3.6 |
| 2.12 | **globales** | — | "Escanear OCR"/"+ Nueva Boleta" → `location.hash`; `btn-backup` → `POST /api/respaldo` | Fase 3.4 |

---

## Fase 3 — Huecos del backend (paralelizable con Fase 2)

| # | Endpoint nuevo | Motivo | Archivo |
|---|---|---|---|
| 3.1 | `/api/registros` + `establecimiento_id`, `fecha_inicio`, `fecha_fin` | filtros simultáneos §7 | `registros.routes.js` + repo |
| 3.2 | `GET /api/alertas` (lista, no solo resumen) | spec §8 | `alertas.routes.js` |
| 3.3 | `GET /api/metricas/serie-mensual` | gráfico evolución panel | `metricas.service.js` + routes |
| 3.4 | `POST /api/respaldo` (copia de `consumos.sqlite`) | botón real, spec §8 | ruta nueva |
| 3.5 | `PUT /api/validaciones/:id` (pendiente→revisada) | bandeja accionable | ruta nueva |
| 3.6 | `PUT /api/ocr/campos/:id` + `POST /api/ocr/procesos/:id/confirmar` | spec §7.1/§8 | `ocr.routes.js` |
| 3.7 | `POST /api/informes/excel\|pdf` **o** documentar desviación CSV | spec §8 | `informes.routes.js` |

**Decisión congelada:** no se cambia el contrato de error `{error:"texto"}` a `{error:{codigo,mensaje}}` → rompería 24 tests. Se registra desviación en `docs/API.md`.

---

## Fase 4 — Caza del hardcode

*Al final, para no pelear con el marcado durante la conexión.*

- Textos mentirosos: "modo demo", "Respaldo generado (modo demo)", "Registro guardado en base local" → respuestas reales.
- Sidebar: `3 pend.`, `2 act.`, `14.2 MB`, `18 establecimientos`, `18 Colegios`, `Bloques 0001 → 4892 OK` → API / `PRAGMA page_count*page_size`.
- Selects del header con opciones fijas → poblados.
- Filas de ejemplo (`Colegio Politécnico`, `#98213`, `$4.280.500`) y `value="08492041"` → vacíos/render.

---

## Fase 5 — Pruebas y cobertura (transversal, no al final)

| Momento | Qué |
|---|---|
| Tras 0 | `npm test` + `npm run test:e2e` (base) |
| Tras 2.3 (hito A) | `dashboard.spec.js`, `crud-establecimientos.spec.js` |
| Tras 2.5 (hito B) | `boletas.spec.js` (POST → lista validaciones) |
| Tras Fase 3 | unit/integración: `registros.filtros`, `alertas.lista`, `metricas.serie`, `respaldo` |
| Tras Fase 4 | `informes.spec.js` (descarga CSV) + reporte de cobertura ≥80% |

---

## Ruta resumida

```
F0 escombros → F1 api.js+ids → [2.1-2.3] ─▶ HITO A ─▶ F3.1,3.4,3.5
                                    │                      │
                                    └────▶ F3.2,3.3 ───────┤
                                                            ▼
                            [2.4-2.5] ─▶ HITO B ─▶ [2.6-2.12] ─▶ F4 hardcode ─▶ F5 cobertura ≥80%
```

**Riesgos:** mockup con pocos ids propios (edición quirúrgica, ~20 sitios); `establecimientos` sin campo `comuna` (usar `codigo`/`direccion`/`matrícula`, no inventar); e2e requieren puerto `:3000`; `playwright.config.js` ya lo levanta solo.

**Espera:** F0+F1 son mecánicas; el riesgo real está en 2.1 (filtros que afectan todo simultáneamente) y 2.4 (validación en vivo).
