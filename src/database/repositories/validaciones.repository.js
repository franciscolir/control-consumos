import { db } from "../connection.js";

export const validacionesRepo = {
  findByRegistro(registro_id) {
    return db.prepare("SELECT * FROM validaciones WHERE registro_id = ? ORDER BY severidad").all(registro_id);
  },
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO validaciones (registro_id, tipo, severidad, descripcion, estado)
      VALUES (@registro_id, @tipo, @severidad, @descripcion, @estado)
    `);
    const info = stmt.run(data);
    return db.prepare("SELECT * FROM validaciones WHERE id = ?").get(info.lastInsertRowid);
  },
  deleteByRegistro(registro_id) {
    db.prepare("DELETE FROM validaciones WHERE registro_id = ?").run(registro_id);
  }
};
