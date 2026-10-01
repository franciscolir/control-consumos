import { validacionesRepo } from "../database/repositories/validaciones.repository.js";
import { registrosRepo } from "../database/repositories/registros.repository.js";
import { db } from "../database/connection.js";

export function validarRegistro(registroId) {
  const registro = registrosRepo.findById(registroId);
  if (!registro) throw new Error("Registro no encontrado");

  validacionesRepo.deleteByRegistro(registroId);
  const validaciones = [];

  const add = (tipo, severidad, descripcion) => {
    validaciones.push(validacionesRepo.create({
      registro_id: registroId,
      tipo,
      severidad,
      descripcion,
      estado: 'pendiente'
    }));
  };

  // V01 Fechas invertidas
  if (registro.fecha_fin < registro.fecha_inicio) {
    add('fecha', 'error', 'fecha_fin es anterior a fecha_inicio');
  }

  // V02 Duración inusual
  const dias = Math.round((new Date(registro.fecha_fin) - new Date(registro.fecha_inicio)) / 86400000);
  if (dias && (dias < 25 || dias > 35)) {
    add('fecha', 'advertencia', `Duración inusual: ${dias} días`);
  }

  // V03 Lectura regresiva
  if (registro.lectura_anterior != null && registro.lectura_actual != null && registro.lectura_actual < registro.lectura_anterior) {
    add('lectura', 'advertencia', 'lectura_actual menor que lectura_anterior');
  }

  // V04 Discrepancia de consumo
  if (registro.lectura_anterior != null && registro.lectura_actual != null && registro.consumo_facturado != null) {
    const calculado = registro.lectura_actual - registro.lectura_anterior;
    const diff = Math.abs(calculado - registro.consumo_facturado);
    if (calculado !== 0 && diff / calculado > 0.05) {
      add('consumo', 'advertencia', 'Discrepancia >5% entre consumo calculado y facturado');
    }
  }

  // V07 Consumo cero
  if (registro.lectura_anterior != null && registro.lectura_actual != null && registro.lectura_actual === registro.lectura_anterior) {
    add('consumo', 'info', 'Consumo cero en el período');
  }

  // V05 Continuidad
  const prev = db.prepare("SELECT lectura_actual FROM registros WHERE servicio_id = ? AND fecha_fin < ? ORDER BY fecha_fin DESC LIMIT 1").get(registro.servicio_id, registro.fecha_fin);
  if (prev && registro.lectura_anterior != null && prev.lectura_actual != null && Math.abs(registro.lectura_anterior - prev.lectura_actual) > 0.01) {
    add('lectura', 'advertencia', 'Lectura anterior no coincide con última lectura actual del servicio');
  }

  // V06 Duplicado
  const dup = db.prepare("SELECT id FROM registros WHERE servicio_id = ? AND folio = ? AND id != ?").get(registro.servicio_id, registro.folio, registro.id);
  if (dup) {
    add('registro', 'error', 'Registro duplicado por folio y servicio');
  }

  // V08 Consumo atípico Z-score simple
  const stats = db.prepare("SELECT AVG(consumo_facturado) as avg, COUNT(*) as n FROM registros WHERE servicio_id = ?").get(registro.servicio_id);
  if (stats && stats.n >= 3 && registro.consumo_facturado != null) {
    const varRows = db.prepare("SELECT consumo_facturado FROM registros WHERE servicio_id = ? AND consumo_facturado IS NOT NULL").all(registro.servicio_id);
    const mean = stats.avg;
    const variance = varRows.reduce((a,b)=>a+Math.pow(b.consumo_facturado-mean,2),0)/varRows.length;
    const std = Math.sqrt(variance);
    if (std > 0) {
      const z = Math.abs((registro.consumo_facturado - mean)/std);
      if (z > 2.5) {
        add('consumo', 'advertencia', `Consumo atípico Z-score=${z.toFixed(2)}`);
      }
    }
  }

  // V09 Montos inconsistentes
  const detalle = db.prepare("SELECT cargo_fijo, consumo_facturado_monto, otros_cargos, impuestos, total FROM detalle_boleta WHERE registro_id = ?").get(registro.id);
  if (detalle && detalle.total != null) {
    const suma = (detalle.cargo_fijo||0)+(detalle.consumo_facturado_monto||0)+(detalle.otros_cargos||0)+(detalle.impuestos||0);
    if (Math.abs(suma - detalle.total) > 0.01) {
      add('monto','advertencia','Total de boleta no coincide con suma de conceptos');
    }
  }

  // V10 Período superpuesto
  const overlap = db.prepare("SELECT id FROM registros WHERE servicio_id = ? AND id != ? AND fecha_inicio <= ? AND fecha_fin >= ?").get(registro.servicio_id, registro.id, registro.fecha_fin, registro.fecha_inicio);
  if (overlap) {
    add('fecha','error','Período superpuesto con otro registro del mismo servicio');
  }

  // V11 Confianza OCR baja
  const ocr = db.prepare("SELECT confianza_global FROM ocr_procesos WHERE registro_id = ? ORDER BY iniciado_en DESC LIMIT 1").get(registro.id);
  if (ocr && ocr.confianza_global != null && ocr.confianza_global < 70) {
    add('ocr','advertencia',`Confianza OCR baja: ${ocr.confianza_global.toFixed(1)}%`);
  }

  // V12 Campo crítico no detectado
  if (ocr) {
    const campos = db.prepare("SELECT COUNT(*) as c FROM ocr_campos WHERE ocr_proceso_id = (SELECT id FROM ocr_procesos WHERE registro_id = ? ORDER BY iniciado_en DESC LIMIT 1) AND (campo IN ('lectura_actual','fecha_inicio','monto_total') AND valor_normalizado IS NULL)").get(registro.id);
    if (campos && campos.c > 0) {
      add('ocr','error','Campo crítico no detectado en OCR');
    }
  }

  // V13 Valor OCR inconsistente
  // Placeholder: se valida contra V01-V10 al confirmar
  // V14 Documento duplicado
  const dupHash = db.prepare("SELECT COUNT(*) as c FROM ocr_procesos WHERE archivo_origen = (SELECT archivo_origen FROM ocr_procesos WHERE registro_id = ? ORDER BY iniciado_en DESC LIMIT 1) AND registro_id != ?").get(registro.id, registro.id);
  if (dupHash && dupHash.c > 0) {
    add('ocr','advertencia','Documento duplicado detectado');
  }

  return validaciones;
}
