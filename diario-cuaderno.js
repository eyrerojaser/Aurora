// =====================================================================
// DIARIO · cuaderno abierto (se carga después de diario.js)
// - Hojas: 1 escribir · 2 agradezco, notas y decorar · 3, 4… hojas extra para seguir escribiendo
// - En pantalla ancha se ven de dos en dos con argollas en el medio; en el teléfono, una a la vez
// - Fotos y stickers se pegan encima de cualquier hoja: se arrastran y se agrandan o achican
// =====================================================================

let dcMemoria = null;          // páginas completas (con fotos) en memoria
let dcPaginaVista = 0;         // página guardada que se está hojeando en "Mi cuaderno"
let dcDeco = [];               // fotos y stickers de la página que se está escribiendo
let dcHoja = 1;                // hoja que se ve (en pantalla ancha: la de la izquierda)
let dcSeleccion = -1;
const DC_MAX_FOTOS = 3;
const DC_MAX_STICKERS = 12;
const DC_MAX_HOJAS_EXTRA = 6;
const DC_GIROS = [-8, 6, -4, 10, -10, 4, -6, 8];

function dcAncho() { return window.matchMedia('(min-width: 761px)').matches; }

function dcPaginas() {
    if (dcMemoria) return dcMemoria.slice();
    try { return JSON.parse(localStorage.getItem('scrapbook_paginas') || '[]'); } catch (e) { return []; }
}

// Guarda en el teléfono. Si las fotos no caben, las páginas más viejas se guardan sin fotos
// (las fotos siguen en la nube y en memoria).
function dcGuardarLocal(paginas) {
    dcMemoria = paginas.slice();
    const intentar = (lista) => { localStorage.setItem('scrapbook_paginas', JSON.stringify(lista)); };
    try { intentar(paginas); return; } catch (e) { /* no cabe */ }
    const sinFotos = (p) => {
        const n = (p.fotos || []).length + (p.deco || []).filter(d => d.tipo === 'foto').length;
        if (!n) return p;
        return Object.assign({}, p, { fotos: [], deco: (p.deco || []).filter(d => d.tipo !== 'foto'), fotosEnNube: n });
    };
    for (const conFotos of [10, 3, 0]) {
        try { intentar(paginas.map((p, i) => i < conFotos ? p : sinFotos(p))); return; } catch (e) { /* seguir */ }
    }
}

