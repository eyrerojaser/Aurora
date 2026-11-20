// =====================================================================
// MIS HÁBITOS
// - Calendario del mes del ancho de la pantalla
// - "Mis hábitos de hoy": una tarjeta que se abre y muestra los hábitos
// - Cada usuaria elige sus hábitos, crea los suyos y les pone hora de recordatorio
// - Los recordatorios los manda el servidor a su hora, aunque la app esté cerrada
// =====================================================================

// Hábitos sugeridos (la usuaria elige cuáles seguir y puede crear los suyos)
const HABITOS_LISTA = [
    { id: 'agradecer', emoji: '✨', nombre: 'Agradecer a Dios' },
    { id: 'afirmacion', emoji: '💭', nombre: 'Frase de afirmación' },
    { id: 'agua', emoji: '💧', nombre: '8 vasos de agua' },
    { id: 'ejercicio', emoji: '🏃‍♀️', nombre: 'Ejercicio' },
    { id: 'leer', emoji: '📖', nombre: 'Leer 15 minutos' },
    { id: 'diario', emoji: '📝', nombre: 'Escribir en el diario' },
    { id: 'estiramientos', emoji: '🧘‍♀️', nombre: 'Estiramientos' },
    { id: 'desayuno', emoji: '🍳', nombre: 'Desayuno saludable' },
    { id: 'skincare', emoji: '🧖‍♀️', nombre: 'Cuidado de la piel' },
    { id: 'maquillaje', emoji: '💄', nombre: 'Maquillaje' },
    { id: 'caminar', emoji: '🚶‍♀️', nombre: 'Caminar al aire libre' },
    { id: 'meditacion', emoji: '🙏', nombre: 'Meditación' },
    { id: 'musica', emoji: '🎵', nombre: 'Música motivadora' },
    { id: 'desconectar', emoji: '📱', nombre: 'Desconectar 1 hora' },
    { id: 'dormir', emoji: '🌙', nombre: 'Dormir bien' }
];
const HABITOS_INICIALES = ['agradecer', 'afirmacion', 'agua', 'ejercicio', 'leer', 'diario'];
const EMOJIS_HABITO = ['🌸', '💗', '✨', '💧', '🍎', '🥗', '🏃‍♀️', '🧘‍♀️', '📖', '📝', '🙏', '💤', '🌙', '☀️', '🎵', '🎨', '💄', '🧴', '💊', '🐶', '🌿', '📵', '💰', '📚'];
const FRASES_HABITOS = [
    'Hoy eres tu prioridad. Un hábito a la vez.',
    'Cada pasito te acerca a la mejor versión de ti.',
    'Lo que repites cada día, florece.',
    'No es perfección, es constancia con cariño.',
    'Hoy eliges cuidarte con amor.'
];
const MESES_HAB = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let habitosDelMes = {};
let misHabitos = null;           // [{id, emoji, nombre, hora}]
let habFechaSel = habFecha(new Date());
let habListaAbierta = true;
let habEditando = false;

