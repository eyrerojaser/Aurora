// Función para verificar contraseña con el servidor
async function activarAdminDesdeBotón() {
    const password = prompt('🔐 Ingresa la contraseña para acceder al Panel Admin:', '');
    
    if (password === null) {
        console.log('❌ Acceso al admin cancelado');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('🔐 Contraseña correcta - Activando modo Admin...');
            activarModoAdmin();
        } else {
            alert('❌ Contraseña incorrecta. Acceso denegado.');
        }
    } catch (error) {
        console.error('Error verificando contraseña:', error);
        alert('Error al verificar contraseña');
    }
}

// Función para activar el modo admin (después de verificar contraseña)
function activarModoAdmin() {
    // Registrar usuario como Admin en localStorage
    localStorage.setItem('usuario', 'Admin');
    
    // Crear usuario completo para backend si no existe
    if (!localStorage.getItem('usuarioId')) {
        const adminUser = {
            id: 'admin-' + Date.now(),
            nombre: 'Admin',
            fecha_registro: new Date().toISOString()
        };
        localStorage.setItem('usuarioId', adminUser.id);
        localStorage.setItem('usuarioData', JSON.stringify(adminUser));
    }
    
    // Ocultar portada
    const portada = document.getElementById('seccion-dashboard');
    if (portada) {
        portada.classList.remove('activa');
    }
    
    // Mostrar menú
    const menu = document.getElementById('seccion-menu');
    if (menu) {
        menu.classList.add('activa');
    }
    
    // Mostrar botón Mis Citas
    const btnMisCitas = document.getElementById('btn-mis-citas');
    if (btnMisCitas) {
        btnMisCitas.classList.add('visible');
    }
    
    // Actualizar header
    const header = document.querySelector('header');
    if (header) {
        header.textContent = 'Admin';
        header.classList.remove('oculto');
    }
    
    // Mostrar botón flotante
    const btnFlotante = document.querySelector('.btn-menu-flotante');
    if (btnFlotante) {
        btnFlotante.classList.remove('oculto');
    }
    
    console.log('✅ Modo Admin activado - Portal listo');
}

// Función para mostrar alerta Premium
function mostrarPremiumAlert() {
    alert('🔒 Los Mensajes de Apoyo son una función Premium 💎\n\n✨ Aurora te comparte palabras de ánimo según cómo te sientes.\n\n¡Próximamente disponible!');
}

// Función para RESET TOTAL (borrar TODO: localStorage + cachés + service worker)
function resetTotal() {
    if (confirm('🔄 RESET TOTAL\n\nEsto borrará:\n✓ Todos tus datos guardados\n✓ Todas las versiones en caché\n✓ Todo el historial\n\n¿Empezar completamente de cero?')) {
        // 1. Borrar localStorage
        localStorage.clear();
        
        // 2. Borrar todos los cachés
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // 3. Desregistrar service workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }
        
        // 4. Recargar limpio después de 500ms
        setTimeout(() => {
            window.location.href = window.location.origin + '/?fresh=' + Date.now();
        }, 500);
    }
}

// Función para cerrar sesión
async function cerrarSesion() {
    if (confirm('¿Segura que quieres cerrar sesión?')) {
        try {
            await fetch('/api/sesion', {
                method: 'DELETE',
                credentials: 'include'
            });
            localStorage.clear();
            location.reload();
        } catch (error) {
            console.error('Error cerrar sesión:', error);
            localStorage.clear();
            location.reload();
        }
    }
}

// Función para actualizar el header con el nombre de la usuaria
function actualizarHeaderPersonalizado() {
    const usuario = obtenerUsuarioActual ? obtenerUsuarioActual() : null;
    const header = document.querySelector('header');
    
    if (usuario && usuario.nombre) {
        header.textContent = usuario.nombre;
    } else {
        const userName = localStorage.getItem('usuario');
        if (userName) {
            try {
                const user = JSON.parse(userName);
                header.textContent = user.nombre || 'Aurora';
            } catch {
                header.textContent = 'Aurora';
            }
        } else {
            header.textContent = 'Aurora';
        }
    }
}

// Función para mostrar el menú de categorías o registro según usuario
function mostrarMenu() {
    // Verificar si hay usuario registrado
    const usuario = obtenerUsuarioActual ? obtenerUsuarioActual() : null;
    const userName = usuario?.nombre || localStorage.getItem('usuario');
    
    // Ocultar header y botón flotante
    document.querySelector('header').classList.add('oculto');
    document.querySelector('.btn-menu-flotante').classList.add('oculto');
    
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.classList.remove('activa'));
    
    if (userName) {
        // Si está registrado, mostrar menú de categorías
        document.getElementById('seccion-menu').classList.add('activa');
    } else {
        // Si NO está registrado, ir directo al formulario de registro
        mostrarSeccion('inicio');
    }
}

// Función para volver a la portada de inicio
function volverInicio() {
    // Ocultar header y botón flotante
    document.querySelector('header').classList.add('oculto');
    document.querySelector('.btn-menu-flotante').classList.add('oculto');
    
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.classList.remove('activa'));
    
    // Mostrar portada principal
    document.getElementById('seccion-dashboard').classList.add('activa');
}