function dcEscapar(t) {
    return String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------------- hojas ----------------
function dcHojas() { return [...document.querySelectorAll('#dcLibro > .dc-hoja')]; }

function dcMostrarHojas() {
    const hojas = dcHojas();
    const total = hojas.length;
    const ancho = dcAncho();
    if (ancho && dcHoja % 2 === 0) dcHoja -= 1;           // en pantalla ancha se empieza en hoja impar
    dcHoja = Math.max(1, Math.min(dcHoja, total));
    hojas.forEach((h, k) => {
        const n = k + 1;
        h.style.zIndex = String(100 - n);
        h.classList.toggle('impar', n % 2 === 1);
        h.classList.toggle('par', n % 2 === 0);
        h.classList.toggle('pasada', !ancho && n < dcHoja);
        h.classList.toggle('visible', ancho ? (n === dcHoja || n === dcHoja + 1) : n === dcHoja);
    });
    const txt = document.getElementById('dcHojaTxt');
    if (txt) txt.textContent = ancho
        ? (dcHoja + 1 <= total ? `Hojas ${dcHoja} y ${dcHoja + 1} de ${total}` : `Hoja ${dcHoja} de ${total}`)
        : `Hoja ${dcHoja} de ${total}`;
    const paso = ancho ? 2 : 1;
    document.getElementById('dcAnterior')?.classList.toggle('apagada', dcHoja <= 1);
    document.getElementById('dcSiguiente')?.classList.toggle('apagada', dcHoja + paso > total);
    const extras = hojas.length - 2;
    document.getElementById('dcOtraHoja')?.classList.toggle('apagada', extras >= DC_MAX_HOJAS_EXTRA);
    requestAnimationFrame(dcAjustarStickers);
}

function dcPasar(dir) {
    dcHoja += dir * (dcAncho() ? 2 : 1);
    dcMostrarHojas();
}

// compatibilidad: otras partes llaman dcVerHoja(1)
function dcVerHoja(n) { dcHoja = n; dcMostrarHojas(); }

function dcCrearHojaExtra(texto) {
    const libro = document.getElementById('dcLibro');
    const n = dcHojas().length + 1;
    const hoja = document.createElement('div');
    hoja.className = 'dc-hoja dc-extra';
    hoja.dataset.n = n;
    hoja.innerHTML = `
        <div class="dc-hoja-cab"><span class="dc-fecha">Sigo escribiendo…</span>
            <button type="button" class="dc-quitar-hoja" onclick="dcQuitarHoja(this)" aria-label="Quitar esta hoja">Quitar hoja</button></div>
        <textarea class="dc-renglones dc-renglones-extra" placeholder="Sigue aquí…"></textarea>
        <div class="dc-capa"></div>
        <span class="dc-num">${n}</span>`;
    hoja.querySelector('textarea').value = texto || '';
    hoja.querySelector('textarea').style.fontFamily = document.getElementById('diario-texto-entrada')?.style.fontFamily || '';
    libro.appendChild(hoja);
    return n;
}

function dcOtraHoja() {
    if (dcHojas().length - 2 >= DC_MAX_HOJAS_EXTRA) return;
    const n = dcCrearHojaExtra('');
    dcHoja = n;
    dcMostrarHojas();
    dcPintarDeco();
    setTimeout(() => dcHojas()[n - 1]?.querySelector('textarea')?.focus(), 450);
}

function dcQuitarHoja(btn) {
    const hoja = btn.closest('.dc-hoja');
    const n = Number(hoja.dataset.n);
    const txt = hoja.querySelector('textarea').value.trim();
    if (txt && !confirm('Esta hoja tiene texto. ¿La quitas de todas formas?')) return;
    hoja.remove();
    // renumerar hojas y mover las decoraciones
    dcDeco = dcDeco.filter(d => d.hoja !== n).map(d => (d.hoja > n ? Object.assign(d, { hoja: d.hoja - 1 }) : d));
    dcHojas().forEach((h, k) => { h.dataset.n = k + 1; const num = h.querySelector('.dc-num'); if (num) num.textContent = k + 1; });
    dcHoja = Math.min(dcHoja, dcHojas().length);
    dcMostrarHojas();
    dcPintarDeco();
}

function dcTextosExtra() {
    return dcHojas().slice(2).map(h => h.querySelector('textarea').value);
}

// ---------------- fotos y stickers que se mueven ----------------
// cada uno: { tipo: 'foto'|'sticker', src, hoja, x, y, w, giro }  (x, y, w en % de la hoja)
function dcHojaParaNuevo() {
    const total = dcHojas().length;
    if (dcAncho()) return Math.min(dcHoja + 1, total);   // la hoja derecha que se ve
    return dcHoja;
}

function dcAgregarFoto(event) {
    const archivo = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!archivo) return;
    if (dcDeco.filter(d => d.tipo === 'foto').length >= DC_MAX_FOTOS) {
        alert(`Puedes poner hasta ${DC_MAX_FOTOS} fotos por página.`);
        return;
    }
    dcReducirFoto(archivo, (dataUrl) => {
        const n = dcDeco.filter(d => d.tipo === 'foto').length;
        dcDeco.push({ tipo: 'foto', src: dataUrl, hoja: dcHojaParaNuevo(), x: 8 + n * 16, y: 64 + n * 4, w: 40, giro: DC_GIROS[n % 8] / 2 });
        dcSeleccion = dcDeco.length - 1;
        dcPintarDeco();
    });
}

// Fotos más pequeñas que en el collage: caben varias por página y suben rápido
function dcReducirFoto(archivo, listo) {
    const lector = new FileReader();
    lector.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const escala = Math.min(1, 760 / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.width * escala));
            c.height = Math.max(1, Math.round(img.height * escala));
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            listo(c.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = () => alert('No se pudo leer esa foto. Prueba con otra.');
        img.src = e.target.result;
    };
    lector.readAsDataURL(archivo);
}

function dcPonerSticker(emoji) {
    if (dcDeco.filter(d => d.tipo === 'sticker').length >= DC_MAX_STICKERS) {
        alert(`Puedes poner hasta ${DC_MAX_STICKERS} stickers por página.`);
        return;
    }
    const n = dcDeco.length;
    dcDeco.push({ tipo: 'sticker', src: emoji, hoja: dcHojaParaNuevo(), x: 58 + (n * 13) % 30, y: 64 + (n * 9) % 24, w: 13, giro: DC_GIROS[n % 8] });
    dcSeleccion = dcDeco.length - 1;
    dcPintarDeco();
}

