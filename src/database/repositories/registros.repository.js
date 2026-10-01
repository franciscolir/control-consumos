import { db } from "../connection.js";

export const registrosRepo = {
  findAll({ servicio_id } = {}) {
    let sql = `
      SELECT r.*, s.tipo AS servicio_tipo, s.identificador AS servicio_identificador,
             e.nombre AS establecimiento_nombre
      FROM registros r
      JOIN servicios s ON s.id = r.servicio_id
      JOIN establecimientos e ON e.id = s.establecimiento_id
    `;
    const params = [];
    if (servicio_id) {
      sql += " WHERE r.servicio_id = ?";
      params.push(servicio_id);
    }
    sql += " ORDER BY r.fecha_inicio DESC";
    return db.prepare(sql).all(...params);
  },
  findById(id) {
    return db.prepare("SELECT * FROM registros WHERE id = ?").get(id);
  },
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO registros (
        servicio_id, fecha_inicio, fecha_fin, lectura_anterior, lectura_actual,
        consumo_calculado, consumo_facturado, tipo_lectura, folio, monto_total,
        observaciones, documento_path
      ) VALUES (
        @servicio_id, @fecha_inicio, @fecha_fin, @lectura_anterior, @lectura_actual,
        @consumo_calculado, @consumo_facturado, @tipo_lectura, @folio, @monto_total,
        @observaciones, @documento_path
      )
    `);
    const payload = {
      servicio_id: data.servicio_id,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      lectura_anterior: data.lectura_anterior ?? null,
      lectura_actual: data.lectura_actual ?? null,
      consumo_calculado: data.consumo_calculado ?? null,
      consumo_facturado: data.consumo_facturado ?? null,
      tipo_lectura: data.tipo_lectura ?? null,
      folio: data.folio ?? null,
      monto_total: data.monto_total ?? null,
      observaciones: data.observaciones ?? null,
      documento_path: data.documento_path ?? null
    };
    const info = stmt.run(payload);
    return this.findById(info.lastInsertRowid);
  },
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE registros SET
        servicio_id = COALESCE(@servicio_id, servicio_id),
        fecha_inicio = COALESCE(@fecha_inicio, fecha_inicio),
        fecha_fin = COALESCE(@fecha_fin, fecha_fin),
        lectura_anterior = COALESCE(@lectura_anterior, lectura_anterior),
        lectura_actual = COALESCE(@lectura_actual, lectura_actual),
        consumo_calculado = COALESCE(@consumo_calculado, consumo_calculado),
        consumo_facturado = COALESCE(@consumo_facturado, consumo_facturado),
        tipo_lectura = COALESCE(@tipo_lectura, tipo_lectura),
        folio = COALESCE(@folio, folio),
        monto_total = COALESCE(@monto_total, monto_total),
        observaciones = COALESCE(@observaciones, observaciones),
        documento_path = COALESCE(@documento_path, documento_path),
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(data, id);
    return this.findById(id);
  },
  delete(id) {
    db.prepare("DELETE FROM registros WHERE id = ?").run(id);
  }
};