// Verificar acceso Premium para categorías bloqueadas
function verificarAccesoPremium(seccionId) {
    if (typeof esPremium === 'function' && esPremium()) {
        // Mapear IDs especiales a sus secciones reales
        if (seccionId === 'cartas-premium') {
            mostrarSeccion('cartas-poder');
        } else {
            mostrarSeccion(seccionId);
        }
    } else {
        if (typeof mostrarMensajePremium === 'function') {
            mostrarMensajePremium();
        } else {
            mostrarSeccion('premium');
        }
    }
}

// Navegación entre secciones
function mostrarSeccion(seccionId) {
    // Ocultar header y nav en: portada, menú categorías, y registro (inicio sin usuario)
    // Mostrar solo header (sin nav) en secciones de contenido para ahorrar espacio
    const usuario = obtenerUsuarioActual ? obtenerUsuarioActual() : null;
    const userName = usuario?.nombre || localStorage.getItem('usuario');
    const seccionesLimpias = ['dashboard', 'menu'];
    
    // Si es 'inicio' y NO hay usuario, también página limpia (solo registro)
    if (seccionId === 'inicio' && !userName) {
        seccionesLimpias.push('inicio');
    }
    
    const btnMenuFlotante = document.querySelector('.btn-menu-flotante');
    
    if (seccionesLimpias.includes(seccionId)) {
        document.querySelector('header').classList.add('oculto');
        btnMenuFlotante.classList.add('oculto');
    } else {
        // Mostrar solo header y botón flotante
        document.querySelector('header').classList.remove('oculto');
        btnMenuFlotante.classList.remove('oculto');
    }
    
    // Ocultar todas las secciones
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.classList.remove('activa'));
    
    // Desactivar todos los botones de navegación
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la sección seleccionada
    document.getElementById('seccion-' + seccionId).classList.add('activa');
    // Avisar a las secciones que se acaban de abrir (el diario lo usa para sincronizar)
    window.dispatchEvent(new CustomEvent('seccion-changed', { detail: seccionId }));
    const navBtn = document.getElementById('nav-' + seccionId);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // Si estamos en la sección de inicio, mostrar formulario o dashboard según usuario
    if (seccionId === 'inicio') {
        const registroForm = document.getElementById('registro-form-container');
        const dashboardContent = document.getElementById('dashboard-content');
        
        if (userName) {
            // Usuario registrado: mostrar dashboard completo
            registroForm.style.display = 'none';
            dashboardContent.style.display = 'block';
        } else {
            // Usuario NO registrado: mostrar solo formulario limpio
            registroForm.style.display = 'block';
            dashboardContent.style.display = 'none';
        }
    }
    
    // Activar dashboard si es la sección dashboard
    if (seccionId === 'dashboard' && typeof window.activarDashboard === 'function') {
        window.activarDashboard();
    }
    
    // Cargar datos si es la sección progreso
    
    // Cargar collage desde servidor al abrir esa sección
    if (seccionId === 'collage' && typeof cargarCollageDelServidor === 'function') {
        console.log('📂 Cargando collage desde servidor...');
        cargarCollageDelServidor();
        // Verificar stickers premium
        if (typeof verificarStickersPremium === 'function') {
            verificarStickersPremium();
        }
    }
    
    // Cargar vision board desde servidor al abrir esa sección (ID es 'mi-año')
    if (seccionId === 'mi-año' && typeof cargarVisionBoardDelServidor === 'function') {
        console.log('📂 Cargando vision board desde servidor...');
        cargarVisionBoardDelServidor();
    }
    
    // Inicializar calendario de hábitos (Premium)
    if (seccionId === 'habitos-calendario' && typeof mostrarCalendarioHabitos === 'function') {
        console.log('📅 Cargando Calendario de Hábitos...');
        mostrarCalendarioHabitos();
    }
}

// Frases motivadoras para la portada
const frases = [
    "💖 Eres más fuerte de lo que crees y más capaz de lo que imaginas",
    "🌸 Cada día es una nueva oportunidad para florecer",
    "✨ Tu valor no disminuye por la incapacidad de alguien para verlo",
    "🦋 La transformación comienza cuando decides amarte a ti misma",
    "💪 Eres la autora de tu propia historia, escribe un capítulo hermoso",
    "🌟 Brilla con tu propia luz, el mundo necesita tu resplandor",
    "💕 El amor propio es el comienzo de un romance de por vida",
    "🌺 Cultiva tu jardín interior y las flores llegarán",
    "🎯 Tus sueños son válidos y mereces alcanzarlos",
    "🌈 Después de la tormenta siempre llega el arcoíris",
    "👑 Eres una reina, actúa como tal",
    "💝 Tu felicidad es tu responsabilidad y tu poder",
    "🧘‍♀️ La paz interior es tu superpoder",
    "🌻 Crece a tu propio ritmo, la naturaleza no tiene prisa",
    "⭐ Eres suficiente, siempre lo has sido",
    "🪷 Tu belleza interior ilumina el mundo",
    "💫 Hoy elijo amarme y cuidarme",
    "🌙 Confía en el proceso, todo llega en su momento perfecto",
    "🦢 La elegancia está en ser tú misma sin disculpas",
    "🌺 Mereces todo lo hermoso que la vida tiene para ofrecer"
];

