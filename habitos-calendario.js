const HABITOS_LISTA = [
    { id: 'agradecer', emoji: '✨', nombre: 'Agradecer a Dios', color: '#fff8e7' },
    { id: 'afirmacion', emoji: '💭', nombre: 'Frase de afirmación', color: '#f3e5f5' },
    { id: 'maquillaje', emoji: '💄', nombre: 'Maquillaje', color: '#fce4ec' },
    { id: 'ejercicio', emoji: '🏃‍♀️', nombre: 'Ejercicio', color: '#e8f5e9' },
    { id: 'estiramientos', emoji: '🧘‍♀️', nombre: 'Estiramientos', color: '#fff3e0' },
    { id: 'desayuno', emoji: '🍳', nombre: 'Desayuno saludable', color: '#fef5e7' },
    { id: 'agua', emoji: '💧', nombre: '8 vasos de agua', color: '#e3f2fd' },
    { id: 'leer', emoji: '📖', nombre: 'Leer 15 minutos', color: '#f1f8e9' },
    { id: 'dormir', emoji: '🌙', nombre: 'Dormir bien', color: '#e8eaf6' },
    { id: 'diario', emoji: '📝', nombre: 'Escribir en el diario', color: '#fff8e7' },
    { id: 'musica', emoji: '🎵', nombre: 'Música motivadora', color: '#fce4ec' },
    { id: 'skincare', emoji: '🧖‍♀️', nombre: 'Cuidado de la piel', color: '#f3e5f5' },
    { id: 'caminar', emoji: '🚶‍♀️', nombre: 'Caminar al aire libre', color: '#e8f5e9' },
    { id: 'meditacion', emoji: '🙏', nombre: 'Meditación', color: '#fff3e0' },
    { id: 'desconectar', emoji: '📱', nombre: 'Desconectar 1 hora', color: '#e3f2fd' }
];

const MENSAJES_MOTIVACION = [
    '✨ Hoy eres tu prioridad. Un hábito a la vez, estás floreciendo.',
    '🌸 Cada pequeño paso te acerca a la mejor versión de ti.',
    '💫 Tu disciplina de hoy es tu libertad de mañana.',
    '🌺 Confía en el proceso. Estás creciendo hermosamente.',
    '🦋 Hoy eliges cuidarte con amor y dedicación.'
];

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let habitosDelMes = {};
let horariosHabitos = {};

async function mostrarCalendarioHabitosPremium() {
    if (!esPremium()) {
        mostrarMensajePremium();
        return;
    }
    
    mostrarSeccion('habitos-calendario');
    cargarHabitosDelMes();
    verificarNotificaciones();
}

function mostrarCalendarioHabitos() {
    const container = document.getElementById('contenido-habitos-calendario');
    if (!container) return;
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    container.innerHTML = `
        <div style="padding: 1rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
            <div style="text-align: center; margin-bottom: 2rem; width: 100%;">
                <h1 style="color: #d63384; font-size: 2.5rem; margin-bottom: 0.5rem;">
                    🌸 Calendario de Hábitos 🌸
                </h1>
                <p style="color: #8b7d7d; font-size: 1.1rem;">
                    Construye la mejor versión de ti misma, un día a la vez
                </p>
                <button onclick="activarNotificacionesHabitos()" style="margin-top: 1rem; background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: bold; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(244, 197, 66, 0.4);">
                    🔔 Activar recordatorios
                </button>
            </div>

            <div style="border-radius: 20px; padding: 0; margin-bottom: 2rem; width: 100%; max-width: 900px;">
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 2rem; gap: 0.5rem;">
                    <div style="text-align: left;">
                        <button onclick="cambiarMes(-1)" style="background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: bold; box-shadow: 0 4px 15px rgba(244, 197, 66, 0.3);">
                            ← Anterior
                        </button>
                    </div>
                    
                    <h2 style="color: #d63384; font-size: 1.8rem; margin: 0; text-align: center; white-space: nowrap;">
                        ${meses[mesActual]} ${anioActual}
                    </h2>
                    
                    <div style="text-align: right;">
                        <button onclick="cambiarMes(1)" style="background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 10px; cursor: pointer; font-size: 1rem; font-weight: bold; box-shadow: 0 4px 15px rgba(244, 197, 66, 0.3);">
                            Siguiente →
                        </button>
                    </div>
                </div>

                <div id="calendario-grid"></div>
            </div>

            <div id="panel-habitos-dia" style="border-radius: 20px; padding: 1rem; width: 100%; max-width: 900px;"></div>
        </div>
    `;
    
    renderizarCalendario();
    
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    abrirPanelHabitos(fechaHoy, hoy.getDate());
}

