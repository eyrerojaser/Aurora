// =====================================================================
// AURORA 3 · nueva organización: pantalla "Hoy" y 5 pestañas abajo
// (Hoy · Diario · Crecer · Calma · Yo). Se carga al final, después de aurora2.js.
// No borra ninguna función: solo reordena cómo se llega a cada sección.
// =====================================================================

// A qué pestaña pertenece cada sección (para marcarla abajo y para el botón "volver")
const A3_PADRE = {
    'hoy': 'hoy',
    'diario': 'diario',
    'crecer': 'crecer', 'crecimiento': 'crecer', 'habitos-calendario': 'crecer', 'mi-año': 'crecer',
    'collage': 'crecer', 'cartas-poder': 'crecer', 'empoderamiento': 'crecer', 'autoestima': 'crecer',
    'amor-propio': 'crecer', 'afirmaciones': 'crecer',
    'calma': 'calma', 'inicio': 'calma', 'ai-coach': 'calma',
    'yo': 'yo', 'progreso': 'yo', 'premium': 'yo'
};
const A3_PESTANAS = ['hoy', 'diario', 'crecer', 'calma', 'yo'];
const A3_NOMBRE = { hoy: 'Hoy', diario: 'Diario', crecer: 'Crecer', calma: 'Calma', yo: 'Yo' };

function a3Logueada() {
    try {
        if (typeof obtenerUsuarioActual === 'function' && obtenerUsuarioActual()) return true;
        return !!localStorage.getItem('usuario');
    } catch (e) { return false; }
}

function a3Guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
function a3Leer(clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } }

function a3NumeroDelDia() {
    const d = new Date();
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2024, 0, 1)) / 86400000);
}

// ---------- navegación ----------
const _a3MostrarSeccion = mostrarSeccion;
mostrarSeccion = function (id) {
    // el menú viejo de tarjetas y la portada ya no se usan por dentro: se va a "Hoy"
    if ((id === 'menu' || id === 'dashboard') && a3Logueada()) id = 'hoy';
    _a3MostrarSeccion(id);
    a3DespuesDeMostrar(id);
};

function a3DespuesDeMostrar(id) {
    const dentro = a3Logueada() && id !== 'dashboard' && !!A3_PADRE[id];
    document.body.classList.toggle('a3-dentro', dentro);
    const padre = A3_PADRE[id];
    document.querySelectorAll('.a3-pestanas button').forEach(b => b.classList.toggle('activa', b.dataset.tab === padre));

    // botón "‹ Crecer" arriba de las secciones que están dentro de una pestaña
    const seccion = document.getElementById('seccion-' + id);
    if (seccion && dentro && padre && padre !== id) {
        let volver = seccion.querySelector(':scope > .a3-volver');
        if (!volver) {
            volver = document.createElement('button');
            volver.type = 'button';
            volver.className = 'a3-volver';
            seccion.prepend(volver);
        }
        volver.textContent = '‹ ' + A3_NOMBRE[padre];
        volver.onclick = () => a3Ir(padre);
    }

    if (id === 'hoy') a3PintarHoy();
    if (id === 'crecer' || id === 'yo') a3PintarPremium();
    if (id === 'yo') a3PintarYo();
    window.scrollTo(0, 0);
}

function a3Ir(pestana) {
    mostrarSeccion(pestana);
}

// El botón "Entrar" de la portada y "Volver a inicio" ahora llevan a Hoy
if (typeof mostrarMenu === 'function') {
    const _a3MostrarMenu = mostrarMenu;
    mostrarMenu = function () {
        if (a3Logueada()) return mostrarSeccion('hoy');
        return _a3MostrarMenu.apply(this, arguments);
    };
}
if (typeof volverInicio === 'function') {
    const _a3VolverInicio = volverInicio;
    volverInicio = function () {
        if (a3Logueada()) return mostrarSeccion('hoy');
        return _a3VolverInicio.apply(this, arguments);
    };
}

// Al entrar (con la ventana de acceso o con la sesión guardada) se abre "Hoy"
if (typeof mostrarApp === 'function') {
    const _a3MostrarApp = mostrarApp;
    mostrarApp = function () {
        _a3MostrarApp.apply(this, arguments);
        mostrarSeccion('hoy');
    };
}

// ---------- HOY ----------
function a3Racha() {
    let dias = [];
    try { dias = JSON.parse(a3Leer('a3_dias') || '[]'); } catch (e) { dias = []; }
    const hoy = a2Hoy();
    if (!dias.includes(hoy)) { dias.push(hoy); dias = dias.slice(-400); a3Guardar('a3_dias', JSON.stringify(dias)); }
    const set = new Set(dias);
    let n = 0;
    const d = new Date();
    while (true) {
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!set.has(k)) break;
        n++; d.setDate(d.getDate() - 1);
    }
    return n;
}

function a3CartaDeHoy() {
    let lista = typeof FRASES_PODER_BASICAS !== 'undefined' ? [...FRASES_PODER_BASICAS] : [];
    if (typeof esPremium === 'function' && esPremium() && typeof FRASES_PODER_PREMIUM !== 'undefined') lista = lista.concat(FRASES_PODER_PREMIUM);
    if (!lista.length) return 'Hoy puedes elegirte';
    return lista[(a3NumeroDelDia() * 7) % lista.length];
}