// Imágenes de fondo para la portada - Mujeres empoderadas, flores y paisajes
const imagenesPortada = [
    '/static/images/portada/Mujer_empoderada_en_la_cima_99a42131.png',
    '/static/images/portada/Campo_de_girasoles_dorado_1c346ca9.png',
    '/static/images/portada/Mujer_practicando_yoga_natural_36aa22bf.png',
    '/static/images/portada/Jardín_de_rosas_al_atardecer_d6ba7836.png',
    '/static/images/portada/Mujer_profesional_exitosa_d9165de1.png',
    '/static/images/portada/Lotus_rosa_en_agua_serena_9c7196f5.png',
    '/static/images/portada/Mujer_corriendo_libre_playa_2be035bd.png',
    '/static/images/portada/Campo_de_lavanda_al_atardecer_24b59e2c.png',
    '/static/images/portada/Mujer_leyendo_autocuidado_bf28df09.png',
    '/static/images/portada/Flores_de_cerezo_rosa_06faaad2.png',
    '/static/images/portada/Mujer_ejercitándose_fuerte_00e06916.png',
    '/static/images/portada/Playa_tranquila_al_atardecer_2fefa44b.png',
    '/static/images/portada/Mujer_meditando_al_amanecer_dea1740f.png',
    '/static/images/portada/Rincón_de_autocuidado_acogedor_dedf51f4.png',
    '/static/images/portada/Mujer_en_campo_de_trigo_512cdffd.png',
    '/static/images/portada/Momento_cálido_de_autocuidado_d5e2cb7a.png',
    '/static/images/portada/Té_y_flores_cálido_b938fc15.png',
    '/static/images/portada/Bosque_otoñal_dorado_fed5b05e.png'
];

let indiceImagenActual = 0;
let imagenActiva = 1;

function cambiarFrase() {
    const indice = Math.floor(Math.random() * frases.length);
    const elemento = document.getElementById('fraseMotivacional');
    if (elemento) {
        elemento.textContent = frases[indice];
    }
}

function cambiarImagenPortada() {
    const imagen1 = document.getElementById('imagenPortada1');
    const imagen2 = document.getElementById('imagenPortada2');
    
    if (!imagen1 || !imagen2) return;
    
    // Siguiente índice
    indiceImagenActual = (indiceImagenActual + 1) % imagenesPortada.length;
    
    // Alternar entre imagen1 e imagen2
    if (imagenActiva === 1) {
        // Cargar en imagen2 y mostrarla
        imagen2.style.backgroundImage = `url('${imagenesPortada[indiceImagenActual]}')`;
        imagen2.classList.add('activa');
        imagen1.classList.remove('activa');
        imagenActiva = 2;
    } else {
        // Cargar en imagen1 y mostrarla
        imagen1.style.backgroundImage = `url('${imagenesPortada[indiceImagenActual]}')`;
        imagen1.classList.add('activa');
        imagen2.classList.remove('activa');
        imagenActiva = 1;
    }
}

function iniciarPortada() {
    // La portada nueva (amaneceres, saludo y "¿Cómo está tu día hoy?") vive en aurora2.js
    if (typeof iniciarPortadaAurora === 'function') iniciarPortadaAurora();
}

