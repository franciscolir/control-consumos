/* Capa de datos del front: fetch a /api/* + helpers de render.
   Ningún valor de la interfaz debe venir escrito en el HTML. */

export async function api(url, opts = {}) {
  const { body, ...rest } = opts;
  const init = {
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    ...rest
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  let data = null;
  if (res.status !== 204) data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && typeof data.error === "object" && data.error.mensaje) ||
      (data && data.error) ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const nf0 = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 });

export const fmtInt = (n) => (Number.isFinite(Number(n)) ? nf0.format(Number(n)) : "0");
export const fmtNum = (n) => (Number.isFinite(Number(n)) ? nf2.format(Number(n)) : "0");
export const fmtCLP = (n) => (Number.isFinite(Number(n)) ? "$" + nf0.format(Math.round(Number(n))) : "$0");
export const fmtPct = (n, dec = 1) =>
  Number.isFinite(Number(n)) ? nf2.format(Number(n)).replace(/,0+$/, dec === 1 ? ",0" : "") + "%" : "0%";

export function setKpi(sel, value) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (el) el.textContent = value;
  return el;
}

export function setHTML(sel, html) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (el) el.innerHTML = html;
  return el;
}

export function fillSelect(sel, items, opts = {}) {
  const el = typeof sel === "string" ? $(sel) : sel;
  if (!el) return el;
  const {
    value = (x) => x.id,
    label = (x) => x.nombre,
    placeholder = null,
    selected = null
  } = opts;
  const ph = placeholder ? `<option value="">${esc(placeholder)}</option>` : "";
  el.innerHTML =
    ph +
    items
      .map(
        (i) =>
          `<option value="${esc(value(i))}"${
            String(selected) === String(value(i)) ? " selected" : ""
          }>${esc(label(i))}</option>`
      )
      .join("");
  return el;
}

export function renderRows(target, rows, tpl, emptyMsg = "Sin registros") {
  const tb = typeof target === "string" ? document.getElementById(target) : target;
  if (!tb) return null;
  const cols = tb.closest("table")?.querySelectorAll("thead th").length || 99;
  tb.innerHTML = rows.length
    ? rows.map((r, i) => tpl(r, i)).join("")
    : `<tr><td colspan="${cols}" class="px-3 py-8 text-center text-on-surface-variant">${esc(
        emptyMsg
      )}</td></tr>`;
  return tb;
}

export function clearRows(target) {
  const tb = typeof target === "string" ? document.getElementById(target) : target;
  if (tb) tb.innerHTML = "";
  return tb;
}