function dcHtmlItem(d, i, editable) {
    const dentro = d.tipo === 'foto'
        ? `<figure class="dc-polaroid"><img src="${d.src}" alt="Foto" draggable="false"></figure>`
        : `<span class="dc-st">${dcEscapar(d.src)}</span>`;
    const controles = editable ? `<button type="button" class="dc-x" data-accion="quitar" aria-label="Quitar">×</button><span class="dc-tam" data-accion="tamano" aria-label="Cambiar tamaño"></span>` : '';
    return `<div class="dc-item dc-item-${d.tipo}${editable && i === dcSeleccion ? ' sel' : ''}" data-i="${i}" style="left:${d.x}%;top:${d.y}%;width:${d.w}%;--giro:${d.giro || 0}deg">${dentro}${controles}</div>`;
}

function dcPintarDeco() {
    const hojas = dcHojas();
    hojas.forEach(h => { const c = h.querySelector('.dc-capa'); if (c) c.innerHTML = ''; });
    dcDeco.forEach((d, i) => {
        const h = hojas[d.hoja - 1] || hojas[hojas.length - 1];
        h?.querySelector('.dc-capa')?.insertAdjacentHTML('beforeend', dcHtmlItem(d, i, true));
    });
    dcAjustarStickers();
}

// el tamaño de un sticker sigue a su ancho
function dcAjustarStickers(raiz) {
    (raiz && raiz.querySelectorAll ? raiz : document).querySelectorAll('.dc-item-sticker').forEach(el => {
        const w = el.getBoundingClientRect().width;
        if (w) el.querySelector('.dc-st').style.fontSize = (w * 0.82) + 'px';
    });
}

function dcActivarArrastre() {
    const libro = document.getElementById('dcLibro');
    if (!libro) return;
    let acc = null;
    libro.addEventListener('pointerdown', e => {
        const item = e.target.closest('.dc-item');
        if (!item) return;
        const i = Number(item.dataset.i);
        const d = dcDeco[i];
        if (!d) return;
        if (e.target.dataset.accion === 'quitar') {
            dcDeco.splice(i, 1); dcSeleccion = -1; dcPintarDeco(); e.preventDefault(); return;
        }
        e.preventDefault();
        if (dcSeleccion !== i) {
            dcSeleccion = i;
            document.querySelectorAll('#dcLibro .dc-item.sel').forEach(x => x.classList.remove('sel'));
            item.classList.add('sel');
        }
        const capa = item.parentElement.getBoundingClientRect();
        acc = { item, d, capa, modo: e.target.dataset.accion === 'tamano' ? 'tamano' : 'mover', x0: e.clientX, y0: e.clientY, dx: d.x, dy: d.y, dw: d.w, id: e.pointerId };
        item.setPointerCapture(e.pointerId);
    });
    libro.addEventListener('pointermove', e => {
        if (!acc || e.pointerId !== acc.id) return;
        const px = (e.clientX - acc.x0) / acc.capa.width * 100;
        const py = (e.clientY - acc.y0) / acc.capa.height * 100;
        if (acc.modo === 'mover') {
            acc.d.x = Math.max(-10, Math.min(100 - acc.d.w / 2, acc.dx + px));
            acc.d.y = Math.max(-5, Math.min(95, acc.dy + py));
            acc.item.style.left = acc.d.x + '%';
            acc.item.style.top = acc.d.y + '%';
        } else {
            const min = acc.d.tipo === 'foto' ? 18 : 6, max = acc.d.tipo === 'foto' ? 95 : 45;
            acc.d.w = Math.max(min, Math.min(max, acc.dw + px));
            acc.item.style.width = acc.d.w + '%';
            if (acc.d.tipo === 'sticker') dcAjustarStickers(acc.item.parentElement);
        }
    });
    const soltar = e => { if (acc && e.pointerId === acc.id) acc = null; };
    libro.addEventListener('pointerup', soltar);
    libro.addEventListener('pointercancel', soltar);
    // tocar fuera deselecciona
    document.addEventListener('pointerdown', e => {
        if (dcSeleccion >= 0 && !e.target.closest('.dc-item') && !e.target.closest('.dc-bandeja')) {
            dcSeleccion = -1;
            document.querySelectorAll('#dcLibro .dc-item.sel').forEach(x => x.classList.remove('sel'));
        }
    });
}

function dcActivarDeslizar(el, izquierda, derecha) {
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', e => {
        if (e.target.closest('.dc-item, .dc-bandeja, .dc-letra-menu')) { x0 = null; return; }
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', e => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? izquierda : derecha)();
    }, { passive: true });
}

