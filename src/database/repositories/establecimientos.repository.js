import { db } from "../connection.js";

export const establecimientosRepo = {
  findAll() {
    return db.prepare("SELECT * FROM establecimientos ORDER BY nombre").all();
  },
  findById(id) {
    return db.prepare("SELECT * FROM establecimientos WHERE id = ?").get(id);
  },
  findByCodigo(codigo) {
    return db.prepare("SELECT * FROM establecimientos WHERE codigo = ?").get(codigo);
  },
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO establecimientos (codigo, nombre, tipo, direccion, matricula, superficie_m2, activo)
      VALUES (@codigo, @nombre, @tipo, @direccion, @matricula, @superficie_m2, @activo)
    `);
    const payload = {
      codigo: data.codigo,
      nombre: data.nombre,
      tipo: data.tipo ?? null,
      direccion: data.direccion ?? null,
      matricula: data.matricula ?? null,
      superficie_m2: data.superficie_m2 ?? null,
      activo: data.activo ?? 1
    };
    const info = stmt.run(payload);
    return this.findById(info.lastInsertRowid);
  },
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE establecimientos SET
        codigo = COALESCE(@codigo, codigo),
        nombre = COALESCE(@nombre, nombre),
        tipo = COALESCE(@tipo, tipo),
        direccion = COALESCE(@direccion, direccion),
        matricula = COALESCE(@matricula, matricula),
        superficie_m2 = COALESCE(@superficie_m2, superficie_m2),
        activo = COALESCE(@activo, activo)
      WHERE id = ?
    `);
    stmt.run(data, id);
    return this.findById(id);
  },
  delete(id) {
    db.prepare("DELETE FROM establecimientos WHERE id = ?").run(id);
  }
};
