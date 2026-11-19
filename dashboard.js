// ================== DASHBOARD Y ESTADÍSTICAS ==================

function cargarDashboard() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const hoy = new Date();
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Mostrar fecha y saludo
    const diaSemana = nombresDias[hoy.getDay()];
    const dia = hoy.getDate();
    const mes = nombresMeses[hoy.getMonth()];
    const anio = hoy.getFullYear();
    
    const hora = hoy.getHours();
    let saludo = '';
    if (hora < 12) saludo = 'Buenos días';
    else if (hora < 19) saludo = 'Buenas tardes';
    else saludo = 'Buenas noches';
    
    const saludoEl = document.getElementById('saludoPersonalizado');
    const fechaEl = document.getElementById('fechaHoy');
    
    if (saludoEl) saludoEl.textContent = saludo;
    if (fechaEl) fechaEl.textContent = `${diaSemana}, ${dia} de ${mes} de ${anio}`;
    
    // Las frases motivacionales ahora se manejan en script.js con rotación de imágenes
    
    // Cargar estadísticas del dashboard solo si existen los elementos
    const entradiasDiarioEl = document.getElementById('entradas-diario-count');
    if (entradiasDiarioEl) {
        fetch(`/api/dashboard/${email}`)
            .then(response => response.json())
            .then(data => {
                const nombreEl = document.getElementById('nombreUsuario');
                if (data.usuario && nombreEl) {
                    nombreEl.textContent = data.usuario.nombre;
                }
                
                if (document.getElementById('entradas-diario-count')) {
                    document.getElementById('entradas-diario-count').textContent = data.entradas_diario_30d || 0;
                }
                if (document.getElementById('metas-activas-count')) {
                    document.getElementById('metas-activas-count').textContent = data.metas_activas || 0;
                }
                if (document.getElementById('metas-completadas-count')) {
                    document.getElementById('metas-completadas-count').textContent = data.metas_completadas || 0;
                }
                if (document.getElementById('racha-dias-count')) {
                    document.getElementById('racha-dias-count').textContent = data.racha_dias || 0;
                }
                
                // Actualizar nivel de logros
                actualizarNivelLogros(data.metas_completadas || 0);
                
                // Mostrar emociones recientes
                mostrarEmocionesRecientes(data.emociones_recientes);
            })
            .catch(error => console.error('Error cargando dashboard:', error));
    }
    
    // Cargar tareas del día
    cargarTareasDia();
    // Cargar gratitudes del día
    cargarGratitudesDia();
}

function actualizarNivelLogros(metasCompletadas) {
    const nivelNumeroEl = document.getElementById('nivel-logros-numero');
    const nivelBarraEl = document.getElementById('nivel-barra-fill');
    const nivelDescripcionEl = document.getElementById('nivel-descripcion');
    
    if (!nivelNumeroEl || !nivelBarraEl || !nivelDescripcionEl) return;
    
    // Calcular nivel (1 meta = 1 nivel, máximo 10)
    const nivel = Math.min(Math.floor(metasCompletadas) + 1, 10);
    const progreso = ((metasCompletadas % 1) * 100) || (metasCompletadas > 0 ? 100 : 0);
    
    // Descripciones de nivel
    const descripciones = [
        'Principiante',
        'Exploradora',
        'Motivada',
        'Comprometida',
        'Determinada',
        'Poderosa',
        'Imparable',
        'Triunfadora',
        'Maestra',
        'Leyenda'
    ];
    
    // Detectar si subió de nivel
    const nivelAnterior = parseInt(localStorage.getItem('nivelAnterior') || '1');
    if (nivel > nivelAnterior && metasCompletadas > 0) {
        mostrarCelebracionNivel(nivel, descripciones[nivel - 1]);
    }
    localStorage.setItem('nivelAnterior', nivel.toString());
    
    nivelNumeroEl.textContent = nivel;
    nivelBarraEl.style.width = progreso + '%';
    nivelDescripcionEl.textContent = descripciones[nivel - 1] || 'Leyenda';
}