function renderizarCalendario() {
    const grid = document.getElementById('calendario-grid');
    if (!grid) return;
    
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();
    
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    let html = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 0 0.5rem;">';
    
    diasSemana.forEach(dia => {
        html += `<div style="text-align: center; font-weight: bold; color: #d63384; padding: 0.5rem; font-size: 1.1rem;">${dia}</div>`;
    });
    
    for (let i = 0; i < diaSemanaInicio; i++) {
        html += '<div></div>';
    }
    
    const hoy = new Date();
    const esHoy = (dia) => {
        return dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();
    };
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const habitosCompletados = habitosDelMes[fecha] || [];
        const porcentaje = habitosCompletados.length > 0 ? Math.round((habitosCompletados.length / HABITOS_LISTA.length) * 100) : 0;
        
        const esHoyDia = esHoy(dia);
        const borderColor = esHoyDia ? '#f4c542' : '#ffe9f3';
        const bgColor = porcentaje > 0 ? `linear-gradient(135deg, rgba(244, 197, 66, ${porcentaje/100}) 0%, rgba(255, 233, 243, 0.8) 100%)` : '#ffffff';
        
        html += `
            <div onclick="abrirPanelHabitos('${fecha}', ${dia})" style="
                background: ${bgColor};
                border: 3px solid ${borderColor};
                border-radius: 15px;
                padding: 0.8rem 0.5rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                aspect-ratio: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-shadow: ${esHoyDia ? '0 4px 15px rgba(244, 197, 66, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'};
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div style="font-size: 1.4rem; font-weight: bold; color: ${esHoyDia ? '#f4c542' : '#d63384'}; line-height: 1.2; display: flex; align-items: center; justify-content: center; ${habitosCompletados.length > 0 ? 'margin-bottom: 0.3rem;' : 'margin-top: 0.1rem;'}">
                    ${dia}
                </div>
                ${habitosCompletados.length > 0 ? `
                    <div style="font-size: 0.7rem; color: #8b7d7d; line-height: 1; margin-bottom: 0.2rem;">
                        ${habitosCompletados.length}/${HABITOS_LISTA.length}
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1;">
                        ${porcentaje === 100 ? '🌟' : porcentaje >= 75 ? '⭐' : porcentaje >= 50 ? '✨' : '💫'}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    grid.innerHTML = html;
}