// ---------------- guardar ----------------
async function guardarPaginaScrapbook(event) {
    if (event && event.preventDefault) event.preventDefault();
    const texto = document.getElementById('diario-texto-entrada').value;
    const notas = document.getElementById('diario-notas')?.value || '';
    const mensajeDiv = document.getElementById('mensaje-diario');
    const gratitudes = [1, 2, 3].map(n => document.getElementById('diario-gratitud-' + n)?.value || '').filter(g => g.trim());
    let extras = dcTextosExtra();
    while (extras.length && !extras[extras.length - 1].trim()) extras.pop();

    if (!texto.trim() && !notas.trim() && !gratitudes.length && !dcDeco.length && !extras.some(t => t.trim())) {
        mensajeDiv.className = 'mensaje-diario aviso';
        mensajeDiv.textContent = '✍️ Escribe algo o agrega una foto antes de guardar';
        setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 3000);
        return;
    }

    const moodSeleccionado = document.querySelector('.diario-mood-btn.active');
    const totalHojas = Math.max(2, 2 + extras.length);
    const pagina = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        texto: texto,
        hojasExtra: extras,
        notas: notas,
        mood: moodSeleccionado ? moodSeleccionado.dataset.mood : '',
        moodEmoji: '',
        gratitudes: gratitudes,
        deco: dcDeco.map(d => Object.assign({}, d, { hoja: Math.min(d.hoja, totalHojas) })),
        fuente: localStorage.getItem('diarioFuenteSeleccionada') || "'Lora', Georgia, serif",
        elementos: [],
        fondo: ''
    };

    const paginas = dcPaginas();
    paginas.unshift(pagina);
    dcGuardarLocal(paginas);
    const subida = subirPaginaDiario(pagina);

    mensajeDiv.className = 'mensaje-diario exito';
    mensajeDiv.textContent = '📔 Tu página quedó guardada en tu cuaderno ✨';

    // hoja en blanco para la próxima vez
    document.getElementById('diario-texto-entrada').value = '';
    if (document.getElementById('diario-notas')) document.getElementById('diario-notas').value = '';
    [1, 2, 3].forEach(n => { const el = document.getElementById('diario-gratitud-' + n); if (el) el.value = ''; });
    document.querySelectorAll('.diario-mood-btn').forEach(b => b.classList.remove('active'));
    dcHojas().slice(2).forEach(h => h.remove());
    dcDeco = []; dcSeleccion = -1;
    dcPintarDeco();
    dcVerHoja(1);
    document.querySelector('.dc-bloque-deco')?.classList.remove('abierta');

    dcPaginaVista = 0;
    cargarPaginasAnteriores();
    setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 3500);

    if (!(await subida) && pagina.deco.some(d => d.tipo === 'foto')) {
        mensajeDiv.className = 'mensaje-diario aviso';
        mensajeDiv.textContent = 'La página se guardó en este teléfono. Se subirá a la nube cuando haya conexión.';
        setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 4000);
    }
}

// ---------------- Mi cuaderno: hojear lo guardado ----------------
// Las páginas de antes (fotos y stickers en fila) se muestran también, colocados en la hoja 2
function dcDecoDePagina(p) {
    if (Array.isArray(p.deco)) return p.deco;
    const deco = [];
    (p.stickers || []).forEach((s, k) => deco.push({ tipo: 'sticker', src: s, hoja: 2, x: 4 + (k % 6) * 15, y: 2, w: 12, giro: DC_GIROS[k % 8] }));
    (p.fotos || []).forEach((f, k) => deco.push({ tipo: 'foto', src: f, hoja: 2, x: 6 + k * 46, y: 58, w: 40, giro: k % 2 ? 3 : -3 }));
    return deco;
}