function habFecha(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function habEsc(t) {
    return String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function habZona() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago'; } catch (e) { return 'America/Chicago'; }
}
function habHoraBonita(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    const sufijo = h < 12 ? 'a. m.' : 'p. m.';
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${sufijo}`;
}

// ---------- datos ----------
async function habCargarConfig() {
    if (misHabitos) return;
    let lista = null;
    try {
        const r = await fetch('/api/habitos/config', { credentials: 'include' });
        if (r.ok) lista = (await r.json()).habitos;
    } catch (e) { /* sin conexión */ }
    if (!Array.isArray(lista) || !lista.length) {
        try { lista = JSON.parse(localStorage.getItem('mis_habitos') || 'null'); } catch (e) { lista = null; }
    }
    if (!Array.isArray(lista) || !lista.length) {
        lista = HABITOS_LISTA.filter(h => HABITOS_INICIALES.includes(h.id)).map(h => ({ ...h, hora: '' }));
    }
    misHabitos = lista;
}

async function habGuardarConfig() {
    try { localStorage.setItem('mis_habitos', JSON.stringify(misHabitos)); } catch (e) { /* nada */ }
    try {
        await fetch('/api/habitos/config', {
            method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habitos: misHabitos, zona: habZona() })
        });
    } catch (e) { /* se guarda la próxima vez */ }
}

async function cargarHabitosDelMes() {
    try {
        const res = await fetch(`/api/habitos-calendario?mes=${mesActual + 1}&anio=${anioActual}`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            habitosDelMes = {};
            (data.habitos || []).forEach(h => { habitosDelMes[String(h.fecha).split('T')[0]] = h.habitos_completados || []; });
        }
    } catch (error) { console.error('Error al cargar hábitos:', error); }
    habPintarCalendario();
    habPintarDia();
}

// ---------- pantalla ----------
async function mostrarCalendarioHabitos() {
    const cont = document.getElementById('contenido-habitos-calendario');
    if (!cont) return;
    cont.innerHTML = `
        <div class="hb">
            <div class="hb-cab">
                <h1>Mis hábitos</h1>
                <p>Construye la mejor versión de ti, un día a la vez</p>
            </div>
            <div class="hb-cal">
                <div class="hb-cal-nav">
                    <button type="button" class="hb-flecha" onclick="cambiarMes(-1)" aria-label="Mes anterior">‹</button>
                    <h2 id="hbMes"></h2>
                    <button type="button" class="hb-flecha" onclick="cambiarMes(1)" aria-label="Mes siguiente">›</button>
                </div>
                <div class="hb-semana"><span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span></div>
                <div class="hb-dias" id="calendario-grid"></div>
                <div class="hb-leyenda"><i class="n1"></i>Empezaste <i class="n2"></i>Más de la mitad <i class="n3"></i>¡Todos!</div>
            </div>
            <div id="panel-habitos-dia"></div>
            <div class="hb-recordar" id="hbRecordar"></div>
        </div>`;
    document.getElementById('hbMes').textContent = `${MESES_HAB[mesActual]} ${anioActual}`;
    await habCargarConfig();
    habPintarRecordar();
    habPintarCalendario();
    habPintarDia();
    cargarHabitosDelMes();
}

function habPintarCalendario() {
    const grid = document.getElementById('calendario-grid');
    if (!grid || !misHabitos) return;
    document.getElementById('hbMes').textContent = `${MESES_HAB[mesActual]} ${anioActual}`;
    const inicio = new Date(anioActual, mesActual, 1).getDay();
    const dias = new Date(anioActual, mesActual + 1, 0).getDate();
    const hoy = habFecha(new Date());
    const ids = new Set(misHabitos.map(h => h.id));
    let html = '';
    for (let i = 0; i < inicio; i++) html += '<span class="hb-vacio"></span>';
    for (let d = 1; d <= dias; d++) {
        const f = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hechos = (habitosDelMes[f] || []).filter(id => ids.has(id)).length;
        const pct = misHabitos.length ? hechos / misHabitos.length : 0;
        const nivel = pct >= 1 ? 3 : pct >= 0.5 ? 2 : pct > 0 ? 1 : 0;
        html += `<button type="button" class="hb-dia n${nivel}${f === hoy ? ' hoy' : ''}${f === habFechaSel ? ' sel' : ''}" onclick="habElegirDia('${f}')">${d}${nivel === 3 ? '<i>✿</i>' : ''}</button>`;
    }
    grid.innerHTML = html;
}

function habElegirDia(f) {
    habFechaSel = f;
    habListaAbierta = true;
    habPintarCalendario();
    habPintarDia();
    document.getElementById('panel-habitos-dia')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function habPintarDia() {
    const panel = document.getElementById('panel-habitos-dia');
    if (!panel || !misHabitos) return;
    const hechos = habitosDelMes[habFechaSel] || [];
    const total = misHabitos.length;
    const n = misHabitos.filter(h => hechos.includes(h.id)).length;
    const pct = total ? Math.round(n / total * 100) : 0;
    const esHoy = habFechaSel === habFecha(new Date());
    const [a, m, d] = habFechaSel.split('-').map(Number);
    const titulo = esHoy ? 'Mis hábitos de hoy' : `Mis hábitos del ${d} de ${MESES_HAB[m - 1].toLowerCase()}`;
    const frase = n === total && total ? '¡Lo lograste todo! Eres constancia pura 👑' : FRASES_HABITOS[(d + m) % FRASES_HABITOS.length];

    let lista = '';
    if (habEditando) {
        lista = habHtmlEditar();
    } else {
        lista = misHabitos.map(h => {
            const ok = hechos.includes(h.id);
            return `<div class="hb-fila${ok ? ' hecho' : ''}">
                <button type="button" class="hb-fila-toque" onclick="toggleHabito('${habFechaSel}', '${h.id}')">
                    <span class="hb-emoji">${habEsc(h.emoji)}</span>
                    <span class="hb-nombre">${habEsc(h.nombre)}</span>
                    <span class="hb-check" aria-label="${ok ? 'Hecho' : 'Marcar'}">${ok ? '✓' : ''}</span>
                </button>
                <button type="button" class="hb-hora${h.hora ? ' puesta' : ''}" onclick="habAbrirHora('${h.id}')">${h.hora ? '⏰ ' + habHoraBonita(h.hora) : '+ Recordatorio'}</button>
            </div>`;
        }).join('') || '<p class="hb-vacio-txt">Todavía no tienes hábitos. Toca "Editar" para elegir o crear los tuyos.</p>';
    }

    panel.innerHTML = `
        <div class="hb-tarjeta${habListaAbierta ? ' abierta' : ''}">
            <button type="button" class="hb-tarjeta-cab" onclick="habAbrirCerrar()">
                <span class="hb-anillo" style="--p:${pct}"><b>${n}/${total}</b></span>
                <span class="hb-tarjeta-txt"><b>${titulo}</b><small>${habEsc(frase)}</small></span>
                <i class="hb-chev">⌄</i>
            </button>
            <div class="hb-tarjeta-cuerpo">
                <div class="hb-lista">${lista}</div>
                <div class="hb-acciones">
                    <button type="button" class="hb-editar" onclick="habCambiarEdicion()">${habEditando ? 'Listo' : '✎ Editar mis hábitos'}</button>
                </div>
            </div>
        </div>`;
}

function habAbrirCerrar() {
    habListaAbierta = !habListaAbierta;
    document.querySelector('.hb-tarjeta')?.classList.toggle('abierta', habListaAbierta);
}

// ---------- marcar hábitos ----------
async function toggleHabito(fecha, habitoId) {
    const actuales = habitosDelMes[fecha] || [];
    const completando = !actuales.includes(habitoId);
    const nuevos = completando ? [...actuales, habitoId] : actuales.filter(h => h !== habitoId);
    habitosDelMes[fecha] = nuevos;
    habPintarCalendario();
    habPintarDia();
    if (completando) {
        mostrarAnimacionRecompensa();
        if (misHabitos.every(h => nuevos.includes(h.id))) setTimeout(mostrarAnimacionTodosCompletos, 600);
    }
    try {
        await fetch('/api/habitos-calendario', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ fecha, habitos_completados: nuevos })
        });
    } catch (error) { console.error('Error al guardar hábito:', error); }
}

function cambiarMes(direccion) {
    mesActual += direccion;
    if (mesActual > 11) { mesActual = 0; anioActual++; }
    else if (mesActual < 0) { mesActual = 11; anioActual--; }
    cargarHabitosDelMes();
}

// ---------- editar: elegir sugeridos y crear propios ----------
function habHtmlEditar() {
    const elegidos = new Set(misHabitos.map(h => h.id));
    const propios = misHabitos.filter(h => !HABITOS_LISTA.some(s => s.id === h.id));
    const sugeridos = HABITOS_LISTA.map(s => `
        <button type="button" class="hb-elegir${elegidos.has(s.id) ? ' si' : ''}" onclick="habAlternarSugerido('${s.id}')">
            <span class="hb-emoji">${s.emoji}</span><span class="hb-nombre">${habEsc(s.nombre)}</span><span class="hb-check">${elegidos.has(s.id) ? '✓' : '+'}</span>
        </button>`).join('');
    const mios = propios.map(h => `
        <div class="hb-elegir si"><span class="hb-emoji">${habEsc(h.emoji)}</span><span class="hb-nombre">${habEsc(h.nombre)}</span>
            <button type="button" class="hb-quitar" onclick="habQuitar('${h.id}')" aria-label="Quitar">×</button></div>`).join('');
    return `
        <p class="hb-sub">Crea tu propio hábito</p>
        <div class="hb-nuevo">
            <button type="button" class="hb-nuevo-emoji" id="hbNuevoEmoji" onclick="habMenuEmoji()">🌸</button>
            <input type="text" id="hbNuevoNombre" maxlength="60" placeholder="Ej: Tomar mis vitaminas" />
            <button type="button" class="hb-nuevo-btn" onclick="habCrear()">Agregar</button>
        </div>
        <div class="hb-emojis" id="hbEmojis">${EMOJIS_HABITO.map(e => `<button type="button" onclick="habPonerEmoji('${e}')">${e}</button>`).join('')}</div>
        ${mios ? `<p class="hb-sub">Mis hábitos propios</p>${mios}` : ''}
        <p class="hb-sub">Elige de las sugerencias</p>
        ${sugeridos}`;
}

function habCambiarEdicion() {
    habEditando = !habEditando;
    habListaAbierta = true;
    if (!habEditando) habGuardarConfig();
    habPintarDia();
    habPintarCalendario();
}

function habAlternarSugerido(id) {
    const i = misHabitos.findIndex(h => h.id === id);
    if (i >= 0) misHabitos.splice(i, 1);
    else misHabitos.push({ ...HABITOS_LISTA.find(s => s.id === id), hora: '' });
    habPintarDia();
}

function habMenuEmoji() { document.getElementById('hbEmojis')?.classList.toggle('abierto'); }
function habPonerEmoji(e) {
    const b = document.getElementById('hbNuevoEmoji');
    if (b) b.textContent = e;
    document.getElementById('hbEmojis')?.classList.remove('abierto');
}

function habCrear() {
    const input = document.getElementById('hbNuevoNombre');
    const nombre = (input?.value || '').trim();
    if (!nombre) { input?.focus(); return; }
    misHabitos.push({ id: 'mio-' + Date.now().toString(36), emoji: document.getElementById('hbNuevoEmoji')?.textContent || '🌸', nombre, hora: '' });
    habPintarDia();
}

function habQuitar(id) {
    misHabitos = misHabitos.filter(h => h.id !== id);
    habPintarDia();
}

// ---------- recordatorio con hora ----------
function habAbrirHora(id) {
    const h = misHabitos.find(x => x.id === id);
    if (!h) return;
    document.getElementById('hbModalHora')?.remove();
    const m = document.createElement('div');
    m.id = 'hbModalHora';
    m.className = 'hb-modal';
    m.innerHTML = `
        <div class="hb-modal-caja" role="dialog" aria-label="Recordatorio">
            <span class="hb-modal-emoji">${habEsc(h.emoji)}</span>
            <h3>${habEsc(h.nombre)}</h3>
            <p>¿A qué hora quieres que te lo recuerde cada día?</p>
            <input type="time" id="hbHoraInput" value="${h.hora || '08:00'}" />
            <div class="hb-modal-botones">
                <button type="button" class="hb-modal-ok" onclick="habGuardarHora('${id}')">Guardar</button>
                ${h.hora ? `<button type="button" class="hb-modal-quitar" onclick="habGuardarHora('${id}', true)">Quitar recordatorio</button>` : ''}
                <button type="button" class="hb-modal-cerrar" onclick="document.getElementById('hbModalHora').remove()">Cancelar</button>
            </div>
        </div>`;
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
}

async function habGuardarHora(id, quitar) {
    const h = misHabitos.find(x => x.id === id);
    const valor = document.getElementById('hbHoraInput')?.value || '';
    if (h) h.hora = quitar ? '' : valor;
    document.getElementById('hbModalHora')?.remove();
    habPintarDia();
    await habGuardarConfig();
    // si todavía no aceptó los avisos, se lo pedimos ahora
    if (!quitar && !(await habAvisosActivos())) activarNotificacionesHabitos();
    habPintarRecordar();
}

// ---------- avisos del teléfono ----------
async function habAvisosActivos() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || Notification.permission !== 'granted') return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return !!(reg && await reg.pushManager.getSubscription());
    } catch (e) { return false; }
}

function habEsIphoneSinInstalar() {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const instalada = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    return ios && !instalada;
}

async function habPintarRecordar() {
    const caja = document.getElementById('hbRecordar');
    if (!caja) return;
    const activos = await habAvisosActivos();
    const conHora = (misHabitos || []).filter(h => h.hora).length;
    if (activos) {
        caja.innerHTML = `<p>🔔 Recordatorios activados${conHora ? ` · ${conHora} con hora` : ''}. <button type="button" onclick="probarNotificacionPush()">Probar</button></p>`;
    } else if (habEsIphoneSinInstalar()) {
        caja.innerHTML = '<p>🔔 Para recibir recordatorios en el iPhone, primero agrega Aurora a tu pantalla de inicio (Compartir → Agregar a pantalla de inicio) y ábrela desde ahí.</p>';
    } else {
        caja.innerHTML = '<button type="button" class="hb-activar" onclick="activarNotificacionesHabitos()">🔔 Activar recordatorios</button>';
    }
}

async function registrarServiceWorkerPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    try {
        await navigator.serviceWorker.register('/service-worker.js');
        return await navigator.serviceWorker.ready;
    } catch (error) {
        console.error('Error registrando Service Worker:', error);
        return null;
    }
}

function habAviso(texto) {
    if (typeof mostrarNotificacion === 'function') mostrarNotificacion(texto, 'info');
    else alert(texto);
}

async function suscribirNotificacionesPush() {
    try {
        if (habEsIphoneSinInstalar()) {
            habAviso('En el iPhone, los recordatorios funcionan cuando Aurora está agregada a la pantalla de inicio. Agrégala y ábrela desde ahí.');
            return false;
        }
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
            habAviso('Este navegador no permite recordatorios. Prueba desde la app instalada en tu teléfono.');
            return false;
        }
        const r = await fetch('/api/vapid-public-key');
        const clave = (await r.json()).publicKey;
        if (!clave) {
            habAviso('Los recordatorios todavía no están listos. Vuelve a intentarlo más tarde.');
            return false;
        }
        const permiso = await Notification.requestPermission();
        if (permiso !== 'granted') {
            habAviso('Para recibir recordatorios, permite las notificaciones de Aurora en los ajustes del teléfono.');
            return false;
        }
        const registration = await registrarServiceWorkerPush();
        if (!registration) return false;
        const aBytes = (b64) => {
            const pad = '='.repeat((4 - b64.length % 4) % 4);
            const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
            return Uint8Array.from(raw, c => c.charCodeAt(0));
        };
        let sub = await registration.pushManager.getSubscription();
        if (!sub) sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(clave) });
        const g = await fetch('/api/push/subscribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ subscription: sub.toJSON() })
        });
        if (!g.ok) { habAviso('No se pudieron activar los recordatorios. Intenta de nuevo.'); return false; }
        await habGuardarConfig();   // guarda también tu zona horaria
        return true;
    } catch (error) {
        console.error('Error suscribiendo a push:', error);
        habAviso('No se pudieron activar los recordatorios. Intenta de nuevo.');
        return false;
    }
}

async function probarNotificacionPush() {
    try { await fetch('/api/push/test', { method: 'POST', credentials: 'include' }); } catch (e) { /* nada */ }
}

async function activarNotificacionesHabitos() {
    const ok = await suscribirNotificacionesPush();
    if (ok) {
        habAviso('🔔 ¡Listo! Te avisaré a la hora de tus hábitos.');
        setTimeout(probarNotificacionPush, 1500);
    }
    habPintarRecordar();
}

// compatibilidad con llamadas antiguas
async function mostrarCalendarioHabitosPremium() { mostrarSeccion('habitos-calendario'); }

// ---------- animaciones de celebración ----------
function mostrarAnimacionRecompensa() {
    const frases = [
        '¡Brillante! 💎',
        '¡Hermosa! 🌺',
        '¡Increíble! ✨',
        '¡Radiante! 🌟',
        '¡Preciosa! 🌸',
        '¡Diosa! 👑',
        '¡Imparable! 💫',
        '¡Magnífica! 🦋'
    ];
    
    const frase = frases[Math.floor(Math.random() * frases.length)];
    
    const elementos = ['🌸', '🦋', '🌺', '✨', '💫', '🌼', '🌷'];
    const numElementos = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numElementos; i++) {
        const elemento = elementos[Math.floor(Math.random() * elementos.length)];
        crearElementoFlotante(elemento, i * 100);
    }
    
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
        color: #d81b60;
        padding: 2rem 3rem;
        border-radius: 25px;
        font-size: 2rem;
        font-weight: bold;
        z-index: 10001;
        box-shadow: 0 10px 40px rgba(216, 27, 96, 0.3);
        animation: recompensaPopIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        text-align: center;
        border: 4px solid #d81b60;
    `;
    mensaje.innerHTML = frase;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes recompensaPopIn {
            0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes recompensaFadeOut {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.style.animation = 'recompensaFadeOut 0.4s ease forwards';
        setTimeout(() => mensaje.remove(), 400);
    }, 1500);
}

function crearElementoFlotante(emoji, delay) {
    const elemento = document.createElement('div');
    const startX = Math.random() * window.innerWidth;
    const direccion = Math.random() > 0.5 ? 1 : -1;
    const rotacion = Math.random() * 360;
    
    elemento.style.cssText = `
        position: fixed;
        left: ${startX}px;
        bottom: -50px;
        font-size: ${Math.random() * 30 + 30}px;
        z-index: 10000;
        pointer-events: none;
        animation: flotar${delay} 3s ease-out forwards;
        transform: rotate(${rotacion}deg);
    `;
    elemento.textContent = emoji;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flotar${delay} {
            0% {
                bottom: -50px;
                opacity: 0;
                transform: translateX(0) rotate(${rotacion}deg);
            }
            20% {
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                bottom: ${window.innerHeight + 50}px;
                opacity: 0;
                transform: translateX(${direccion * (Math.random() * 100 + 50)}px) rotate(${rotacion + 360}deg);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(elemento);
    
    setTimeout(() => elemento.remove(), 3000);
}

function mostrarAnimacionTodosCompletos() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
            padding: 3rem;
            border-radius: 30px;
            text-align: center;
            max-width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: celebracionBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 6px solid #f4c542;
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉✨👑✨🎉</div>
            <h2 style="color: #d81b60; font-size: 2.5rem; margin: 0 0 1rem 0;">
                ¡INCREÍBLE!
            </h2>
            <p style="color: #880e4f; font-size: 1.3rem; margin: 0 0 1.5rem 0; line-height: 1.5;">
                Completaste todos tus hábitos hoy<br>
                ¡Eres una diosa imparable! 💫
            </p>
            <div style="font-size: 3rem; margin-bottom: 1rem;">🌸🦋🌺🌼🌷</div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%);
                color: white;
                border: none;
                padding: 1rem 2.5rem;
                border-radius: 15px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(244, 197, 66, 0.4);
            ">
                ✨ ¡Gracias! ✨
            </button>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes celebracionBounce {
            0% { transform: scale(0) rotate(-10deg); }
            50% { transform: scale(1.1) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const elementos = ['🌸', '🦋', '🌺', '✨', '💫', '🌼', '👑', '💎', '⭐'];
            const elemento = elementos[Math.floor(Math.random() * elementos.length)];
            crearElementoFlotante(elemento, i * 50);
        }, i * 100);
    }
    
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }, 5000);
}