function abrirPanelHabitos(fecha, dia) {
    const panel = document.getElementById('panel-habitos-dia');
    if (!panel) return;
    
    const habitosCompletados = habitosDelMes[fecha] || [];
    const porcentaje = Math.round((habitosCompletados.length / HABITOS_LISTA.length) * 100);
    const mensajeMotivacion = MENSAJES_MOTIVACION[Math.floor(Math.random() * MENSAJES_MOTIVACION.length)];
    const horariosHoy = horariosHabitos[fecha] || {};
    
    let mensajeProgreso = '';
    if (habitosCompletados.length === 0) {
        mensajeProgreso = '🌱 Comienza tu día con amor propio';
    } else if (habitosCompletados.length < 5) {
        mensajeProgreso = `🌸 ¡Vas bien! Completaste ${habitosCompletados.length} hábitos`;
    } else if (habitosCompletados.length < 10) {
        mensajeProgreso = `✨ ¡Increíble! Ya llevas ${habitosCompletados.length} hábitos`;
    } else if (habitosCompletados.length < 15) {
        mensajeProgreso = `🌟 ¡Casi lo logras! ${habitosCompletados.length} de ${HABITOS_LISTA.length}`;
    } else {
        mensajeProgreso = '🎉 ¡Completaste todos tus hábitos! Eres increíble';
    }
    
    panel.innerHTML = `
        <div style="background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%); padding: 2rem 1.5rem; border-radius: 20px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(214, 51, 132, 0.15); min-height: 120px;">
            <div style="display: flex; align-items: center; justify-content: flex-start; gap: 1.5rem; height: 100%;">
                <img src="mujer-mariposas.png" style="width: 90px; height: 90px; object-fit: contain; opacity: 0.95; flex-shrink: 0;">
                <p style="color: #880e4f; font-size: 1.15rem; font-weight: 600; margin: 0; line-height: 1.6; flex: 1; text-align: left;">
                    ${mensajeMotivacion}
                </p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; gap: 0.8rem; margin-bottom: 2rem;">
            ${HABITOS_LISTA.map(habito => {
                const completado = habitosCompletados.includes(habito.id);
                const horario = horariosHoy[habito.id] || '';
                return `
                    <div style="
                        background: ${completado ? 'linear-gradient(135deg, #d81b60 0%, #ec407a 100%)' : habito.color};
                        border: none;
                        border-radius: 15px;
                        padding: 1rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 3px 10px ${completado ? 'rgba(216, 27, 96, 0.3)' : 'rgba(0,0,0,0.08)'};
                    ">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; margin-bottom: ${horario ? '0.8rem' : '0'};">
                            <div onclick="toggleHabito('${fecha}', '${habito.id}')" style="display: flex; align-items: center; gap: 0.8rem; flex: 1; cursor: pointer;">
                                <div style="font-size: 2rem; line-height: 1; display: flex; align-items: center; justify-content: center;">${habito.emoji}</div>
                                <div style="flex: 1; display: flex; align-items: center;">
                                    <span style="font-weight: 600; color: ${completado ? 'white' : '#6d1b7b'}; font-size: 0.95rem; line-height: 1.3;">
                                        ${habito.nombre}
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.6rem;">
                                <div onclick="toggleHabito('${fecha}', '${habito.id}')" style="width: 26px; height: 26px; border-radius: 8px; border: 3px solid ${completado ? 'white' : '#d81b60'}; background: ${completado ? 'white' : 'transparent'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; flex-shrink: 0;">
                                    ${completado ? '✓' : ''}
                                </div>
                                <button onclick="abrirModalHorario('${fecha}', '${habito.id}', '${habito.nombre}')" style="background: rgba(255,255,255,0.3); border: 2px solid ${completado ? 'white' : '#d81b60'}; color: ${completado ? 'white' : '#6d1b7b'}; padding: 0.4rem 0.6rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; white-space: nowrap; flex-shrink: 0; display: flex; align-items: center; line-height: 1;">
                                    🕐
                                </button>
                            </div>
                        </div>
                        ${horario ? `
                            <div style="text-align: center; padding: 0.5rem; background: rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.8rem; color: ${completado ? 'white' : '#6d1b7b'}; font-weight: 600; line-height: 1.2;">
                                ⏰ ${horario}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>

        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 2rem 1.5rem; border-radius: 20px; text-align: center; box-shadow: 0 4px 15px rgba(244, 197, 66, 0.3);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.8rem; margin-bottom: 1.2rem;">
                <span style="font-size: 2.2rem;">${porcentaje === 100 ? '👑' : '🌻'}</span>
                <p style="color: ${porcentaje === 100 ? '#c2185b' : '#f57c00'}; font-size: 1.2rem; font-weight: 700; margin: 0; line-height: 1.4;">
                    ${mensajeProgreso}
                </p>
            </div>
            
            <div style="width: 100%; height: 35px; background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,224,178,0.5) 100%); border-radius: 20px; overflow: hidden; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1rem; position: relative;">
                <div style="width: ${porcentaje}%; height: 100%; background: linear-gradient(135deg, #d81b60 0%, #ec407a 50%, #f06292 100%); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: 0 2px 10px rgba(216, 27, 96, 0.4);">
                    ${porcentaje > 0 ? `
                        <span style="color: white; font-weight: 700; font-size: 0.95rem; text-shadow: 0 1px 3px rgba(0,0,0,0.3); z-index: 2; position: relative;">
                            ${porcentaje}%
                        </span>
                        <div style="position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%); animation: shimmer 2s infinite;"></div>
                    ` : ''}
                </div>
                ${porcentaje === 0 ? `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #d81b60; font-weight: 600; font-size: 0.9rem;">
                        0%
                    </div>
                ` : ''}
            </div>
            
            <p style="color: ${porcentaje === 100 ? '#c2185b' : '#f57c00'}; font-size: ${porcentaje === 100 ? '1.1rem' : '0.95rem'}; margin: 0; font-weight: ${porcentaje === 100 ? '700' : '600'}; line-height: 1.5;">
                ${porcentaje === 100 ? '✨ ¡Eres una REINA! Hoy conquistaste cada hábito con disciplina y amor propio 👑💖' : 'Hoy siembras disciplina con amor propio 💝'}
            </p>
        </div>
    `;
}


async function toggleHabito(fecha, habitoId) {
    const habitosActuales = habitosDelMes[fecha] || [];
    let nuevosHabitos;
    const estaCompletando = !habitosActuales.includes(habitoId);
    
    if (habitosActuales.includes(habitoId)) {
        nuevosHabitos = habitosActuales.filter(h => h !== habitoId);
    } else {
        nuevosHabitos = [...habitosActuales, habitoId];
    }
    
    habitosDelMes[fecha] = nuevosHabitos;
    
    try {
        const res = await fetch('/api/habitos-calendario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                fecha: fecha,
                habitos_completados: nuevosHabitos
            })
        });
        
        if (res.ok) {
            const dia = parseInt(fecha.split('-')[2]);
            renderizarCalendario();
            abrirPanelHabitos(fecha, dia);
            
            if (estaCompletando) {
                mostrarAnimacionRecompensa();
            }
            
            if (nuevosHabitos.length === HABITOS_LISTA.length) {
                mostrarAnimacionTodosCompletos();
            }
        }
    } catch (error) {
        console.error('Error al guardar hábito:', error);
    }
}

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

