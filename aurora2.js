// =====================================================================
// AURORA 2 · portada con saludo y "¿Cómo está tu día hoy?"
// Se carga después de auth.js y script.js.
// =====================================================================

const A2_ANIMOS = {
    feliz: {
        emoji: '😊', nombre: 'Feliz', hoy: 'Hoy te sientes feliz',
        mensaje: '¡Qué bonito empezar así! Usa esa luz en algo que de verdad te importe hoy.',
        carta: 'Tu luz es DEMASIADO brillante para esconderla'
    },
    tranquila: {
        emoji: '😌', nombre: 'Tranquila', hoy: 'Hoy te sientes tranquila',
        mensaje: 'La calma también es fuerza. Regálate hoy un momento solo para ti.',
        carta: 'Vas a tu ritmo, y tu ritmo está bien'
    },
    cansada: {
        emoji: '😴', nombre: 'Cansada', hoy: 'Hoy te sientes cansada',
        mensaje: 'Descansar no es rendirse. Hoy basta con lo esencial; lo demás puede esperar.',
        carta: 'No tienes que ganarte el derecho a descansar'
    },
    triste: {
        emoji: '😢', nombre: 'Triste', hoy: 'Hoy te sientes triste',
        mensaje: 'Lo que sientes es válido. No tienes que estar bien todo el tiempo.',
        carta: 'Llorar no te quita lo fuerte',
        ayuda: 'Si la tristeza pesa mucho, habla con alguien de tu confianza o con un profesional.'
    },
    ansiosa: {
        emoji: '😰', nombre: 'Ansiosa', hoy: 'Hoy te sientes ansiosa',
        mensaje: 'Respira conmigo: inhala contando 4, sostén 4 y exhala contando 6. Un paso a la vez.',
        carta: 'Puedes tener miedo y hacerlo IGUAL'
    }
};

function a2Hoy() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function a2Escapar(t) {
    return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Las palabras en MAYÚSCULAS se resaltan, como en el libro de Cartas de Poder
// (se escriben en minúscula y en negrita, para que no parezca un error)
function a2Resaltar(frase) {
    let primera = true;
    return a2Escapar(frase).replace(/(^|[\s“"¡¿(])([A-ZÁÉÍÓÚÑÜ]{2,})(?=[\s.,;:!?”")]|$)/g, (m, antes, palabra, pos, todo) => {
        let p = palabra.toLowerCase();
        if (!/[A-Za-zÁÉÍÓÚÑÜáéíóúñü]/.test(todo.slice(0, pos + antes.length))) p = p.charAt(0).toUpperCase() + p.slice(1);
        return `${antes}<strong>${p}</strong>`;
    });
}

function a2NombreUsuaria() {
    try {
        if (typeof obtenerUsuarioActual === 'function' && obtenerUsuarioActual()?.nombre) return obtenerUsuarioActual().nombre;
        const u = JSON.parse(localStorage.getItem('usuario') || 'null');
        if (u && u.nombre) return u.nombre;
    } catch (e) { /* sin nombre guardado */ }
    return '';
}

function actualizarSaludoPortada() {
    const saludo = document.getElementById('a2Saludo');
    const nombre = document.getElementById('a2Nombre');
    const sub = document.getElementById('a2Sub');
    if (!saludo || !nombre) return;
    const h = new Date().getHours();
    const momento = h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
    const quien = a2NombreUsuaria().trim().split(/\s+/)[0];
    if (quien) {
        saludo.textContent = momento + ',';
        nombre.textContent = quien;
        if (sub) sub.textContent = 'Bienvenida a tu espacio';
    } else {
        saludo.textContent = momento;
        nombre.textContent = 'Ella Florece';
        if (sub) sub.textContent = 'Tu guía de empoderamiento';
    }
}

