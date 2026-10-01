import { db } from "../connection.js";

export const serviciosRepo = {
  findAll() {
    return db.prepare(`
      SELECT s.*, e.codigo AS establecimiento_codigo, e.nombre AS establecimiento
      FROM servicios s
      JOIN establecimientos e ON e.id = s.establecimiento_id
      ORDER BY e.nombre, s.tipo, s.identificador
    `).all();
  },
  findById(id) {
    return db.prepare("SELECT * FROM servicios WHERE id = ?").get(id);
  },
  findByEstablecimiento(establecimiento_id) {
    return db.prepare("SELECT * FROM servicios WHERE establecimiento_id = ?").all(establecimiento_id);
  },
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO servicios (establecimiento_id, tipo, identificador, numero_medidor, unidad, fecha_alta, fecha_baja, activo)
      VALUES (@establecimiento_id, @tipo, @identificador, @numero_medidor, @unidad, @fecha_alta, @fecha_baja, @activo)
    `);
    const payload = {
      establecimiento_id: data.establecimiento_id,
      tipo: data.tipo,
      identificador: data.identificador ?? null,
      numero_medidor: data.numero_medidor ?? null,
      unidad: data.unidad,
      fecha_alta: data.fecha_alta ?? new Date().toISOString().slice(0,10),
      fecha_baja: data.fecha_baja ?? null,
      activo: data.activo ?? 1
    };
    const info = stmt.run(payload);
    return this.findById(info.lastInsertRowid);
  },
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE servicios SET
        establecimiento_id = COALESCE(@establecimiento_id, establecimiento_id),
        tipo = COALESCE(@tipo, tipo),
        identificador = COALESCE(@identificador, identificador),
        numero_medidor = COALESCE(@numero_medidor, numero_medidor),
        unidad = COALESCE(@unidad, unidad),
        fecha_alta = COALESCE(@fecha_alta, fecha_alta),
        fecha_baja = COALESCE(@fecha_baja, fecha_baja),
        activo = COALESCE(@activo, activo)
      WHERE id = ?
    `);
    stmt.run(data, id);
    return this.findById(id);
  },
  delete(id) {
    db.prepare("DELETE FROM servicios WHERE id = ?").run(id);
  }
};