async function cargarHabitosDelMes() {
    try {
        const res = await fetch(`/api/habitos-calendario?mes=${mesActual + 1}&anio=${anioActual}`, {
            credentials: 'include'
        });
        
        if (res.ok) {
            const data = await res.json();
            habitosDelMes = {};
            horariosHabitos = {};
            data.habitos.forEach(h => {
                const fecha = h.fecha.split('T')[0];
                habitosDelMes[fecha] = h.habitos_completados || [];
                horariosHabitos[fecha] = h.horarios_habitos || {};
            });
            mostrarCalendarioHabitos();
        }
    } catch (error) {
        console.error('Error al cargar hábitos:', error);
    }
}

function cambiarMes(direccion) {
    mesActual += direccion;
    if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
    } else if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
    }
    cargarHabitosDelMes();
}

function verificarNotificaciones() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    const habitosHoy = habitosDelMes[fecha] || [];
    const faltantes = HABITOS_LISTA.length - habitosHoy.length;
    
    if (hora === 9 && faltantes === HABITOS_LISTA.length) {
        mostrarNotificacion('¡Buenos días! ☀️', 'Es hora de comenzar tu día con hábitos positivos 🌸');
    } else if (hora === 20 && faltantes > 0) {
        mostrarNotificacion('Recordatorio 🌙', `Te faltan ${faltantes} hábitos por completar hoy. ¡Tú puedes! 💪`);
    } else if (hora === 12 && faltantes > HABITOS_LISTA.length / 2) {
        mostrarNotificacion('Medio día ⏰', '¿Cómo va tu día? Recuerda tus hábitos saludables 🌺');
    }
}

function mostrarNotificacion(titulo, mensaje) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(titulo, {
            body: mensaje,
            icon: '/icon-512.png',
            badge: '/icon-512.png'
        });
    }
    
    const notif = document.createElement('div');
    notif.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 10000; max-width: 350px; animation: slideIn 0.3s ease;">
            <div style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">${titulo}</div>
            <div style="font-size: 1rem;">${mensaje}</div>
        </div>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

let horarioSeleccionado = '';
let fechaActualHorario = '';
let habitoIdActualHorario = '';