function mostrarRespuestaAnimo(clave) {
    const a = A2_ANIMOS[clave];
    const tarjeta = document.getElementById('a2Checkin');
    if (!a || !tarjeta) return;
    document.getElementById('a2Hoy').textContent = `${a.emoji}  ${a.hoy}`;
    document.getElementById('a2Mensaje').textContent = a.mensaje;
    document.getElementById('a2CartaDia').innerHTML = `<small>TU CARTA DE HOY</small>${a2Resaltar(a.carta)}`;
    const ayuda = document.getElementById('a2Ayuda');
    ayuda.textContent = a.ayuda || '';
    ayuda.style.display = a.ayuda ? 'block' : 'none';
    tarjeta.classList.add('con-respuesta');
}

function elegirAnimo(clave) {
    if (!A2_ANIMOS[clave]) return;
    try { localStorage.setItem('animo_' + a2Hoy(), clave); } catch (e) { /* sin almacenamiento */ }
    mostrarRespuestaAnimo(clave);
}

function cambiarAnimo() {
    try { localStorage.removeItem('animo_' + a2Hoy()); } catch (e) { /* nada */ }
    document.getElementById('a2Checkin')?.classList.remove('con-respuesta');
}

// Abre el diario con el ánimo de hoy ya marcado
function escribirAnimoEnDiario() {
    let clave = null;
    try { clave = localStorage.getItem('animo_' + a2Hoy()); } catch (e) { /* nada */ }
    mostrarSeccion('diario');
    if (clave) {
        setTimeout(() => {
            const btn = document.querySelector(`.diario-mood-btn[data-mood="${clave}"]`);
            if (btn && typeof seleccionarMood === 'function') seleccionarMood(btn);
        }, 150);
    }
}

let a2CieloActual = 0;
function a2CambiarCielo() {
    const cielos = document.querySelectorAll('.a2-cielo');
    const puntos = document.querySelectorAll('.a2-puntos i');
    if (!cielos.length) return;
    cielos[a2CieloActual].classList.remove('activa');
    puntos[a2CieloActual]?.classList.remove('activo');
    a2CieloActual = (a2CieloActual + 1) % cielos.length;
    cielos[a2CieloActual].classList.add('activa');
    puntos[a2CieloActual]?.classList.add('activo');
    const fraseEl = document.getElementById('fraseMotivacional');
    if (fraseEl && typeof frases !== 'undefined' && frases.length) {
        fraseEl.classList.add('oculta');
        setTimeout(() => {
            fraseEl.textContent = frases[Math.floor(Math.random() * frases.length)].replace(/^[^\wÁÉÍÓÚÑ¡¿]+|[^\wÁÉÍÓÚÑ!?.]+$/g, '');
            fraseEl.classList.remove('oculta');
        }, 800);
    }
}

let a2Iniciada = false;
function iniciarPortadaAurora() {
    if (a2Iniciada) return;
    a2Iniciada = true;
    actualizarSaludoPortada();
    let clave = null;
    try { clave = localStorage.getItem('animo_' + a2Hoy()); } catch (e) { /* nada */ }
    if (clave) mostrarRespuestaAnimo(clave);
    const fraseEl = document.getElementById('fraseMotivacional');
    if (fraseEl && typeof frases !== 'undefined' && frases.length) {
        fraseEl.textContent = frases[Math.floor(Math.random() * frases.length)].replace(/^[^\wÁÉÍÓÚÑ¡¿]+|[^\wÁÉÍÓÚÑ!?.]+$/g, '');
    }
    setInterval(a2CambiarCielo, 10000);
}

// Cuando la usuaria entra, el saludo se pone con su nombre
if (typeof mostrarApp === 'function') {
    const _mostrarAppOriginal = mostrarApp;
    mostrarApp = function () {
        _mostrarAppOriginal.apply(this, arguments);
        actualizarSaludoPortada();
        // Al entrar desde la ventana de acceso, comprobar Premium sin tener que recargar
        if (typeof verificarEstadoPremium === 'function') verificarEstadoPremium();
        if (typeof verificarYActivarPremium === 'function') verificarYActivarPremium();
    };
}

document.addEventListener('DOMContentLoaded', iniciarPortadaAurora);