function mostrarCelebracionNivel(nivel, nombreNivel) {
    // Crear overlay de celebración
    const overlay = document.createElement('div');
    overlay.className = 'celebracion-nivel-overlay';
    overlay.innerHTML = `
        <div class="celebracion-nivel-contenido">
            <div class="confeti-container">
                ${generarConfeti()}
            </div>
            <div class="celebracion-nivel-mensaje">
                <h2>🎉 ¡Felicitaciones! 🎉</h2>
                <p class="celebracion-nivel-texto">Has alcanzado el</p>
                <p class="celebracion-nivel-numero">Nivel ${nivel}</p>
                <p class="celebracion-nivel-titulo">✨ ${nombreNivel} ✨</p>
                <button onclick="cerrarCelebracionNivel()" class="btn-celebracion-cerrar">Continuar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Mostrar con animación
    setTimeout(() => overlay.classList.add('visible'), 10);
}

function generarConfeti() {
    let confeti = '';
    const colores = ['#ffd700', '#f4c542', '#ffb6c1', '#ff69b4', '#ffc0cb', '#ffe4e1'];
    const emojis = ['🌸', '🌺', '✨', '💖', '🦋', '👑', '🏆', '💫'];
    
    for (let i = 0; i < 50; i++) {
        const esEmoji = Math.random() > 0.7;
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 2;
        
        if (esEmoji) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            confeti += `<div class="confeti confeti-emoji" style="left: ${left}%; animation-delay: ${delay}s; animation-duration: ${duration}s;">${emoji}</div>`;
        } else {
            const color = colores[Math.floor(Math.random() * colores.length)];
            confeti += `<div class="confeti" style="left: ${left}%; background: ${color}; animation-delay: ${delay}s; animation-duration: ${duration}s;"></div>`;
        }
    }
    
    return confeti;
}

function cerrarCelebracionNivel() {
    const overlay = document.querySelector('.celebracion-nivel-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
    }
}

function mostrarEmocionesRecientes(emociones) {
    const container = document.getElementById('emociones-recientes');
    if (!container) return; // Solo ejecutar si el elemento existe
    
    if (!emociones || emociones.length === 0) {
        container.innerHTML = '<p class="texto-suave">Sin emociones registradas esta semana</p>';
        return;
    }
    
    container.innerHTML = emociones.map(e => 
        `<span class="emocion-badge" title="${e.fecha}">${e.emoji}</span>`
    ).join('');
}

// ================== PLANIFICADOR DEL DÍA (TAREAS) ==================

function agregarTarea() {
    const tareaInput = document.getElementById('nueva-tarea');
    const prioridadSelect = document.getElementById('prioridad-tarea');
    const tarea = tareaInput.value.trim();
    const prioridad = prioridadSelect.value;
    
    if (!tarea) {
        alert('⚠️ Por favor escribe una tarea');
        return;
    }
    
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    // Guardar en localStorage primero (siempre funciona)
    const tareasKey = `tareas_${fecha}`;
    let tareas = JSON.parse(localStorage.getItem(tareasKey) || '[]');
    const nuevaTarea = {
        id: Date.now(),
        tarea,
        prioridad,
        completada: false,
        fecha
    };
    tareas.push(nuevaTarea);
    localStorage.setItem(tareasKey, JSON.stringify(tareas));
    
    // Limpiar input y recargar lista inmediatamente
    tareaInput.value = '';
    cargarTareasDia();
}

function cargarTareasDia() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    const container = document.getElementById('lista-tareas');
    if (!container) return;
    
    // Función para mostrar tareas
    function mostrarTareas(tareas) {
        if (!tareas || tareas.length === 0) {
            container.innerHTML = '<p class="texto-suave">No hay tareas para hoy. ¡Agrega una!</p>';
            return;
        }
        
        container.innerHTML = tareas.map(tarea => `
            <div class="tarea-item ${tarea.completada ? 'completada' : ''} prioridad-${tarea.prioridad}">
                <input type="checkbox" 
                       ${tarea.completada ? 'checked' : ''} 
                       onchange="marcarTarea(${tarea.id}, this.checked)"
                       class="tarea-checkbox" />
                <span class="tarea-texto">${tarea.tarea}</span>
                <span class="tarea-prioridad">${getPrioridadIcono(tarea.prioridad)}</span>
            </div>
        `).join('');
    }
    
    // Cargar desde localStorage primero (instantáneo)
    const tareasKey = `tareas_${fecha}`;
    const tareasLocal = JSON.parse(localStorage.getItem(tareasKey) || '[]');
    mostrarTareas(tareasLocal);
}

function marcarTarea(tareaId, completada) {
    const fecha = new Date().toISOString().split('T')[0];
    const tareasKey = `tareas_${fecha}`;
    
    // Actualizar en localStorage primero (instantáneo)
    let tareas = JSON.parse(localStorage.getItem(tareasKey) || '[]');
    const tareaIndex = tareas.findIndex(t => t.id === tareaId);
    if (tareaIndex !== -1) {
        tareas[tareaIndex].completada = completada;
        localStorage.setItem(tareasKey, JSON.stringify(tareas));
        cargarTareasDia();
    }
}

function getPrioridadIcono(prioridad) {
    if (prioridad === 'urgente') return '🔴 Urgente';
    if (prioridad === 'importante') return '🟡 Importante';
    return '🟢 Normal';
}

// ================== DIARIO DE GRATITUD ==================

function guardarGratitudes() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    const gratitud1 = document.getElementById('gratitud1').value.trim();
    const gratitud2 = document.getElementById('gratitud2').value.trim();
    const gratitud3 = document.getElementById('gratitud3').value.trim();
    
    if (!gratitud1 && !gratitud2 && !gratitud3) {
        alert('⚠️ Escribe al menos una cosa por la que estés agradecida');
        return;
    }
    
    // Guardar en localStorage primero (siempre funciona)
    const gratitudesData = { gratitud1, gratitud2, gratitud3, fecha };
    localStorage.setItem(`gratitudes_${fecha}`, JSON.stringify(gratitudesData));
    
    // Mostrar éxito inmediatamente
    alert('✨ ¡Gratitudes guardadas! 🙏');
}

function cargarGratitudesDia() {
    const fecha = new Date().toISOString().split('T')[0];
    try {
        const data = JSON.parse(localStorage.getItem(`gratitudes_${fecha}`) || 'null');
        if (!data) return;
        ['gratitud1', 'gratitud2', 'gratitud3'].forEach(id => {
            const campo = document.getElementById(id);
            if (campo && data[id]) campo.value = data[id];
        });
    } catch (e) {
        console.log('No hay gratitudes previas');
    }
}

// ================== RITUALES MATUTINO Y NOCTURNO ==================

function guardarRitualMatutino() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    const afirmacion = document.getElementById('afirmacion-matutina').value.trim();
    const intencion = document.getElementById('intencion-dia').value.trim();
    
    if (!afirmacion || !intencion) {
        alert('⚠️ Completa tu afirmación e intención del día');
        return;
    }
    
    // Guardar en localStorage primero (siempre funciona)
    const ritualData = { afirmacion, intencion, fecha };
    localStorage.setItem(`ritual_matutino_${fecha}`, JSON.stringify(ritualData));
    
    // Mostrar éxito inmediatamente
    alert('🌅 ¡Ritual matutino completado! Que tengas un día maravilloso 💖');
    document.getElementById('afirmacion-matutina').value = '';
    document.getElementById('intencion-dia').value = '';
}

function guardarRitualNocturno() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    const reflexion = document.getElementById('reflexion-noche').value.trim();
    
    if (!reflexion) {
        alert('⚠️ Escribe tu reflexión del día');
        return;
    }
    
    // Guardar en localStorage primero (siempre funciona)
    const ritualData = { reflexion, fecha };
    localStorage.setItem(`ritual_nocturno_${fecha}`, JSON.stringify(ritualData));
    
    // Mostrar éxito inmediatamente
    alert('🌙 ¡Ritual nocturno completado! Descansa bien 💜');
    document.getElementById('reflexion-noche').value = '';
}

// ================== AFIRMACIONES PERSONALIZADAS ==================

const afirmacionesMatutinas = [
    "Soy capaz de lograr todo lo que me proponga hoy",
    "Merezco amor, respeto y felicidad",
    "Mi mente está llena de brillantes ideas creativas",
    "Hoy elijo la paz y la alegría",
    "Soy fuerte, soy bella, soy valiosa",
    "Este día está lleno de posibilidades infinitas",
    "Confío en mi proceso y en mi camino",
    "Soy suficiente tal como soy",
    "Mi energía es magnética y positiva",
    "Hoy es un día perfecto para brillar"
];

function generarAfirmacionAleatoria() {
    const indice = Math.floor(Math.random() * afirmacionesMatutinas.length);
    document.getElementById('afirmacion-sugerida').textContent = afirmacionesMatutinas[indice];
}

// Cargar dashboard al iniciar la sección
window.addEventListener('load', function() {
    // Cargar dashboard si es la primera vez
    setTimeout(() => {
        if (document.getElementById('seccion-dashboard').classList.contains('activa')) {
            cargarDashboard();
            generarAfirmacionAleatoria();
        }
    }, 100);
});

// Función global para recargar dashboard cuando se cambia a esa sección
window.activarDashboard = function() {
    cargarDashboard();
    generarAfirmacionAleatoria();
};

// ========================================
// PAUSA CONSCIENTE - Respiración Guiada
// ========================================

let respiracionActiva = false;
let respiracionInterval = null;

function iniciarRespiracion() {
    const circulo = document.getElementById('circulo-respiracion');
    const texto = document.getElementById('texto-respiracion');
    const btn = document.querySelector('.btn-respiracion');
    
    if (respiracionActiva) {
        respiracionActiva = false;
        clearInterval(respiracionInterval);
        circulo.classList.remove('inhalar', 'exhalar');
        texto.textContent = 'Inhala';
        btn.textContent = '🌬️ Iniciar Respiración Guiada';
        return;
    }
    
    respiracionActiva = true;
    btn.textContent = '⏹️ Detener';
    let fase = 'inhalar';
    
    function ciclo() {
        if (fase === 'inhalar') {
            circulo.classList.remove('exhalar');
            circulo.classList.add('inhalar');
            texto.textContent = 'Inhala...';
            fase = 'mantener';
        } else if (fase === 'mantener') {
            texto.textContent = 'Mantén...';
            fase = 'exhalar';
        } else {
            circulo.classList.remove('inhalar');
            circulo.classList.add('exhalar');
            texto.textContent = 'Exhala...';
            fase = 'inhalar';
        }
    }
    
    ciclo();
    respiracionInterval = setInterval(ciclo, 4000);
}

function guardarPausaConsciente() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    const sentimiento = document.getElementById('pausa-sentimiento').value.trim();
    const pensamiento = document.getElementById('pausa-pensamiento').value.trim();
    
    if (!sentimiento && !pensamiento) {
        mostrarNotificacion('⚠️ Escribe al menos un pensamiento o sentimiento', 'warning');
        return;
    }
    
    const pausas = JSON.parse(localStorage.getItem(`pausas-${email}`) || '[]');
    pausas.push({
        fecha,
        hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
        sentimiento,
        pensamiento
    });
    
    localStorage.setItem(`pausas-${email}`, JSON.stringify(pausas));
    
    document.getElementById('pausa-sentimiento').value = '';
    document.getElementById('pausa-pensamiento').value = '';
    
    mostrarNotificacion('🧘‍♀️ Tu pausa consciente ha sido guardada', 'success');
}

// ========================================
// CALMA Y BIENESTAR
// ========================================

let calmaRespiracionActiva = false;
let calmaRespiracionInterval = null;
let contadorResp = 0;

const afirmacionesCalma = [
    '"Estoy segura. Estoy en paz. Todo está bien en este momento."',
    '"Inhalo calma, exhalo tensión. Estoy a salvo."',
    '"Este momento pasará. Soy más fuerte de lo que creo."',
    '"Mi mente está tranquila, mi corazón está en paz."',
    '"Elijo soltar lo que no puedo controlar."',
    '"Cada respiración me acerca más a la calma."',
    '"Soy capaz de manejar lo que venga. Confío en mí."',
    '"La ansiedad es temporal. Mi paz interior es permanente."',
    '"Me permito descansar. Me permito estar bien."',
    '"Estoy exactamente donde necesito estar."',
    '"Mi cuerpo sabe cómo relajarse. Lo dejo fluir."',
    '"Soy gentil conmigo misma en este momento."'
];

function iniciarRespiracionCalma() {
    const circulo = document.getElementById('circulo-calma');
    const texto = document.getElementById('texto-calma');
    const btn = document.querySelector('.btn-calma-respirar');
    const tipo = document.getElementById('tipo-respiracion').value;
    
    if (calmaRespiracionActiva) {
        calmaRespiracionActiva = false;
        clearInterval(calmaRespiracionInterval);
        circulo.classList.remove('inhalar', 'mantener', 'exhalar');
        texto.textContent = 'Respira';
        btn.textContent = '🌬️ Comenzar';
        return;
    }
    
    calmaRespiracionActiva = true;
    btn.textContent = '⏹️ Detener';
    contadorResp = 0;
    document.getElementById('contador-resp').textContent = '0';
    
    let tiempos = { inhalar: 4000, mantener: 7000, exhalar: 8000 };
    if (tipo === 'equilibrio') {
        tiempos = { inhalar: 4000, mantener: 4000, exhalar: 4000 };
    } else if (tipo === 'rapida') {
        tiempos = { inhalar: 3000, mantener: 3000, exhalar: 3000 };
    }
    
    let fase = 'inhalar';
    
    function ejecutarFase() {
        if (!calmaRespiracionActiva) return;
        
        circulo.classList.remove('inhalar', 'mantener', 'exhalar');
        
        if (fase === 'inhalar') {
            circulo.classList.add('inhalar');
            texto.textContent = 'Inhala...';
            setTimeout(() => { if (calmaRespiracionActiva) { fase = 'mantener'; ejecutarFase(); } }, tiempos.inhalar);
        } else if (fase === 'mantener') {
            circulo.classList.add('mantener');
            texto.textContent = 'Mantén...';
            setTimeout(() => { if (calmaRespiracionActiva) { fase = 'exhalar'; ejecutarFase(); } }, tiempos.mantener);
        } else {
            circulo.classList.add('exhalar');
            texto.textContent = 'Exhala...';
            contadorResp++;
            document.getElementById('contador-resp').textContent = contadorResp;
            setTimeout(() => { if (calmaRespiracionActiva) { fase = 'inhalar'; ejecutarFase(); } }, tiempos.exhalar);
        }
    }
    
    ejecutarFase();
}

function nuevaAfirmacionCalma() {
    const texto = document.getElementById('afirmacion-calma-texto');
    const indice = Math.floor(Math.random() * afirmacionesCalma.length);
    texto.textContent = afirmacionesCalma[indice];
    texto.style.animation = 'none';
    setTimeout(() => { texto.style.animation = 'fadeIn 0.5s ease'; }, 10);
}

function guardarGrounding() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    
    const datos = {
        ver: document.getElementById('grounding-5').value.trim(),
        tocar: document.getElementById('grounding-4').value.trim(),
        oir: document.getElementById('grounding-3').value.trim(),
        oler: document.getElementById('grounding-2').value.trim(),
        saborear: document.getElementById('grounding-1').value.trim()
    };
    
    if (!datos.ver && !datos.tocar && !datos.oir) {
        mostrarNotificacion('⚠️ Completa al menos 3 sentidos', 'warning');
        return;
    }
    
    const groundings = JSON.parse(localStorage.getItem(`groundings-${email}`) || '[]');
    groundings.push({ fecha, hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}), ...datos });
    localStorage.setItem(`groundings-${email}`, JSON.stringify(groundings));
    
    ['grounding-5', 'grounding-4', 'grounding-3', 'grounding-2', 'grounding-1'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    mostrarNotificacion('🌍 Tu momento de calma ha sido guardado', 'success');
}

function liberarPensamientos() {
    const textarea = document.getElementById('pensamientos-liberar');
    const texto = textarea.value.trim();
    
    if (!texto) {
        mostrarNotificacion('📝 Escribe algo que quieras soltar', 'warning');
        return;
    }
    
    textarea.style.transition = 'opacity 2s ease, transform 2s ease';
    textarea.style.opacity = '0';
    textarea.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        textarea.value = '';
        textarea.style.opacity = '1';
        textarea.style.transform = 'translateY(0)';
        mostrarNotificacion('🍃 Has dejado ir esos pensamientos. Respira profundo.', 'success');
    }, 2000);
}

function guardarReflexionCalma() {
    const email = localStorage.getItem('userEmail') || 'anonimo';
    const fecha = new Date().toISOString().split('T')[0];
    const texto = document.getElementById('pensamientos-liberar').value.trim();
    
    if (!texto) {
        mostrarNotificacion('📝 Escribe una reflexión primero', 'warning');
        return;
    }
    
    const reflexiones = JSON.parse(localStorage.getItem(`reflexiones-calma-${email}`) || '[]');
    reflexiones.push({ fecha, hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}), texto });
    localStorage.setItem(`reflexiones-calma-${email}`, JSON.stringify(reflexiones));
    
    document.getElementById('pensamientos-liberar').value = '';
    mostrarNotificacion('💜 Tu reflexión ha sido guardada', 'success');
}