function abrirModalHorario(fecha, habitoId, habitoNombre) {
    const horariosHoy = horariosHabitos[fecha] || {};
    const horarioActual = horariosHoy[habitoId] || '';
    horarioSeleccionado = horarioActual;
    fechaActualHorario = fecha;
    habitoIdActualHorario = habitoId;
    
    const horasComunes = [
        '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
    ];
    
    const modal = document.createElement('div');
    modal.id = 'modal-horario-habito';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 1rem; overflow-y: auto;">
            <div style="background: white; border-radius: 25px; padding: 1.5rem; max-width: 380px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); margin: 1rem;">
                <h2 style="color: #d63384; text-align: center; margin: 0 0 0.5rem 0; font-size: 1.3rem;">
                    ⏰ Selecciona la Hora
                </h2>
                <p style="text-align: center; color: #8b7d7d; margin-bottom: 1rem; font-size: 0.9rem;">
                    ${habitoNombre}
                </p>
                
                <div id="horas-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1rem;">
                    ${horasComunes.map(hora => `
                        <button class="btn-hora" data-hora="${hora}" style="padding: 12px 8px; background: ${horarioActual === hora ? 'linear-gradient(135deg, #d81b60, #ec407a)' : '#fff0f5'}; color: ${horarioActual === hora ? 'white' : '#d63384'}; border: 2px solid #d63384; border-radius: 12px; font-weight: bold; font-size: 0.85rem; cursor: pointer;">
                            ${hora}
                        </button>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-bottom: 1rem;">
                    <p style="color: #666; font-size: 0.8rem; margin-bottom: 0.5rem;">O escribe otra hora:</p>
                    <input type="text" id="input-hora-custom" placeholder="Ej: 2:10 PM" value="${horarioActual && !horasComunes.includes(horarioActual) ? horarioActual : ''}" style="width: 60%; padding: 10px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem; text-align: center;">
                </div>
                
                <div style="display: flex; gap: 0.8rem;">
                    <button id="btn-guardar-horario" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #d81b60 0%, #ec407a 100%); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1rem;">
                        💾 Guardar
                    </button>
                    <button id="btn-cancelar-horario" style="flex: 1; padding: 12px; background: #e0e0e0; color: #666; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1rem;">
                        ✕ Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para botones de hora
    document.querySelectorAll('.btn-hora').forEach(btn => {
        btn.addEventListener('click', function() {
            horarioSeleccionado = this.dataset.hora;
            // Resaltar seleccionado
            document.querySelectorAll('.btn-hora').forEach(b => {
                b.style.background = '#fff0f5';
                b.style.color = '#d63384';
            });
            this.style.background = 'linear-gradient(135deg, #d81b60, #ec407a)';
            this.style.color = 'white';
            // Limpiar campo custom
            document.getElementById('input-hora-custom').value = '';
        });
    });
    
    // Event listener para input custom
    document.getElementById('input-hora-custom').addEventListener('input', function() {
        if (this.value.trim()) {
            horarioSeleccionado = this.value.trim();
            // Quitar selección de botones
            document.querySelectorAll('.btn-hora').forEach(b => {
                b.style.background = '#fff0f5';
                b.style.color = '#d63384';
            });
        }
    });
    
    document.getElementById('btn-guardar-horario').addEventListener('click', function() {
        // Verificar si hay hora custom escrita
        const inputCustom = document.getElementById('input-hora-custom');
        if (inputCustom && inputCustom.value.trim()) {
            horarioSeleccionado = inputCustom.value.trim();
        }
        guardarHorarioHabito(fechaActualHorario, habitoIdActualHorario);
    });
    
    document.getElementById('btn-cancelar-horario').addEventListener('click', cerrarModalHorario);
}

function cerrarModalHorario() {
    const modal = document.getElementById('modal-horario-habito');
    if (modal) modal.remove();
}

async function guardarHorarioHabito(fecha, habitoId) {
    const input = document.getElementById('input-horario-habito');
    
    // Usar valor del input O variable global (para compatibilidad iOS)
    let horario = '';
    if (input && input.value) {
        horario = input.value.trim();
    } else if (horarioSeleccionado) {
        horario = horarioSeleccionado.trim();
    }
    
    console.log('Horario ingresado:', horario);
    
    if (!horario || horario === '') {
        alert('⏰ Por favor selecciona una hora');
        return;
    }
    
    // Obtener horarios existentes y agregar/actualizar el nuevo
    const horariosHoy = horariosHabitos[fecha] ? {...horariosHabitos[fecha]} : {};
    horariosHoy[habitoId] = horario;
    horariosHabitos[fecha] = horariosHoy;
    
    try {
        const habitosCompletados = habitosDelMes[fecha] || [];
        console.log('Guardando horarios:', horariosHoy);
        
        const res = await fetch('/api/habitos-calendario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                fecha: fecha,
                habitos_completados: habitosCompletados,
                horarios_habitos: horariosHoy
            })
        });
        
        if (res.ok) {
            cerrarModalHorario();
            const dia = parseInt(fecha.split('-')[2]);
            abrirPanelHabitos(fecha, dia);
            mostrarNotificacion('✅ Horario guardado', `Te recordaremos a las ${horario} 🕐`);
            iniciarVerificadorNotificaciones();
        } else {
            const errorData = await res.json();
            console.error('Error del servidor:', errorData);
            alert('Error al guardar: ' + (errorData.error || 'Intenta de nuevo'));
        }
    } catch (error) {
        console.error('Error al guardar horario:', error);
        alert('Error de conexión. Intenta de nuevo.');
    }
}

function solicitarPermisosNotificacion() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                mostrarNotificacion('🎉 ¡Notificaciones activadas!', 'Te recordaremos tus hábitos a la hora que configuraste');
            }
        });
    }
}

function iniciarVerificadorNotificaciones() {
    if (window.verificadorNotificacionesHabitos) {
        clearInterval(window.verificadorNotificacionesHabitos);
    }
    
    window.verificadorNotificacionesHabitos = setInterval(() => {
        verificarHorariosYNotificar();
    }, 60000);
    
    verificarHorariosYNotificar();
}

function verificarHorariosYNotificar() {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
    
    const horariosHoy = horariosHabitos[fecha] || {};
    const habitosCompletadosHoy = habitosDelMes[fecha] || [];
    
    HABITOS_LISTA.forEach(habito => {
        const horarioProgramado = horariosHoy[habito.id];
        if (horarioProgramado && horarioProgramado === horaActual) {
            const yaCompletado = habitosCompletadosHoy.includes(habito.id);
            if (!yaCompletado) {
                mostrarNotificacion(
                    `⏰ ${habito.emoji} Hora de tu hábito`,
                    `${habito.nombre} - Es tu momento de brillar 🌟`
                );
            }
        }
    });
}

if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(solicitarPermisosNotificacion, 2000);
}

// ===== NOTIFICACIONES PUSH (funcionan fuera de la app) =====
async function registrarServiceWorkerPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push no soportado en este navegador');
        return null;
    }
    
    try {
        // Mismo service worker que el resto de la app: así no se reemplazan entre sí
        await navigator.serviceWorker.register('/service-worker.js');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker registrado:', registration);
        return registration;
    } catch (error) {
        console.error('Error registrando Service Worker:', error);
        return null;
    }
}

async function suscribirNotificacionesPush() {
    try {
        console.log('🔔 Iniciando suscripción push...');
        
        if (!('serviceWorker' in navigator)) {
            alert('Tu navegador no soporta notificaciones push');
            return false;
        }
        
        if (!('PushManager' in window)) {
            alert('Tu navegador no soporta notificaciones push');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        console.log('🔔 Permiso:', permission);
        if (permission !== 'granted') {
            alert('Necesitas permitir las notificaciones para recibir recordatorios');
            return false;
        }
        
        const registration = await registrarServiceWorkerPush();
        console.log('🔔 Service Worker:', registration);
        if (!registration) {
            alert('Error registrando el service worker');
            return false;
        }
        
        // Obtener clave pública VAPID
        const res = await fetch('/api/vapid-public-key');
        const data = await res.json();
        const vapidPublicKey = data.publicKey;
        console.log('🔔 VAPID key:', vapidPublicKey ? 'OK' : 'FALTA');
        
        if (!vapidPublicKey) {
            alert('Error: Falta configurar las claves VAPID en el servidor');
            return false;
        }
        
        // Convertir clave a Uint8Array
        const urlBase64ToUint8Array = (base64String) => {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        };
        
        // Suscribirse a push
        console.log('🔔 Suscribiendo al PushManager...');
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
        console.log('🔔 Suscripción creada');
        
        // Enviar suscripción al servidor
        const saveRes = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON() })
        });
        
        const saveData = await saveRes.json();
        console.log('🔔 Respuesta servidor:', saveData);
        
        if (saveRes.ok) {
            console.log('✅ Suscripción push guardada!');
            mostrarNotificacion('🔔 Recordatorios activados', 'Te avisaremos a la hora de tus hábitos mientras tengas Aurora abierta');
            return true;
        } else {
            alert('Error guardando suscripción: ' + (saveData.error || 'desconocido'));
            return false;
        }
    } catch (error) {
        console.error('❌ Error suscribiendo a push:', error.name, error.message);
        alert('Error activando notificaciones: ' + error.message);
        return false;
    }
}

async function probarNotificacionPush() {
    try {
        const res = await fetch('/api/push/test', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            console.log('Notificación de prueba enviada');
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error probando push:', error);
    }
}

async function activarNotificacionesHabitos() {
    const exito = await suscribirNotificacionesPush();
    if (exito) {
        // Enviar notificación de prueba
        setTimeout(probarNotificacionPush, 2000);
    }
}