function a3RetoDeHoy() {
    const lista = typeof desafios !== 'undefined' ? desafios : [];
    if (!lista.length) return 'Dedica diez minutos solo para ti';
    const t = lista[(a3NumeroDelDia() * 5) % lista.length];
    return t.replace(/\b([A-ZÁÉÍÓÚÑ]{2,})\b/g, w => w.toLowerCase()).replace(/^hoy, /i, 'Hoy, ');
}

function a3PintarHoy() {
    const nombre = (typeof a2NombreUsuaria === 'function' ? a2NombreUsuaria() : '').split(' ')[0];
    const h = new Date().getHours();
    const saludo = h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
    document.getElementById('a3Saludo').textContent = nombre ? `${saludo}, ${nombre}` : saludo;
    const fecha = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('a3Fecha').textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    const racha = a3Racha();
    document.getElementById('a3RachaNum').textContent = racha;
    document.getElementById('a3RachaTxt').textContent = racha === 1 ? 'día' : 'días seguidos';

    // ánimo de hoy (el mismo que se guarda en la portada)
    const animo = a3Leer('animo_' + a2Hoy());
    a3MarcarAnimo(animo);

    // carta del día
    document.getElementById('a3CartaFrase').innerHTML = a2Resaltar(a3CartaDeHoy());
    document.getElementById('a3Carta').classList.toggle('volteada', a3Leer('a3_carta_' + a2Hoy()) === '1');

    // reto del día
    document.getElementById('a3RetoTexto').textContent = a3RetoDeHoy();
    a3MarcarReto(a3Leer('a3_reto_' + a2Hoy()) === '1');
}

function a3MarcarAnimo(clave) {
    document.querySelectorAll('#a3Animos button').forEach(b => b.classList.toggle('elegido', b.dataset.animo === clave));
    const msg = document.getElementById('a3AnimoMsg');
    const a = clave && typeof A2_ANIMOS !== 'undefined' ? A2_ANIMOS[clave] : null;
    msg.textContent = a ? a.mensaje + (a.ayuda ? ' ' + a.ayuda : '') : '';
    msg.classList.toggle('visible', !!a);
}

function a3ElegirAnimo(clave) {
    if (typeof elegirAnimo === 'function') elegirAnimo(clave);
    else a3Guardar('animo_' + a2Hoy(), clave);
    a3MarcarAnimo(clave);
}

function a3VoltearCarta() {
    const carta = document.getElementById('a3Carta');
    carta.classList.toggle('volteada');
    if (carta.classList.contains('volteada')) a3Guardar('a3_carta_' + a2Hoy(), '1');
}

function a3MarcarReto(hecho) {
    const caja = document.getElementById('a3Reto');
    const btn = document.getElementById('a3RetoBtn');
    caja.classList.toggle('hecho', hecho);
    btn.textContent = hecho ? '✓ Hecho' : 'Lo hice';
}

function a3RetoHecho() {
    if (a3Leer('a3_reto_' + a2Hoy()) === '1') return;
    a3Guardar('a3_reto_' + a2Hoy(), '1');
    // también se suma a "Mis logros de empoderamiento"
    try {
        const lista = JSON.parse(a3Leer('desafiosCompletados') || '[]');
        lista.push({ desafio: a3RetoDeHoy(), fecha: new Date().toLocaleDateString('es-ES') });
        a3Guardar('desafiosCompletados', JSON.stringify(lista));
    } catch (e) { /* nada */ }
    a3MarcarReto(true);
}

// ---------- CRECER y YO ----------
function a3PintarPremium() {
    const premium = typeof esPremium === 'function' && esPremium();
    document.body.classList.toggle('a3-es-premium', premium);
    const titulo = document.getElementById('a3PremiumTitulo');
    const sub = document.getElementById('a3PremiumSub');
    if (titulo) titulo.textContent = premium ? 'Eres Premium ✨' : 'Prueba Premium 7 días gratis';
    if (sub) sub.textContent = premium ? 'Gracias por apoyar a Aurora. Toca para ver tu plan.' : 'Hábitos, tu año 2027, collage y las 40 cartas';
}

function a3PintarYo() {
    let u = null;
    try { u = (typeof obtenerUsuarioActual === 'function' && obtenerUsuarioActual()) || JSON.parse(a3Leer('usuario') || 'null'); } catch (e) { u = null; }
    const nombre = (u && u.nombre) || 'Mi espacio';
    document.getElementById('a3YoNombre').textContent = nombre;
    document.getElementById('a3YoCorreo').textContent = (u && u.email) || '';
    document.getElementById('a3Avatar').textContent = nombre.trim().charAt(0).toUpperCase() || 'A';
}

function a3Compartir() {
    const texto = 'Te recomiendo Aurora, una app para cuidarte y creer más en ti 💗 ' + location.origin;
    if (navigator.share) {
        navigator.share({ title: 'Aurora', text: texto }).catch(() => {});
    } else if (typeof compartirWhatsApp === 'function') {
        compartirWhatsApp();
    } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
    }
}

// Cuando llega la respuesta de Premium del servidor, se actualizan Crecer y Yo al momento
if (typeof actualizarUIPremium === 'function') {
    const _a3ActualizarUIPremium = actualizarUIPremium;
    actualizarUIPremium = function () {
        const r = _a3ActualizarUIPremium.apply(this, arguments);
        a3PintarPremium();
        if (document.getElementById('seccion-hoy')?.classList.contains('activa')) a3PintarHoy();
        return r;
    };
}

// Si ya había sesión guardada, abrir "Hoy" enseguida (sin pasar por la portada)
document.addEventListener('DOMContentLoaded', () => {
    if (a3Logueada()) mostrarSeccion('hoy');
});
