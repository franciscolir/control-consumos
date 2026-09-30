import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDatabase } from "./src/database/connection.js";
import establishmentsRouter from "./src/modules/establecimientos/establecimientos.routes.js";
import servicesRouter from "./src/modules/servicios/servicios.routes.js";
import billsRouter from "./src/modules/boletas/boletas.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
initDatabase();
app.use(express.json({ limit: "2mb" }));
app.use("/api/establecimientos", establishmentsRouter);
app.use("/api/servicios", servicesRouter);
app.use("/api/boletas", billsRouter);
app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (_req, res) => res.json({ ok: true }));
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`Control de consumos: http://localhost:${port}`));