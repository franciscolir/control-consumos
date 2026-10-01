# API Control de Consumos

Base: `/api`

## Establecimientos
- `GET /api/establecimientos` → lista
- `POST /api/establecimientos` body: codigo, nombre, direccion, tipo?, matricula?, superficie_m2?, activo?
- `GET /api/establecimientos/:id`
- `PUT /api/establecimientos/:id`
- `DELETE /api/establecimientos/:id`

## Servicios
- `GET /api/servicios`
- `POST /api/servicios` body: establecimiento_id, tipo[agua|electricidad], unidad[m³|kWh], fecha_alta
- `GET /api/servicios/:id`
- `PUT /api/servicios/:id`
- `DELETE /api/servicios/:id`

## Registros
- `GET /api/registros?servicio_id=`
- `POST /api/registros` body: servicio_id, fecha_inicio, fecha_fin, lectura_anterior?, lectura_actual?, consumo_facturado?, monto_total?
- `GET /api/registros/:id`
- `PUT /api/registros/:id`
- `DELETE /api/registros/:id`
- `GET /api/registros/:id/validaciones` → ejecuta validaciones y devuelve array

## Métricas
- `GET /api/metricas/resumen`
- `GET /api/metricas/servicio/:id`
- `GET /api/metricas/atipicos?servicio_id=&umbral=2.5&metodo=zscore|iqr`

## Informes
- `GET /api/informes/registros?establecimiento_id=&format=json|csv`

## Alertas
- `GET /api/alertas/resumen`
- `GET /api/alertas/por-servicio/:id`

## OCR
- `POST /api/ocr/procesos` body: registro_id, archivo_origen, motor?
- `GET /api/ocr/procesos/:id`
- `GET /api/ocr/campos/procesos/:procesoId/campos`
- `POST /api/ocr/campos/procesos/:procesoId/campos` body: campo, valor_extraido?, valor_normalizado?, confianza?, metodo?
- `PUT /api/ocr/campos/campos/:id`
- `GET /api/ocr/plantillas`
- `POST /api/ocr/plantillas` body: nombre, proveedor?, tipo_servicio, patrones_json?, version?, activa?
- `GET /api/ocr/plantillas/:id`
- `PUT /api/ocr/plantillas/:id`
- `DELETE /api/ocr/plantillas/:id`

## Parametros
- `GET /api/parametros?servicio_id=`
- `POST /api/parametros` body: servicio_id, consumo_minimo?, consumo_maximo?, metodo?, vigencia_desde, vigencia_hasta?
- `PUT /api/parametros/:id`
- `DELETE /api/parametros/:id`

## Historial
- `GET /api/historial?entidad=&entidad_id=`
- `POST /api/historial` body: entidad, entidad_id, campo, valor_anterior?, valor_nuevo?

## Configuracion
- `GET /api/configuracion`
- `GET /api/configuracion/:clave`
- `PUT /api/configuracion/:clave` body: valor
- `DELETE /api/configuracion/:clave`

## Detalle Boleta
- `GET /api/detalle-boleta/:registroId`
- `POST /api/detalle-boleta` body: registro_id, cargo_fijo?, consumo_facturado_monto?, otros_cargos?, impuestos?, total?
- `PUT /api/detalle-boleta/:registroId`
- `DELETE /api/detalle-boleta/:registroId`

Códigos de estado estándar: 200, 201, 400, 404, 500.
