/* Limine · landing B: la grilla es el centro; los capítulos cambian lo que hace la grilla. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  // Eventos de uso (Vercel Analytics, sin cookies ni datos personales). Si la analítica no está
  // activa, `va` no existe y no pasa nada. Cada evento se manda una sola vez por visita.
  var yaEnviado = {};
  function evento(nombre, datos) {
    if (yaEnviado[nombre + (datos && datos.cap ? ":" + datos.cap : "")]) return;
    yaEnviado[nombre + (datos && datos.cap ? ":" + datos.cap : "")] = true;
    try { if (window.va) window.va("event", { name: nombre, data: datos || {} }); } catch (e) {}
  }
  var body = document.body, escena = document.getElementById("escena");

  // CTA por mailto desde las constantes del <body>
  (function () {
    var c = body.getAttribute("data-contacto") || "", a = body.getAttribute("data-asunto") || "";
    if (!c || c.charAt(0) === "[") return;
    var href = "mailto:" + c + (a ? "?subject=" + encodeURIComponent(a) : "");
    var ctas = document.querySelectorAll('a[data-cta="mail"]'); for (var i = 0; i < ctas.length; i++) ctas[i].setAttribute("href", href);
    var t = document.querySelectorAll("[data-mail-texto]"); for (var j = 0; j < t.length; j++) t[j].textContent = c;
  })();

  var MODULOS = [
    ["Colecistectomía laparoscópica", 13, "los descartables estándar de laparoscopía"],
    ["Hernioplastia inguinal", 10, "la malla y los descartables estándar"],
    ["Apendicectomía laparoscópica", 11, "los descartables estándar de laparoscopía"],
    ["Artroscopia de rodilla (LCA)", 16, "los anclajes e insumos artroscópicos"],
    ["Artroscopia de menisco", 12, "los insumos artroscópicos estándar"],
    ["Facoemulsificación (catarata)", 8, "el lente intraocular y el viscoelástico"],
    ["Cesárea", 14, "los descartables obstétricos estándar"],
    ["Safenectomía (várices)", 9, "los descartables de flebología"],
    ["Tiroidectomía", 10, "los descartables de cirugía de cabeza y cuello"],
    ["Hemorroidectomía", 8, "los descartables de proctología"],
    ["Resección prostática (RTU)", 12, "los insumos de resección endoscópica"],
    ["Bypass gástrico", 20, "los cartuchos de sutura mecánica y los descartables"]
  ];
  var MEDS = [
    ["Oncológico de alto costo", 1650000], ["Biológico", 890000], ["Antibiótico de alto costo", 320000],
    ["Inmunosupresor", 540000], ["Factor de coagulación", 2100000], ["Anticuerpo monoclonal", 1350000],
    ["Interferón", 460000], ["Hormona de crecimiento", 780000], ["Inmunoglobulina", 1100000]
  ];
  function ars(n) { return "$ " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function pct(x) { return Math.round(x * 100) + "%"; }
  function ejemploIrregular(d) {
    var r = azar(d + 101), m = MODULOS[Math.floor(azar(d + 7) * MODULOS.length)], med = MEDS[Math.floor(azar(d + 11) * MEDS.length)];
    var nombre = m[0], esp = m[1], inc = m[2];
    if (r < 0.20) { // R6 · cantidades sobre la norma
      var x = 2.8 + azar(d + 3) * 1.1, n = Math.round(esp * x);
      return [nombre, n + " descartables facturados; " + esp + " esperados en casos comparables de su cartera (" + x.toFixed(1).replace(".", ",") + " veces la norma).", { mediana: esp, caso: n, sigma: esp * 0.22, unidad: "descartables por cirugía", n: 180 + Math.floor(azar(d + 71) * 220), seed: d }];
    }
    if (r < 0.36) { // R4 · doble cobro del módulo
      return [nombre, "Descartables facturados aparte del módulo, que por convenio ya incluye " + inc + "."];
    }
    if (r < 0.50) { // R3 · precio sobre referencia (medicamento)
      var sob = 1.16 + azar(d + 5) * 0.14;
      return [med[0], "Facturado a " + ars(med[1] * sob) + " cuando el valor de referencia vigente es " + ars(med[1]) + " (" + pct(sob - 1) + " por encima).", { mediana: 1, caso: sob, sigma: 0.05, unidad: "precio sobre la referencia", n: 60 + Math.floor(azar(d + 73) * 140), seed: d, fmt: "x" }];
    }
    if (r < 0.58) { // R3 · precio sobre referencia (descartables)
      return [nombre, "Set de descartables un " + pct(0.16 + azar(d + 9) * 0.16) + " por encima del valor de referencia del convenio."];
    }
    if (r < 0.66) { // R1 · duplicado de módulo
      return [nombre, "El mismo módulo facturado dos veces para el mismo afiliado, con " + (8 + Math.floor(azar(d + 13) * 5)) + " días de diferencia y sin conciliar con un débito."];
    }
    if (r < 0.72) { // R1 · duplicado de insumos
      return [nombre, "Set de descartables re-presentado " + (12 + Math.floor(azar(d + 17) * 11)) + " días después, sin conciliar con un débito previo."];
    }
    if (r < 0.80) { // R5 · tope de sesiones
      return ["Sesión de kinesiología", "Sesión " + (11 + Math.floor(azar(d + 19) * 3)) + " de una serie con tope de 10 por autorización, según Anexo III del convenio."];
    }
    if (r < 0.86) { // R2 · agenda imposible
      var cons = 48 + Math.floor(azar(d + 23) * 10);
      return ["Consulta en consultorio", "El mismo prestador facturó " + cons + " consultas en un solo día hábil.", { mediana: 14, caso: cons, sigma: 4, unidad: "consultas por día, prestadores comparables", n: 90 + Math.floor(azar(d + 77) * 60), seed: d }];
    }
    if (r < 0.91) { // pensión sobre el alta: solo módulos con internación
      var INTERNAN = [0, 1, 2, 3, 6, 8, 10, 11], mi = MODULOS[INTERNAN[Math.floor(azar(d + 37) * INTERNAN.length)]];
      return [mi[0] + " · internación", "Pensión completa facturada el día del alta; el convenio paga medio día."];
    }
    if (r < 0.95) { // ventana
      return [nombre, "Realizada a los " + (62 + Math.floor(azar(d + 29) * 8)) + " días de una orden válida por 60."];
    }
    if (r < 0.98) { // autorización
      return [nombre, "Sin autorización vigente, que el convenio exige para esta práctica."];
    }
    var det = 22 + Math.floor(azar(d + 31) * 12);
    return ["Laboratorio", "Panel de " + det + " determinaciones para un control de rutina; la norma de la cartera es 8.", { mediana: 8, caso: det, sigma: 2.2, unidad: "determinaciones por panel de rutina", n: 300 + Math.floor(azar(d + 79) * 400), seed: d }];
  }
  function ejemploCorrecto(d) {
    var r = azar(d + 41), m = MODULOS[Math.floor(azar(d + 7) * MODULOS.length)], med = MEDS[Math.floor(azar(d + 11) * MEDS.length)];
    if (r < 0.40) return [m[0], "Módulo y " + (m[1] - 1 + Math.floor(azar(d + 43) * 3)) + " descartables, dentro de lo esperado. Correcta."];
    if (r < 0.55) return ["Consulta en consultorio", "Una consulta, dentro de la agenda del día. Correcta."];
    if (r < 0.70) return ["Sesión de kinesiología", "Sesión " + (1 + Math.floor(azar(d + 47) * 9)) + " de 10 autorizadas. Correcta."];
    if (r < 0.82) return [med[0], "Facturado a valor de referencia (" + ars(med[1]) + "). Correcta."];
    if (r < 0.92) return ["Laboratorio", "Panel de rutina de " + (6 + Math.floor(azar(d + 53) * 4)) + " determinaciones. Correcta."];
    return ["Ecografía abdominal", "Práctica autorizada, dentro de plazo. Correcta."];
  }
  function ejemploAuditado(d) {
    var r = azar(d + 61), m = MODULOS[Math.floor(azar(d + 7) * MODULOS.length)], med = MEDS[Math.floor(azar(d + 11) * MEDS.length)];
    var INTERNAN = [0, 1, 2, 3, 6, 8, 10, 11], mi = MODULOS[INTERNAN[Math.floor(azar(d + 67) * INTERNAN.length)]];
    if (r < 0.6) return [mi[0] + " · internación", "Cuenta de alto costo, revisada por auditoría médica. Auditada por su equipo."];
    return [med[0], "Medicación de alto costo, revisada por auditoría médica. Auditada por su equipo."];
  }
  function azar(n) { // hash entero determinístico por índice (sin rayas), para que cada punto diga siempre lo mismo
    var t = (n * 374761393 + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---------- la grilla ----------
  var el = document.getElementById("trama"), lienzo = document.getElementById("lienzo"), cobertura = document.getElementById("cobertura");
  var tip = document.getElementById("tip"), tk = tip.querySelector(".tip__k"), tti = tip.querySelector(".tip__titulo"), tt = tip.querySelector(".tip__t");
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLS, FILAS, muestraCols, puntos = [], auditadas = [], rojas = [], centros = null, actual = null, vecinos = [], movil = false;
  function ancho() { return window.matchMedia("(max-width: 639px)").matches ? "m" : (window.matchMedia("(max-width: 1023px)").matches ? "t" : "d"); }
  var modoAncho = ancho();
  function generar() {
    modoAncho = ancho(); movil = modoAncho === "m";
    COLS = movil ? 20 : (modoAncho === "t" ? 36 : 56); FILAS = movil ? 11 : (modoAncho === "t" ? 14 : 16); muestraCols = movil ? 3 : (modoAncho === "t" ? 4 : 5);
    var viejos = el.querySelectorAll("i"); for (var v = 0; v < viejos.length; v++) el.removeChild(viejos[v]);
    var frag = document.createDocumentFragment();
    for (var d = 0; d < COLS * FILAS; d++) {
      var i = document.createElement("i"); i.setAttribute("aria-hidden", "true");
      var col = d % COLS, r = azar(d), ej;
      if (col < muestraCols) { i.className = "auditada"; ej = ejemploAuditado(d); i.setAttribute("data-k", "Auditada"); }
      else if (r < 0.09) { i.className = "irregular"; ej = ejemploIrregular(d); i.setAttribute("data-k", "Nadie la revisó · fraude o desperdicio"); }
      else { i.className = "correcta"; ej = ejemploCorrecto(d); i.setAttribute("data-k", "Nadie la revisó"); }
      i.setAttribute("data-titulo", ej[0]); i.setAttribute("data-t", ej[1]);
      if (ej[2]) i.setAttribute("data-dist", JSON.stringify(ej[2]));
      frag.appendChild(i);
    }
    el.appendChild(frag);
    puntos = el.querySelectorAll("i"); auditadas = []; rojas = []; centros = null;
    for (var q = 0; q < puntos.length; q++) { if (puntos[q].classList.contains("auditada")) auditadas.push(puntos[q]); else if (puntos[q].classList.contains("irregular")) rojas.push(puntos[q]); }
  }
  el.classList.add("trama--js"); generar();
  if (reducido) el.classList.add("trama--lista");

  function medir() { centros = []; for (var k = 0; k < puntos.length; k++) { var r = puntos[k].getBoundingClientRect(); centros.push([r.left + r.width / 2, r.top + r.height / 2]); } }
  var ALCANCE = 64;
  function relieve(p) {
    for (var v = 0; v < vecinos.length; v++) vecinos[v].style.transform = ""; vecinos = [];
    if (!p || reducido) return;
    if (!centros) medir();
    var idx = Array.prototype.indexOf.call(puntos, p), cx = centros[idx][0], cy = centros[idx][1];
    for (var k = 0; k < puntos.length; k++) {
      if (k === idx) continue;
      var dx = cx - centros[k][0], dy = cy - centros[k][1], d = Math.sqrt(dx * dx + dy * dy);
      if (d < ALCANCE) { var f = 1 - d / ALCANCE; f = f * f * (3 - 2 * f); puntos[k].style.transform = "translate(" + (dx / d * f * 11).toFixed(1) + "px," + (dy / d * f * 11 - f * 1.5).toFixed(1) + "px) scale(" + (1 + f * 1.1).toFixed(2) + ")"; vecinos.push(puntos[k]); }
    }
  }
  // Histograma de la distribución de la cartera (gris), mediana marcada y el caso en rojo.
  var td = document.getElementById("tip-dist");
  function dibujarDist(json) {
    if (!td) return;
    if (!json) { td.hidden = true; td.innerHTML = ""; return; }
    var D = JSON.parse(json), W = 296, H = 72, PAD = 4, B = 28;
    var hi = Math.max(D.caso * 1.12, D.mediana + 4.5 * D.sigma), lo = Math.max(0, D.mediana - 3.2 * D.sigma), paso = (hi - lo) / B;
    var barras = [], max = 0;
    for (var b = 0; b < B; b++) { // campana con cola derecha suave y un poco de ruido determinístico
      var x = lo + (b + 0.5) * paso, z = (x - D.mediana) / D.sigma;
      var v = Math.exp(-0.5 * z * z) + (z > 0 ? 0.06 * Math.exp(-0.35 * z) : 0);
      v *= 0.82 + 0.36 * azar(D.seed * 31 + b);
      barras.push(v); if (v > max) max = v;
    }
    var xs = function (val) { return PAD + (val - lo) / (hi - lo) * (W - 2 * PAD); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + (H + 18) + '" width="' + W + '" height="' + (H + 18) + '" aria-hidden="true">';
    for (var k = 0; k < B; k++) { var h = Math.max(1.5, barras[k] / max * (H - 8)); svg += '<rect x="' + (PAD + k * (W - 2 * PAD) / B + 0.6).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + ((W - 2 * PAD) / B - 1.2).toFixed(1) + '" height="' + h.toFixed(1) + '" class="d-b"/>'; }
    var xm = xs(D.mediana), xc = Math.min(W - PAD, xs(D.caso));
    svg += '<line x1="' + xm.toFixed(1) + '" y1="4" x2="' + xm.toFixed(1) + '" y2="' + H + '" class="d-m"/>';
    svg += '<line x1="' + xc.toFixed(1) + '" y1="4" x2="' + xc.toFixed(1) + '" y2="' + H + '" class="d-cl"/><circle cx="' + xc.toFixed(1) + '" cy="' + H + '" r="4.5" class="d-c"/>';
    var f = function (v) { return D.fmt === "x" ? (v === 1 ? "referencia" : "+" + Math.round((v - 1) * 100) + "%") : Math.round(v); };
    var tm = "mediana " + f(D.mediana), tc = "este caso " + f(D.caso);
    // las etiquetas se anclan hacia afuera de su marca; si igual se pisan, la del caso baja un renglón
    var anchoM = tm.length * 6.2, anchoC = tc.length * 6.2, anclaM = "end", anclaC = "start";
    var xM = xm - 4, xC = xc + 4;
    if (xM - anchoM < 0) { anclaM = "start"; xM = xm + 4; }
    if (xC + anchoC > W) { anclaC = "end"; xC = xc - 4; }
    var mL = anclaM === "end" ? xM - anchoM : xM, mR = anclaM === "end" ? xM : xM + anchoM;
    var cL = anclaC === "end" ? xC - anchoC : xC, cR = anclaC === "end" ? xC : xC + anchoC;
    var yC = (cL < mR && cR > mL) ? H + 26 : H + 14, HT = (yC > H + 14) ? H + 30 : H + 18;
    svg = svg.replace('viewBox="0 0 ' + W + ' ' + (H + 18) + '" width="' + W + '" height="' + (H + 18) + '"', 'viewBox="0 0 ' + W + ' ' + HT + '" width="' + W + '" height="' + HT + '"');
    svg += '<text x="' + xM.toFixed(1) + '" y="' + (H + 14) + '" text-anchor="' + anclaM + '" class="d-tm">' + tm + '</text>';
    svg += '<text x="' + xC.toFixed(1) + '" y="' + yC + '" text-anchor="' + anclaC + '" class="d-tc">' + tc + '</text>';
    svg += '</svg>';
    td.innerHTML = svg + '<span class="d-pie">' + D.n + ' casos comparables de su cartera · ' + D.unidad + '</span>';
    td.hidden = false;
  }
  function mostrar(p, rotulo) {
    if (actual && actual !== p) actual.classList.remove("activa");
    actual = p; p.classList.add("activa"); relieve(p);
    tk.textContent = rotulo || p.getAttribute("data-k"); tti.textContent = p.getAttribute("data-titulo"); tt.textContent = p.getAttribute("data-t");
    tip.classList.toggle("tip--irregular", p.classList.contains("irregular"));
    dibujarDist(p.getAttribute("data-dist"));
    tip.hidden = false;
    if (window.getComputedStyle(tip).position !== "absolute") { tip.style.left = ""; tip.style.top = ""; return; }
    // Se calcula en coordenadas de pantalla (exactas) y se convierte al final al marco del lienzo.
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var rp = p.getBoundingClientRect(), rl = lienzo.getBoundingClientRect(), rt = el.getBoundingClientRect();
    var cx = rp.left + rp.width / 2, cy = rp.top + rp.height / 2;
    var left = Math.max(rt.left, Math.min(cx - 16, rt.right - w));
    // El dedo tapa un círculo de ~30 px de radio: el tooltip se coloca fuera de esa zona, arriba si
    // entra y si no abajo; como último recurso, al tope del lienzo. En web, pegado al punto.
    var dedo = movil ? 30 : 0, sep = movil ? 10 : 14;
    var limSup = rt.top - (movil ? 34 : 6), limInf = rt.bottom + (movil ? 150 : 8);
    var topArriba = cy - dedo - sep - h, topAbajo = cy + dedo + sep;
    var arriba = topArriba >= limSup;
    var top = arriba ? topArriba : (topAbajo + h <= limInf ? topAbajo : limSup);
    tip.classList.toggle("tip--abajo", !arriba);
    tip.style.left = (left - rl.left) + "px"; tip.style.top = (top - rl.top) + "px";
    tip.style.setProperty("--tip-x", Math.max(8, Math.min(w - 16, cx - left - 4)) + "px");
  }
  function ocultar() { if (actual) actual.classList.remove("activa"); actual = null; relieve(null); tip.hidden = true; }
  var RADIO = 12;
  function cercano(x, y) {
    if (!centros) medir();
    var mejor = -1, dmin = RADIO * RADIO;
    for (var k = 0; k < centros.length; k++) { var dx = centros[k][0] - x, dy = centros[k][1] - y, d = dx * dx + dy * dy; if (d < dmin) { dmin = d; mejor = k; } }
    return mejor < 0 ? null : puntos[mejor];
  }

  // ---------- recorrido automático (interrumpible) ----------
  var recorrido = { timer: null, paso: 0, pausaHasta: 0 }, capitulo = null;
  function siguiente() {
    if (Date.now() < recorrido.pausaHasta) { recorrido.timer = window.setTimeout(siguiente, 400); return; }
    var p, rot, n = recorrido.paso % 9;
    var rotRojo = escena.classList.contains("cubierto") ? "Detectada antes del pago" : "Lo que no vieron";
    if (capitulo === "ahorro" || capitulo === "producto") { p = rojas[(recorrido.paso * 11) % rojas.length]; rot = rotRojo; }
    else if (n < 4) { p = auditadas[(recorrido.paso * 7 + n * 5) % auditadas.length]; rot = "Lo que su equipo ve"; }
    else { p = rojas[(recorrido.paso * 11 + n * 3) % rojas.length]; rot = rotRojo; }
    if (p && capitulo !== "auditores" && capitulo !== "implementacion") mostrar(p, rot);
    recorrido.paso++;
    recorrido.timer = window.setTimeout(siguiente, (n === 3 || n === 8 ? 2600 : 1900) * (movil ? 1.3 : 1));
  }
  function pausar() { recorrido.pausaHasta = Date.now() + 5000; }
  // ?t=1 fuerza el modo táctil (para poder verificarlo en un navegador sin pantalla táctil)
  var tactil = window.matchMedia("(hover: none)").matches || /[?&]t=1/.test(location.search);
  if (!tactil) {
    el.addEventListener("mousemove", function (e) { pausar(); var p = cercano(e.clientX, e.clientY); if (p) { evento("explora_grilla"); mostrar(p); } });
    el.addEventListener("click", function (e) { pausar(); var p = cercano(e.clientX, e.clientY); if (p) mostrar(p); });
  } else {
    // En táctil no hay hover: se explora arrastrando el dedo por la grilla (radio amplio, sin scroll dentro del bloque).
    RADIO = 26;
    var tocando = false;
    function alTocar(e) { var t = e.touches[0]; if (!t) return; pausar(); centros = null; var p = cercano(t.clientX, t.clientY); if (p) { evento("explora_grilla"); mostrar(p); } }
    el.addEventListener("touchstart", function (e) { tocando = true; alTocar(e); }, { passive: true });
    el.addEventListener("touchmove", function (e) { if (!tocando) return; e.preventDefault(); var t = e.touches[0]; pausar(); var p = cercano(t.clientX, t.clientY); if (p && p !== actual) mostrar(p); }, { passive: false });
    el.addEventListener("touchend", function () { tocando = false; pausar(); }, { passive: true });
    el.addEventListener("touchcancel", function () { tocando = false; }, { passive: true });
  }
  // Entrada coreografiada: guía el orden de lectura (título → subtítulo → cifras → grilla → franja
  // auditada → barrida de cobertura → capítulos → recorrido). Cualquier interacción la completa al instante.
  var arrancado = false, introLista = false, introTimers = [];
  function arrancarRecorrido() { if (arrancado) return; arrancado = true; if (!reducido) siguiente(); else if (rojas[0]) mostrar(rojas[0], "Detectada antes del pago"); }
  var entra = Array.prototype.slice.call(document.querySelectorAll(".entra"));
  function ver(sel) { var els = typeof sel === "string" ? document.querySelectorAll(sel) : sel; for (var i = 0; i < els.length; i++) els[i].classList.add("visto"); }
  function terminarIntro() {
    if (introLista) return; introLista = true;
    introTimers.forEach(function (t) { window.clearTimeout(t); });
    ver(entra); el.classList.add("trama--lista"); escena.classList.remove("intro");
    // el recorrido arranca sí o sí (aunque un capítulo abierto cancele la barrida de entrada)
    if (!escena.classList.contains("cubierto")) barrer();
    window.setTimeout(arrancarRecorrido, 1600);
  }
  function intro() {
    if (reducido) { terminarIntro(); return; }
    escena.classList.add("intro");
    var t = function (ms, fn) { introTimers.push(window.setTimeout(fn, ms)); };
    t(120,  function () { ver(".h1a"); });
    t(520,  function () { ver(".h1b"); });
    t(960,  function () { ver(".titular__linea"); });
    var cifras = document.querySelectorAll(".cifra");
    t(1320, function () { ver(".cifras"); ver([cifras[0]]); }); t(1520, function () { ver([cifras[1]]); }); t(1720, function () { ver([cifras[2]]); });
    t(2000, function () { ver(".lienzo"); });
    t(2500, function () { el.classList.add("trama--lista"); });
    t(3500, function () { barrer(function () {
      escena.classList.remove("intro");
      var caps = document.querySelectorAll(".cap");
      for (var i = 0; i < caps.length; i++) (function (c, i) { introTimers.push(window.setTimeout(function () { ver([c]); }, i * 120)); })(caps[i], i);
      introTimers.push(window.setTimeout(function () { ver(".pie"); introLista = true; }, 700));
      introTimers.push(window.setTimeout(arrancarRecorrido, 1700)); // un segundo extra: las píldoras terminan de asentarse antes del primer caso
    }); });
  }
  ["mousemove", "pointerdown", "keydown", "touchstart", "wheel"].forEach(function (ev) { window.addEventListener(ev, function () { if (!introLista) terminarIntro(); }, { passive: true, once: true }); });
  intro();

  var tResize = null, ultimo = modoAncho;
  window.addEventListener("resize", function () { centros = null; window.clearTimeout(tResize); tResize = window.setTimeout(function () { if (ancho() !== ultimo) { ultimo = ancho(); ocultar(); generar(); if (capitulo) aplicarModo(); else barrer(); } }, 150); }, { passive: true });
  window.addEventListener("scroll", function () { centros = null; }, { passive: true });

  // ---------- capítulos: cada uno cambia lo que hace la grilla ----------
  var caps = Array.prototype.slice.call(document.querySelectorAll(".cap")), hojas = document.querySelectorAll(".hoja"), panel = document.getElementById("panel");
  var orden = caps.map(function (c) { return c.getAttribute("data-cap"); });
  var barridoTimer = null, barridoCierre = null;
  function quitarCobertura() {
    escena.classList.remove("cubierto");
    for (var k = 0; k < puntos.length; k++) puntos[k].classList.remove("detectada");
    if (barridoTimer) window.cancelAnimationFrame(barridoTimer); barridoTimer = null;
    if (barridoCierre) window.clearTimeout(barridoCierre); barridoCierre = null;
    cobertura.style.transition = "none"; cobertura.style.width = "0%"; cobertura.classList.remove("cobertura--lista"); void cobertura.offsetWidth;
  }
  function barrer(alTerminar) {
    // la cobertura de Limine barre la grilla de izquierda a derecha: cada fraude que pasa queda detectado.
    // El marcado sigue al borde REAL del velo (posición leída en cada frame), así van siempre sincronizados.
    quitarCobertura();
    escena.classList.add("cubierto");
    var dur = reducido ? 0 : 3300;
    centros = null; medir();
    cobertura.style.transition = "none"; cobertura.style.width = "0%";
    void cobertura.offsetWidth; // fuerza el reflow: el ancho 0 queda aplicado antes de animar
    if (dur) { cobertura.style.transition = "width " + dur + "ms cubic-bezier(.4,0,.2,1)"; }
    cobertura.style.width = "calc(100% + " + (movil ? 10 : 16) + "px)"; // compensa el desborde izquierdo: cubre hasta la última columna
    var inicio = Date.now(), cerrado = false;
    function cerrarBarrida() {
      if (cerrado) return; cerrado = true;
      if (barridoTimer) window.cancelAnimationFrame(barridoTimer); barridoTimer = null;
      for (var q = 0; q < puntos.length; q++) puntos[q].classList.add("detectada");
      cobertura.classList.add("cobertura--lista");
      if (alTerminar) window.setTimeout(alTerminar, 500);
    }
    (function paso() {
      if (cerrado) return;
      var borde = cobertura.getBoundingClientRect().right, listo = dur ? (Date.now() - inicio >= dur + 60) : true;
      for (var q = 0; q < puntos.length; q++) if (listo || centros[q][0] <= borde) puntos[q].classList.add("detectada");
      if (!listo) barridoTimer = window.requestAnimationFrame(paso); else cerrarBarrida();
    })();
    // cierre garantizado por temporizador: si los frames se frenan (pestaña en segundo plano), la barrida termina igual
    barridoCierre = window.setTimeout(cerrarBarrida, dur + 120);
  }
  function limpiarModo() {
    var cubierto = escena.classList.contains("cubierto");
    escena.className = "escena" + (capitulo ? " abierto" : "") + (cubierto ? " cubierto" : "");
  }
  function aplicarModo() {
    limpiarModo();
    if (!capitulo) { if (!escena.classList.contains("cubierto")) barrer(); return; }
    escena.classList.add("modo-" + capitulo);
    if (capitulo === "ahorro") { quitarCobertura(); }                       // el problema crudo: sin cobertura, los rojos laten
    if (capitulo === "producto") { barrer(); }                               // vuelve a barrer
    if (capitulo === "limine" || capitulo === "implementacion") { if (!escena.classList.contains("cubierto")) barrer(); }
    if (capitulo === "auditores") { // un caso en la mitad izquierda, lejos del panel
      if (!escena.classList.contains("cubierto")) barrer();
      var cand = null;
      for (var z = 0; z < rojas.length; z++) { var idx2 = Array.prototype.indexOf.call(puntos, rojas[z]); if ((idx2 % COLS) < COLS * 0.45 && Math.floor(idx2 / COLS) >= 3) { cand = rojas[z]; break; } }
      if (cand || rojas[0]) mostrar(cand || rojas[0], "Detectada antes del pago");
    }
    if (capitulo === "implementacion") { ocultar(); evento("llego_al_cierre"); }
  }
  function abrir(id) {
    if (!introLista) terminarIntro();
    evento("capitulo", { cap: id });
    capitulo = id;
    caps.forEach(function (c) { c.classList.toggle("activa", c.getAttribute("data-cap") === id); });
    for (var h = 0; h < hojas.length; h++) hojas[h].classList.toggle("activa", hojas[h].getAttribute("data-cap") === id);
    window.clearTimeout(cierreTimer); panel.hidden = false; panel.classList.remove("cerrando"); escena.classList.add("abierto"); document.body.classList.add("cap-abierto");
    var i = orden.indexOf(id), hoja = document.querySelector('.hoja[data-cap="' + id + '"]');
    document.getElementById("panel-ant").disabled = i <= 0; document.getElementById("panel-sig").disabled = i >= orden.length - 1;
    document.getElementById("panel-num").textContent = ("0" + (i + 1)) + " · " + (hoja ? hoja.getAttribute("data-nombre") : "");
    document.getElementById("panel-pos").textContent = ("0" + (i + 1)) + " / 0" + orden.length;
    document.getElementById("panel-cuerpo").scrollTop = 0;
    aplicarModo();
    recorrido.pausaHasta = 0;
  }
  // Celular: arrastrar el asa hacia abajo pliega el panel a su cabecera (la grilla y su tarjeta quedan a la vista); hacia arriba lo despliega.
  (function () {
    var asa = panel.querySelector(".panel__asa"), cab = panel.querySelector(".panel__cab"), y0 = null, dy = 0;
    function inicio(e) { y0 = e.touches[0].clientY; dy = 0; panel.style.transition = "none"; }
    function mover(e) {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);          // solo hacia abajo
      if (dy > 3) { e.preventDefault(); panel.style.transform = "translateY(" + dy + "px)"; }
    }
    function fin() {
      if (y0 === null) return;
      y0 = null; panel.style.transition = ""; panel.style.transform = "";
      if (dy > 60) cerrar();                                  // deslizar hacia abajo cierra el capítulo
    }
    [asa, cab].forEach(function (z) {
      if (!z) return;
      z.addEventListener("touchstart", inicio, { passive: true });
      z.addEventListener("touchmove", mover, { passive: false });
      z.addEventListener("touchend", fin, { passive: true });
      z.addEventListener("touchcancel", fin, { passive: true });
    });
  })();
  var cierreTimer = null;
  function cerrar() {
    capitulo = null;
    escena.classList.remove("abierto"); document.body.classList.remove("cap-abierto");
    history.replaceState(null, "", location.pathname);
    caps.forEach(function (c) { c.classList.remove("activa"); });
    limpiarModo();
    window.clearTimeout(cierreTimer);
    if (window.matchMedia("(max-width: 639px)").matches && !panel.hidden) {
      panel.classList.add("cerrando");                        // baja y se desvanece antes de ocultarse
      cierreTimer = window.setTimeout(function () { panel.hidden = true; panel.classList.remove("cerrando"); }, 320);
    } else { panel.hidden = true; panel.classList.remove("cerrando"); }
  }
  caps.forEach(function (c) { c.addEventListener("click", function () { var id = c.getAttribute("data-cap"); if (capitulo === id) cerrar(); else abrir(id); }); });

  // Clic en cualquier botón de contacto (el único objetivo de la página)
  (function () {
    var ctas = document.querySelectorAll('a[data-cta="mail"]');
    for (var i = 0; i < ctas.length; i++) ctas[i].addEventListener("click", function () { evento("contacto"); });
  })();

  // Barra de capítulos en celular: fuera del contenedor recortado (iOS no desplaza un fixed dentro de
  // overflow:hidden) y con arrastre propio, para no depender del scroll nativo.
  (function () {
    var barra = document.getElementById("capitulos");
    if (!barra || !window.matchMedia("(max-width: 639px)").matches) return;
    if (barra.parentNode !== document.body) document.body.appendChild(barra);
    var x0 = null, s0 = 0, movido = false, vel = 0, xPrev = 0, tPrev = 0, inercia = null;
    function frenar() { if (inercia) { window.cancelAnimationFrame(inercia); inercia = null; } }
    barra.addEventListener("touchstart", function (e) {
      frenar();
      x0 = xPrev = e.touches[0].clientX; s0 = barra.scrollLeft; tPrev = Date.now(); vel = 0; movido = false;
    }, { passive: true });
    barra.addEventListener("touchmove", function (e) {
      if (x0 === null) return;
      var x = e.touches[0].clientX, dx = x - x0, ahora = Date.now(), dt = ahora - tPrev;
      if (Math.abs(dx) > 4) {
        movido = true; e.preventDefault();
        barra.scrollLeft = s0 - dx;                       // sigue al dedo, sin suavizado
        if (dt > 0) vel = 0.7 * vel + 0.3 * ((xPrev - x) / dt * 16); // px por frame, suavizada
        xPrev = x; tPrev = ahora;
      }
    }, { passive: false });
    barra.addEventListener("touchend", function () {
      x0 = null;
      if (Math.abs(vel) < 0.6) return;
      (function deslizar() {                              // inercia con fricción, como un carrusel nativo
        barra.scrollLeft += vel; vel *= 0.94;
        var tope = barra.scrollWidth - barra.clientWidth;
        if (barra.scrollLeft <= 0 || barra.scrollLeft >= tope || Math.abs(vel) < 0.3) { inercia = null; return; }
        inercia = window.requestAnimationFrame(deslizar);
      })();
    }, { passive: true });
    barra.addEventListener("click", function (e) { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } }, true);
  })();
  document.getElementById("panel-cerrar").addEventListener("click", cerrar);
  document.getElementById("panel-ant").addEventListener("click", function () { var i = orden.indexOf(capitulo); if (i > 0) abrir(orden[i - 1]); });
  document.getElementById("panel-sig").addEventListener("click", function () { var i = orden.indexOf(capitulo); if (i < orden.length - 1) abrir(orden[i + 1]); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowRight") { var i = orden.indexOf(capitulo); abrir(orden[Math.min(orden.length - 1, i + 1)]); }
    if (e.key === "ArrowLeft") { var j = orden.indexOf(capitulo); if (j > 0) abrir(orden[j - 1]); }
  });
  if (window.matchMedia("(hover: none)").matches) { var pista = document.querySelector(".pista"); if (pista) pista.textContent = "Deslizá el dedo por los puntos: cada uno es un caso."; var pp = document.getElementById("pie-pista"); if (pp) pp.textContent = "Tocá un capítulo para recorrerlo"; }
  // capítulo por URL (#motor, #auditores...) para compartir y para verificar estados
  function desdeHash() { var id = (location.hash || "").replace("#", ""); if (orden.indexOf(id) >= 0) { terminarIntro(); abrir(id); } }
  window.addEventListener("hashchange", desdeHash); window.setTimeout(desdeHash, 350);
  caps.forEach(function (c) { c.addEventListener("click", function () { if (capitulo) history.replaceState(null, "", "#" + capitulo); else history.replaceState(null, "", location.pathname); }); });
  // sugerencia de descubrimiento: a los 6 s sin interacción, el primer capítulo se ilumina un instante
  window.setTimeout(function () { if (!capitulo && caps[0]) { caps[0].classList.add("activa"); window.setTimeout(function () { if (!capitulo) caps[0].classList.remove("activa"); }, 900); } }, 6000);
})();