function cargarPaginasAnteriores() {
    const listaDiv = document.getElementById('lista-entradas-diario');
    if (!listaDiv) return;
    const paginas = dcPaginas();

    if (paginas.length === 0) {
        listaDiv.innerHTML = '<p class="dc-vacio">Aquí se irán guardando tus páginas, como en un cuaderno. Escribe la primera hoy.</p>';
        return;
    }
    if (dcPaginaVista >= paginas.length) dcPaginaVista = paginas.length - 1;
    const i = dcPaginaVista;
    const p = paginas[i];
    const fecha = new Date(p.fecha);
    const fechaTxt = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const horaTxt = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const letra = dcEscapar(p.fuente || "'Lora', Georgia, serif");
    const deco = dcDecoDePagina(p);

    const grat = (p.gratitudes || []).length ? `<p class="dc-etq">🌸 Agradecí</p><ol class="dc-lista-grat">${p.gratitudes.map(g => `<li>${dcEscapar(g)}</li>`).join('')}</ol>` : '';
    const notas = p.notas ? `<p class="dc-etq">📝 Notas</p><div class="dc-nota dc-nota-leer">${dcEscapar(p.notas)}</div>` : '';
    const fotosNube = p.fotosEnNube ? `<p class="dc-suave">📷 ${p.fotosEnNube} foto(s) guardada(s) en la nube</p>` : '';

    const hojas = [
        `<div class="dc-hoja-cab"><span class="dc-fecha">${fechaTxt} · ${horaTxt}</span>${p.mood ? `<span class="dc-mood-leer dc-mood-${dcEscapar(p.mood)}">${dcEscapar(p.mood.charAt(0).toUpperCase() + p.mood.slice(1))}</span>` : ''}</div>
         <div class="dc-texto-leer" style="font-family:${letra}">${dcEscapar(p.texto) || '<span class="dc-suave">Sin texto este día</span>'}</div>`,
        grat + notas + fotosNube
    ];
    (p.hojasExtra || []).forEach(t => hojas.push(`<div class="dc-hoja-cab"><span class="dc-fecha">Sigo escribiendo…</span></div><div class="dc-texto-leer" style="font-family:${letra}">${dcEscapar(t)}</div>`));
    // solo se muestran las hojas que tienen algo (texto o fotos/stickers)
    const visibles = hojas.map((contenido, k) => ({ contenido, n: k + 1, items: deco.filter(d => (d.hoja || 2) === k + 1) }))
        .filter(h => h.n === 1 || h.items.length || h.contenido.replace(/<[^>]*>/g, '').trim());
    const filas = Math.ceil(visibles.length / 2);
    const html = visibles.map((h, k) => {
        const pos = k + 1;
        const items = h.items.map((d, j) => dcHtmlItem(d, j, false)).join('');
        return `<div class="dc-hoja ${pos % 2 ? 'impar' : 'par'}${h.items.length ? ' con-deco' : ''}" style="grid-column:${pos % 2 ? 1 : 3};grid-row:${Math.ceil(pos / 2)}">${h.contenido}<div class="dc-capa">${items}</div><span class="dc-num">${h.n}</span></div>`;
    }).join('');
    const unaSola = visibles.length === 1;

    listaDiv.innerHTML = `
        <div class="dc-libro dc-libro-leer${unaSola ? ' dc-una-hoja' : ''}">${unaSola ? '' : `<div class="dc-lomo" aria-hidden="true" style="grid-row:1 / ${filas + 1}"></div>`}${html}</div>
        <div class="dc-hojear">
            <button type="button" class="dc-flecha${i >= paginas.length - 1 ? ' apagada' : ''}" onclick="dcIrAPagina(${i + 1})" aria-label="Página más vieja">‹</button>
            <span>Página ${paginas.length - i} de ${paginas.length}</span>
            <button type="button" class="dc-flecha${i === 0 ? ' apagada' : ''}" onclick="dcIrAPagina(${i - 1})" aria-label="Página más nueva">›</button>
        </div>
        <button type="button" class="dc-borrar" onclick="eliminarPaginaDiario(${i})">Borrar esta página</button>`;
    requestAnimationFrame(() => dcAjustarStickers(listaDiv));
}

function dcIrAPagina(n) {
    const total = dcPaginas().length;
    if (!total) return;
    dcPaginaVista = Math.max(0, Math.min(total - 1, n));
    cargarPaginasAnteriores();
}

// ---------------- arranque ----------------
document.addEventListener('DOMContentLoaded', () => {
    dcMostrarHojas();
    dcPintarDeco();
    dcActivarArrastre();
    document.addEventListener('click', e => {
        document.querySelectorAll('.dc-letra.abierta, .dc-bloque-deco.abierta').forEach(m => {
            if (!m.contains(e.target)) m.classList.remove('abierta');
        });
    });
    const libro = document.getElementById('dcLibro');
    if (libro) dcActivarDeslizar(libro, () => dcPasar(1), () => dcPasar(-1));
    const lista = document.getElementById('lista-entradas-diario');
    if (lista) dcActivarDeslizar(lista, () => dcIrAPagina(dcPaginaVista + 1), () => dcIrAPagina(dcPaginaVista - 1));
    let t = null;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { dcMostrarHojas(); dcAjustarStickers(); }, 150); });
    window.addEventListener('seccion-changed', e => { if (e.detail === 'diario') setTimeout(() => { dcMostrarHojas(); dcAjustarStickers(); }, 50); });
});
