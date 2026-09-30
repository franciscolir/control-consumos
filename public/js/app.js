const $=s=>document.querySelector(s);
let establecimientos=[], servicios=[];
async function api(url,options={}){const r=await fetch(url,{headers:{"Content-Type":"application/json"},...options});const data=await r.json();if(!r.ok)throw Error(data.error||"Error de servidor");return data}
function msg(t){$("#message").textContent=t}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function load(){[establecimientos,servicios]=await Promise.all([api("/api/establecimientos"),api("/api/servicios")]);const boletas=await api("/api/boletas");$("#count-est").textContent=establecimientos.length;$("#count-ser").textContent=servicios.length;$("#count-bol").textContent=boletas.length;
$("#rows-est").innerHTML=establecimientos.map(x=>`<tr><td>${esc(x.codigo)}</td><td>${esc(x.nombre)}</td><td>${esc(x.tipo)}</td><td>${esc(x.comuna)}</td></tr>`).join("");
$("#sel-est").innerHTML='<option value="">Establecimiento…</option>'+establecimientos.map(x=>`<option value="${x.id}">${esc(x.codigo)} · ${esc(x.nombre)}</option>`).join("");
$("#rows-ser").innerHTML=servicios.map(x=>`<tr><td>${esc(x.establecimiento)}</td><td>${esc(x.tipo)}</td><td>${esc(x.nombre)}</td><td>${esc(x.numero_cliente)}</td><td>${esc(x.numero_medidor)}</td></tr>`).join("");
$("#sel-ser").innerHTML='<option value="">Servicio…</option>'+servicios.map(x=>`<option value="${x.id}">${esc(x.establecimiento)} · ${esc(x.tipo)} · ${esc(x.nombre)}</option>`).join("");
$("#rows-bol").innerHTML=boletas.map(x=>`<tr><td>${esc(x.establecimiento)}</td><td>${esc(x.servicio)}</td><td>${esc(x.fecha_inicio)} a ${esc(x.fecha_fin)}</td><td>${esc(x.consumo_facturado)}</td><td>${Number(x.monto_total).toLocaleString("es-CL")}</td><td>${esc(x.estado)}</td></tr>`).join("");
$("#status").textContent="Base de datos local conectada";}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
async function submit(form,url){form.addEventListener("submit",async e=>{e.preventDefault();try{await api(url,{method:"POST",body:JSON.stringify(formData(form))});form.reset();msg("Registro guardado correctamente.");await load()}catch(err){msg(err.message)}})}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("hidden",p.id!==b.dataset.tab))}));
await submit($("#form-est"),"/api/establecimientos");await submit($("#form-ser"),"/api/servicios");await submit($("#form-bol"),"/api/boletas");
try{await load()}catch(e){$("#status").textContent="Error de conexión";msg(e.message)}