function reproducirLink(link) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = link;
    
    // Manejar errores de reproducción
    audioPlayer.onerror = function() {
        alert('⚠️ No se pudo reproducir esta canción.\n\nAsegúrate de que el link sea válido y apunte a un archivo de audio directo (.mp3, .ogg, .wav).');
    };
    
    audioPlayer.play().catch(err => {
        alert('⚠️ Error al reproducir la canción.\n\nVerifica que el link sea correcto.');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Verificar si ya hay usuario registrado
    const userName = localStorage.getItem('userName');
    
    // Asegurarse de que la portada (dashboard) sea la primera pantalla visible
    mostrarSeccion('dashboard');
    
    // Iniciar portada con imágenes rotativas y frases
    iniciarPortada();
    
    
    const form = document.getElementById("userForm");
    const coachResponse = document.getElementById("coachResponse");
    const calendarSection = document.getElementById("calendarSection");

    // ========== REGISTRATION FORM ==========
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;

        // Validar nombre
        if (!nombre.trim()) {
            coachResponse.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #f5c6cb;">
                    <p>⚠️ Por favor escribe tu nombre</p>
                </div>
            `;
            return;
        }

        // Validar email
        if (!email.trim()) {
            coachResponse.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #f5c6cb;">
                    <p>⚠️ Por favor escribe tu email</p>
                </div>
            `;
            return;
        }

        // Mostrar "Registrando..."
        coachResponse.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; text-align: center;">
                <p style="font-size: 1.1rem; margin: 0;">🌸 Registrando...</p>
            </div>
        `;

        try {
            // Registrar en el backend
            const res = await fetch('/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ nombre: nombre.trim(), email: email.trim().toLowerCase() })
            });

            let data = await res.json();

            // El servidor envía un código al email; hay que escribirlo para entrar
            if (data.requiere_codigo && typeof pedirCodigoAcceso === 'function') {
                coachResponse.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; text-align: center;">
                        <p style="font-size: 1.1rem; margin: 0;">💌 Te enviamos un código a tu email</p>
                    </div>
                `;
                data = await pedirCodigoAcceso(nombre.trim(), email.trim().toLowerCase());
            }

            if (data.success) {
                // Guardar usuario en localStorage y variable global
                if (typeof usuarioActual !== 'undefined') {
                    usuarioActual = data.usuario;
                }
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('userEmail', data.usuario.email || email.trim().toLowerCase());
                
                // Actualizar el header con el nombre personalizado
                actualizarHeaderPersonalizado();
                
                // Mostrar mensaje de bienvenida
                coachResponse.innerHTML = `
                    <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; border-left: 4px solid #28a745;">
                        <p style="font-size: 1.2rem; margin: 0;">✨ ¡Hola ${nombre}! ✨</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Tus datos están seguros en la nube 🌸</p>
                    </div>
                `;
                form.reset();
                
                if (typeof verificarEstadoPremium === 'function') {
                    verificarEstadoPremium();
                }
                
                // Ir al menú de categorías
                setTimeout(() => {
                    coachResponse.innerHTML = '';
                    document.querySelector('header').classList.add('oculto');
                    
                    const secciones = document.querySelectorAll('.seccion');
                    secciones.forEach(s => s.classList.remove('activa'));
                    
                    document.getElementById('seccion-menu').classList.add('activa');
                }, 1500);
            } else {
                coachResponse.innerHTML = `
                    <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #f5c6cb;">
                        <p>❌ ${data.error || 'Error al registrar'}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error registro:', error);
            coachResponse.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; border-left: 4px solid #f5c6cb;">
                    <p>❌ Error de conexión. Intenta nuevamente.</p>
                </div>
            `;
        }
    });

    const calendar = document.getElementById("calendar");
    const notesContainer = document.getElementById("notes");

    function generateCalendar(year, month) {
        if (!calendar) return;
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        
        // Frases inspiradoras que cambian cada semana
        const frasesInspiradores = [
            "🌸 Cada pequeño paso te acerca a tus sueños 🌸",
            "✨ Tu constancia hoy es tu éxito mañana ✨",
            "💫 Los hábitos positivos transforman vidas 💫",
            "🦋 Eres capaz de crear la vida que deseas 🦋",
            "🌟 Cada día es una oportunidad para crecer 🌟",
            "💪 Tu disciplina es más fuerte que tu excusa 💪",
            "🌺 Pequeños cambios crean grandes resultados 🌺",
            "🌈 Confía en el proceso, todo tiene su tiempo 🌈",
            "💖 Eres la autora de tu propia historia 💖",
            "🎯 Lo que haces hoy construye tu mañana 🎯"
        ];
        
        // Calcular número de semana del año para cambiar la frase
        const inicioAño = new Date(year, 0, 1);
        const diasTranscurridos = Math.floor((new Date(year, month, 1) - inicioAño) / (24 * 60 * 60 * 1000));
        const numeroSemana = Math.floor(diasTranscurridos / 7);
        const fraseActual = frasesInspiradores[numeroSemana % frasesInspiradores.length];

        let html = `<h3>${monthNames[month]} ${year}</h3>
                    <p class="frase-inspiradora-semanal">${fraseActual}</p>
                    <div class="days">`;
        for (let i = 0; i < firstDay; i++) {
            html += "<div></div>";
        }

        for (let d = 1; d <= daysInMonth; d++) {
            html += `<div class="day" data-day="${d}">${d}</div>`;
        }

        html += "</div>";
        calendar.innerHTML = html;

        document.querySelectorAll(".day").forEach(day => {
            day.addEventListener("click", function () {
                const selectedDay = this.getAttribute("data-day");
                mostrarModalHabitos(selectedDay, month, year);
            });
        });
    }

    function mostrarModalHabitos(day, month, year) {
        const fecha = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const habitosGuardados = JSON.parse(localStorage.getItem(`habitos-${fecha}`) || '[]');
        const habitosPersonalizados = JSON.parse(localStorage.getItem('habitosPersonalizados') || '[]');
        
        if (habitosPersonalizados.length === 0) {
            alert('⚠️ Primero debes crear tus hábitos personalizados en la sección de arriba');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-habitos';
        
        const habitosHTML = habitosPersonalizados.map(h => {
            const guardado = habitosGuardados.find(hg => hg.id == h.id);
            const checked = guardado ? 'checked' : '';
            const hora = guardado ? guardado.hora : '08:00';
            
            return `
                <div class="habito-input-group">
                    <label class="habito-item">
                        <input type="checkbox" data-id="${h.id}" data-emoji="${h.emoji}" data-nombre="${h.nombre}" ${checked}>
                        <span>${h.emoji} ${h.nombre}</span>
                    </label>
                    <input type="time" value="${hora}" class="hora-input">
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="modal-content-habitos">
                <h3>🌸 Planifica tu día ${day}/${month + 1}/${year} 🌸</h3>
                <div class="habitos-grid">
                    ${habitosHTML}
                </div>
                <div class="modal-botones">
                    <button onclick="guardarHabitos('${fecha}')" class="btn-guardar">💾 Guardar</button>
                    <button onclick="cerrarModal()" class="btn-cerrar">❌ Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateCalendar(new Date().getFullYear(), new Date().getMonth());
    cargarHabitosPersonalizados();
});

// Gestión de hábitos personalizados
function agregarHabitoPersonalizado() {
    const nombre = document.getElementById('nuevo-habito-nombre').value.trim();
    const emoji = document.getElementById('nuevo-habito-emoji').value.trim();
    
    if (!nombre || !emoji) {
        alert('Por favor completa el nombre y el emoji del hábito');
        return;
    }
    
    let habitos = JSON.parse(localStorage.getItem('habitosPersonalizados') || '[]');
    
    if (habitos.length >= 4) {
        alert('⚠️ Solo puedes tener máximo 4 hábitos personalizados');
        return;
    }
    
    const nuevoHabito = {
        id: Date.now(),
        nombre: nombre,
        emoji: emoji
    };
    
    habitos.push(nuevoHabito);
    localStorage.setItem('habitosPersonalizados', JSON.stringify(habitos));
    
    document.getElementById('nuevo-habito-nombre').value = '';
    document.getElementById('nuevo-habito-emoji').value = '';
    
    cargarHabitosPersonalizados();
}

function borrarHabitoPersonalizado(id) {
    if (!confirm('¿Estás segura de que quieres borrar este hábito?')) {
        return;
    }
    
    let habitos = JSON.parse(localStorage.getItem('habitosPersonalizados') || '[]');
    habitos = habitos.filter(h => h.id !== id);
    localStorage.setItem('habitosPersonalizados', JSON.stringify(habitos));
    cargarHabitosPersonalizados();
}

function cargarHabitosPersonalizados() {
    const habitos = JSON.parse(localStorage.getItem('habitosPersonalizados') || '[]');
    const container = document.getElementById('lista-habitos-personalizados');
    if (!container) return;
    
    if (habitos.length === 0) {
        container.innerHTML = '<p class="no-habitos">Aún no has creado ningún hábito personalizado.</p>';
        return;
    }
    
    container.innerHTML = habitos.map(h => `
        <div class="habito-card">
            <span class="habito-emoji">${h.emoji}</span>
            <span class="habito-nombre">${h.nombre}</span>
            <button onclick="borrarHabitoPersonalizado(${h.id})" class="btn-borrar-habito">🗑️</button>
        </div>
    `).join('');
}

function guardarHabitos(fecha) {
    const modal = document.querySelector('.modal-habitos');
    const habitosInputs = modal.querySelectorAll('.habito-input-group');
    
    const habitosDelDia = [];
    habitosInputs.forEach(input => {
        const checkbox = input.querySelector('input[type="checkbox"]');
        const horaInput = input.querySelector('input[type="time"]');
        
        if (checkbox.checked) {
            habitosDelDia.push({
                id: checkbox.dataset.id,
                emoji: checkbox.dataset.emoji,
                nombre: checkbox.dataset.nombre,
                hora: horaInput.value || '00:00'
            });
        }
    });
    
    localStorage.setItem(`habitos-${fecha}`, JSON.stringify(habitosDelDia));
    
    const day = document.querySelector(`.day[data-day="${parseInt(fecha.split('-')[2])}"]`);
    if (day) {
        const iconos = habitosDelDia.map(h => h.emoji).join('');
        day.setAttribute('data-habitos', iconos);
    }
    
    cerrarModal();
    alert('✨ ¡Hábitos guardados exitosamente! 💖');
}

function cerrarModal() {
    const modal = document.querySelector('.modal-habitos');
    if (modal) {
        modal.remove();
    }
}


// Compartir por WhatsApp
function compartirWhatsApp() {
    const urlApp = window.location.href.split("?")[0];
    const mensaje = encodeURIComponent(
        "✨ ¡Descubre Aurora! 🪷\n\n" +
        "Tu guía de empoderamiento personal donde puedes:\n" +
        "💜 Llevar un diario emocional\n" +
        "🎯 Alcanzar tus metas\n" +
        "📅 Crear hábitos saludables\n" +
        "🌸 Crecer y empoderarte cada día\n\n" +
        "¡Únete ahora! " + urlApp
    );
    
    const urlWhatsApp = "https://wa.me/?text=" + mensaje;
    window.open(urlWhatsApp, "_blank");
}

// Mini Calendario de Hábitos Animado para el Menú
function generarMiniCalendario() {
    const miniCalendarioDias = document.getElementById('miniCalendarioDias');
    const miniCalendarioMes = document.getElementById('miniCalendarioMes');
    
    if (!miniCalendarioDias || !miniCalendarioMes) return;
    
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth(); // 0-11
    const daysInMonth = new Date(año, mes + 1, 0).getDate();
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    miniCalendarioMes.textContent = `${meses[mes]} ${año}`;
    
    // Cargar hábitos guardados
    const habitosGuardados = JSON.parse(localStorage.getItem('habitos') || '[]');
    
    // Generar días (duplicamos para efecto de scroll infinito)
    let diasHTML = '';
    for (let duplicado = 0; duplicado < 2; duplicado++) {
        for (let dia = 1; dia <= daysInMonth; dia++) {
            const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const diaSemana = new Date(año, mes, dia).getDay();
            const habitosDelDia = JSON.parse(localStorage.getItem(`habitos-${fecha}`) || '[]');
            
            // Obtener emojis de hábitos completados
            let habitosEmojis = '';
            if (habitosDelDia.length > 0) {
                habitosEmojis = habitosDelDia.map(h => h.emoji).join('');
            } else if (habitosGuardados.length > 0) {
                // Mostrar los hábitos configurados aunque no estén completados
                habitosEmojis = habitosGuardados.slice(0, 3).map(h => h.emoji).join('');
            }
            
            diasHTML += `
                <div class="mini-dia">
                    <div class="mini-dia-numero">${dia}</div>
                    <div class="mini-dia-nombre">${diasSemana[diaSemana]}</div>
                    <div class="mini-dia-habitos">${habitosEmojis || '✨'}</div>
                </div>
            `;
        }
    }
    
    miniCalendarioDias.innerHTML = diasHTML;
}

// Llamar función al cargar página
window.addEventListener('DOMContentLoaded', function() {
    actualizarHeaderPersonalizado();
    generarMiniCalendario();
    inicializarCartasPoder();
});

// ===== CARTAS DE PODER =====
// Las 40 Cartas de Poder (las mismas del libro). Las 20 primeras son gratis; las otras 20, Premium.
const FRASES_PODER_BASICAS = [
    "Tu luz es DEMASIADO brillante para esconderla",
    "Eres suficiente, SIEMPRE lo has sido",
    "No tienes que ganarte el derecho a descansar",
    "Tu valor no baja cuando alguien no lo ve",
    "No eres “demasiado”: estabas en el lugar equivocado",
    "Lo que ya lograste TAMBIÉN cuenta",
    "No necesitas ser perfecta para ser querida",
    "Mereces lo mismo que le deseas a tu mejor amiga",
    "Ocupar espacio NO es egoísmo, es tu derecho",
    "Tu presencia es un REGALO, no una molestia",
    "No te hagas pequeña por comodidad ajena",
    "Tu éxito NO opaca a nadie",
    "Di lo que piensas aunque te tiemble la voz",
    "Tu opinión no necesita un “perdón” delante",
    "Puedes cambiar de idea sin dar explicaciones",
    "“NO” es una frase completa",
    "Decepcionar a otros no te hace mala persona",
    "Cuidarte no es abandonar a nadie",
    "No tienes que cargar lo que NO es tuyo",
    "Un límite claro también es una forma de amor"
];

const FRASES_PODER_PREMIUM = [
    "Puedes tener miedo y hacerlo IGUAL",
    "No tienes que tenerlo todo claro para empezar",
    "Ya sobreviviste a TODOS tus días difíciles",
    "Empezar de nuevo no es volver a cero",
    "Lo que hoy te cuesta, mañana te va a sostener",
    "Pedir ayuda también es de valientes",
    "Tus cicatrices cuentan historias de victoria",
    "Tu vulnerabilidad es tu fortaleza",
    "Llorar no te quita lo fuerte",
    "No le debes tu versión de antes a nadie",
    "Perdonarte también es avanzar",
    "Lo que te pasó no es todo lo que eres",
    "Vas a tu ritmo, y tu ritmo está bien",
    "La perfección es una ilusión, tu esencia es real",
    "Tu vida no tiene que parecerse a la de nadie",
    "Tu alegría no tiene que esperar a que todo esté bien",
    "Lo que es para ti no te pide que te traiciones",
    "Confía en lo que sientes: tu cuerpo ya lo sabe",
    "Hoy puedes elegirte, aunque ayer no lo hicieras",
    "La mujer que quieres ser YA vive en ti"
];

let FRASES_PODER = [...FRASES_PODER_BASICAS];

function inicializarCartasPoder() {
    const cartasGrid = document.getElementById('cartasGrid');
    if (!cartasGrid) return;
    
    cartasGrid.innerHTML = '';
    
    FRASES_PODER.forEach((frase, index) => {
        const cartaContainer = document.createElement('div');
        cartaContainer.className = 'carta-container';
        cartaContainer.dataset.index = index;
        
        // Diseño de la carta: 10 paletas que se turnan, todas del mismo estilo
        const numPaleta = (index % 10) + 1;
        const bgClass = `bg-${numPaleta}`;
        cartaContainer.classList.add(`pal-${numPaleta}`);
        
        // Las cartas Premium (índice >= 20) llevan el marco dorado
        const esPremium = index >= 20;
        if (esPremium) cartaContainer.classList.add('premium');
        const mensajeClass = esPremium ? 'carta-mensaje-premium' : 'carta-mensaje';
        const fraseHTML = (typeof a2Resaltar === 'function') ? a2Resaltar(frase) : frase;
        
        cartaContainer.innerHTML = `
            <div class="carta">
                <div class="carta-frente ${bgClass}">
                    <span class="carta-numero">${index + 1}</span>
                </div>
                <div class="carta-reverso">
                    <img src="/static/images/cartas-aurora/loto.svg" alt="" class="a2-reverso-loto">
                    <div class="${mensajeClass}">${fraseHTML}</div>
                    <span class="a2-reverso-pie">${esPremium ? '✦ PREMIUM ✦' : 'AURORA'}</span>
                </div>
            </div>
        `;
        
        cartaContainer.addEventListener('click', function() {
            voltearCarta(this);
        });
        
        cartasGrid.appendChild(cartaContainer);
    });
    
    actualizarContadorCartas();
}

function voltearCarta(cartaContainer) {
    if (!cartaContainer.classList.contains('volteada')) {
        cartaContainer.classList.add('volteada');
        actualizarContadorCartas();
    }
}

function actualizarContadorCartas() {
    const cartasReveladas = document.querySelectorAll('.carta-container.volteada').length;
    const contadorSpan = document.getElementById('cartas-reveladas');
    if (contadorSpan) {
        contadorSpan.textContent = cartasReveladas;
    }
    
    // Celebración cuando se completan las 20 cartas
    if (cartasReveladas === 20) {
        setTimeout(() => {
            celebrarCompletacion();
        }, 600);
    }
}

function celebrarCompletacion() {
    // Crear overlay de celebración
    const overlay = document.createElement('div');
    overlay.className = 'celebracion-overlay';
    overlay.innerHTML = `
        <div class="celebracion-contenido">
            <div class="celebracion-mensaje">
                <h2>✨ ¡FELICIDADES! ✨</h2>
                <p>Has revelado todas las cartas de poder</p>
                <p class="celebracion-frase">💫 Ahora es tiempo de BRILLAR sin miedo 💫</p>
                <button onclick="cerrarCelebracion()" class="btn-cerrar-celebracion">Continuar Brillando ✨</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Crear confetti dorado
    crearConfetti();
    
    // Animar entrada
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 100);
}

function cerrarCelebracion() {
    const overlay = document.querySelector('.celebracion-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

function crearConfetti() {
    const colores = ['#f4c542', '#ffd4e5', '#ffe9f3', '#ffffff', '#ffb6d9'];
    const emojis = ['✨', '⭐', '💫', '🌟', '💖', '👑', '💎'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Alterna entre círculos de color y emojis
            if (Math.random() > 0.5) {
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.fontSize = `${Math.random() * 20 + 15}px`;
            } else {
                confetti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = confetti.style.width;
                confetti.style.borderRadius = '50%';
            }
            
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 50);
    }
}

function reiniciarCartas() {
    const todasLasCartas = document.querySelectorAll('.carta-container');
    todasLasCartas.forEach(carta => {
        carta.classList.remove('volteada');
    });
    actualizarContadorCartas();
}

// ===== FUNCIONES PREMIUM =====
function activarCartasPremium() {
    console.log('🎴 Activando cartas Premium...');
    FRASES_PODER = [...FRASES_PODER_BASICAS, ...FRASES_PODER_PREMIUM];
    inicializarCartasPoder();
    const contadorTotal = document.getElementById('cartas-total');
    if (contadorTotal) {
        contadorTotal.textContent = '40';
    }
    
    // Mostrar test de estado de ánimo SOLO para Premium
    const testAnimo = document.getElementById('test-animo-premium');
    if (testAnimo) {
        testAnimo.style.display = 'block';
        console.log('✅ Test de ánimo activado para Premium');
    }
}

function desactivarTestAnimo() {
    // Asegurar que el test esté oculto para NO Premium
    const testAnimo = document.getElementById('test-animo-premium');
    if (testAnimo) {
        testAnimo.style.display = 'none';
        console.log('❌ Test de ánimo desactivado (No Premium)');
    }
}

// Sistema de detección de estado de ánimo y carta personalizada
const CARTAS_POR_ESTADO = {
    triste: {
        titulo: "🌸 Para tu corazón",
        mensaje: "Hoy las lágrimas son semillas de fortaleza. Cada emoción que sientes te hace más humana, más valiente. Permítete sentir sin juzgarte. El amor propio también es abrazar tu tristeza con compasión. Mañana amanecerá un nuevo día para ti."
    },
    cansada: {
        titulo: "💫 Respira y suelta",
        mensaje: "Tu cuerpo te habla, escúchalo con amor. El descanso no es debilidad, es sabiduría. Has cargado mucho peso, es momento de soltar. Permítete pausar sin culpa. Tu energía se renueva cuando te honras a ti misma."
    },
    ansiosa: {
        titulo: "🌊 Calma tu mente",
        mensaje: "Respira: inhala paz por 4 segundos, sostén 4, exhala por 6. Tu mente crea tormentas, pero tú eres el océano profundo que permanece en calma. Lo que temes no ha pasado. Estás aquí, estás segura, estás bien en este momento."
    },
    insegura: {
        titulo: "👑 Eres suficiente",
        mensaje: "No necesitas probarte ante nadie. Tu valor no está en tus logros sino en tu existencia. Las dudas son normales, pero no definen tu verdad. Ya eres todo lo que necesitas ser. Confía en el proceso de convertirte en quien siempre has sido."
    },
    enojada: {
        titulo: "🔥 Tu enojo es válido",
        mensaje: "Siente tu rabia sin miedo, es combustible para tu cambio. No te disculpes por tener límites. Tu enojo te muestra qué necesitas proteger. Úsalo como fuerza, no como veneno. Transforma ese fuego en acción clara y firme."
    },
    sola: {
        titulo: "💖 Nunca estás sola",
        mensaje: "La soledad puede ser un regalo si la transformas en encuentro contigo misma. Estás rodeada de amor aunque no lo veas ahora. Tu compañía es valiosa, empezando por la tuya propia. Eres suficiente para ti misma, siempre lo has sido."
    },
    perdida: {
        titulo: "🧭 El camino se revela",
        mensaje: "No estar perdida, estás en transición. La confusión es señal de que estás creciendo. No tienes que tener todas las respuestas hoy. Confía en tu capacidad de crear el camino mientras caminas. Lo que es para ti no pasará de largo."
    },
    feliz: {
        titulo: "✨ Celebra tu luz",
        mensaje: "Tu alegría es medicina para el mundo. Permítete disfrutar sin culpa, sin esperar el siguiente problema. Mereces esta felicidad. Grábala en tu memoria para los días grises. Tu sonrisa tiene el poder de cambiar vidas."
    },
    motivada: {
        titulo: "🚀 Imparable",
        mensaje: "Esta energía que sientes es tu estado natural. No hay meta demasiado grande para ti. El mundo necesita tu ambición sin disculpas. Canaliza esta fuerza, actúa ahora. Lo que sueñas ya está buscándote a ti también."
    },
    default: {
        titulo: "💫 Para ti hoy",
        mensaje: "Exactamente como estás ahora, eres suficiente. Este momento es parte de tu historia de transformación. Confía en tu ritmo, en tu proceso. No necesitas ser diferente para ser valiosa. Ya eres extraordinaria."
    }
};

function analizarEstadoAnimo() {
    const input = document.getElementById('input-animo');
    const texto = input.value.toLowerCase().trim();
    
    if (texto.length < 10) {
        alert('💭 Por favor, cuéntame un poco más sobre cómo te sientes');
        return;
    }
    
    // Detectar estado de ánimo
    let estadoDetectado = 'default';
    
    if (texto.includes('triste') || texto.includes('deprimida') || texto.includes('lloro') || texto.includes('llorando')) {
        estadoDetectado = 'triste';
    } else if (texto.includes('cansada') || texto.includes('agotada') || texto.includes('exhausta') || texto.includes('sin energía')) {
        estadoDetectado = 'cansada';
    } else if (texto.includes('ansiosa') || texto.includes('angustia') || texto.includes('nerviosa') || texto.includes('preocupada')) {
        estadoDetectado = 'ansiosa';
    } else if (texto.includes('insegura') || texto.includes('dudo') || texto.includes('miedo') || texto.includes('no puedo')) {
        estadoDetectado = 'insegura';
    } else if (texto.includes('enojada') || texto.includes('rabia') || texto.includes('furiosa') || texto.includes('frustrada')) {
        estadoDetectado = 'enojada';
    } else if (texto.includes('sola') || texto.includes('aislada') || texto.includes('vacía')) {
        estadoDetectado = 'sola';
    } else if (texto.includes('perdida') || texto.includes('confundida') || texto.includes('no sé')) {
        estadoDetectado = 'perdida';
    } else if (texto.includes('feliz') || texto.includes('contenta') || texto.includes('bien') || texto.includes('alegre')) {
        estadoDetectado = 'feliz';
    } else if (texto.includes('motivada') || texto.includes('energía') || texto.includes('lista')) {
        estadoDetectado = 'motivada';
    }
    
    mostrarCartaPersonalizada(estadoDetectado);
}

function mostrarCartaPersonalizada(estado) {
    const carta = CARTAS_POR_ESTADO[estado];
    const modal = document.getElementById('modal-carta-personalizada');
    const titulo = document.getElementById('titulo-carta-personalizada');
    const mensaje = document.getElementById('mensaje-carta-personalizada');
    
    titulo.textContent = carta.titulo;
    mensaje.textContent = carta.mensaje;
    
    modal.style.display = 'flex';
    
    // Limpiar input
    document.getElementById('input-animo').value = '';
}

function cerrarCartaPersonalizada() {
    const modal = document.getElementById('modal-carta-personalizada');
    modal.style.display = 'none';
}

function verificarYActivarPremium() {
    const userEmail = (typeof obtenerEmailUsuario === 'function') ? obtenerEmailUsuario() : (localStorage.getItem('userEmail') || '');
    const premiumUrl = userEmail ? `/api/premium/status?email=${encodeURIComponent(userEmail)}` : '/api/premium/status';
    fetch(premiumUrl, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            console.log('🎴 Verificando cartas Premium:', data.premium);
            if (data.premium) {
                activarCartasPremium();
                console.log('🎴 40 Cartas Premium activadas!');
            } else {
                // Usuario NO Premium: asegurar que el test esté oculto
                desactivarTestAnimo();
                console.log('🎴 Usuario básico: 20 cartas, sin test de ánimo');
            }
        })
        .catch(() => {
            // En caso de error, ocultar test por seguridad
            desactivarTestAnimo();
        });
}

window.addEventListener('DOMContentLoaded', function() {
    setTimeout(verificarYActivarPremium, 1000);
});

// ===== MENSAJES DE APOYO =====
async function enviarMensajeCoach() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    if (!mensaje) return;
    
    const chatMessages = document.getElementById('chat-messages');
    
    chatMessages.innerHTML += `
        <div class="chat-message user">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${mensaje}</p>
            </div>
        </div>
    `;
    
    input.value = '';
    
    const typingHtml = `
        <div class="chat-message ai typing-message">
            <div class="message-avatar">💜</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    chatMessages.innerHTML += typingHtml;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const response = await fetch('/api/ai-coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ mensaje: mensaje })
        });
        
        const data = await response.json();
        
        const typingEl = document.querySelector('.typing-message');
        if (typingEl) typingEl.remove();
        
        chatMessages.innerHTML += `
            <div class="chat-message ai">
                <div class="message-avatar">💜</div>
                <div class="message-content">
                    <p>${data.respuesta}</p>
                </div>
            </div>
        `;
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
    } catch (error) {
        const typingEl = document.querySelector('.typing-message');
        if (typingEl) typingEl.remove();
        
        chatMessages.innerHTML += `
            <div class="chat-message ai">
                <div class="message-avatar">💜</div>
                <div class="message-content">
                    <p>Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.</p>
                </div>
            </div>
        `;
    }
}

function preguntaRapida(pregunta) {
    document.getElementById('chat-input').value = pregunta;
    enviarMensajeCoach();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const chatInput = document.getElementById('chat-input');
        if (document.activeElement === chatInput) {
            e.preventDefault();
            enviarMensajeCoach();
        }
    }
});
