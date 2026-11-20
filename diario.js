// ========================================
// DIARIO SCRAPBOOK - FUNCIONALIDAD INTERACTIVA
// ========================================

let canvasElementos = []; // Array para guardar fotos y stickers en el canvas

// ========================================
// SISTEMA DE DETECCIÓN EMOCIONAL Y CARTAS DE EMPODERAMIENTO
// ========================================

const palabrasEmocionales = {
    miedo: ['miedo', 'miedosa', 'asustada', 'asustado', 'aterrorizada', 'terror', 'pánico', 'pavor', 'temor', 'temer', 'temerosa'],
    ansiedad: ['ansiosa', 'ansioso', 'ansiedad', 'agitada', 'agitado', 'nerviosa', 'nervioso', 'nervios', 'intranquila', 'inquieta', 'angustia', 'angustiada', 'preocupada', 'preocupacion', 'desesperada', 'desesperacion'],
    tristeza: ['triste', 'tristeza', 'deprimida', 'deprimido', 'sola', 'soledad', 'vacía', 'vacio', 'melancolía', 'melancolica', 'desanimada', 'decaída', 'abatida', 'llorando', 'llorar', 'lagrimas'],
    inseguridad: ['insegura', 'inseguro', 'dudo', 'dudas', 'no puedo', 'incapaz', 'inútil', 'fracaso', 'fracasada', 'perdedora', 'no valgo', 'no sirvo', 'no soy suficiente', 'no merezco'],
    estres: ['estrés', 'estres', 'estresada', 'agotada', 'agotamiento', 'exhausta', 'cansada', 'cansancio', 'abrumada', 'saturada', 'presión', 'presion', 'colapso', 'no aguanto'],
    enojo: ['enojada', 'enojo', 'rabia', 'ira', 'furiosa', 'frustrada', 'frustracion', 'harta', 'molesta', 'indignada']
};

const cartasEmpoderamiento = {
    miedo: {
        titulo: "Tu Fuerza es Mayor que tu Miedo",
        emoji: "🦋",
        mensaje: `Hermosa guerrera,

Sé que el miedo puede sentirse abrumador, como una ola que amenaza con arrastrarte. Pero quiero que sepas algo importante: el miedo es solo una emoción, no es tu realidad.

Cada vez que has sentido miedo antes, lo has superado. Eres más fuerte de lo que crees. La valentía no es ausencia de miedo, es actuar a pesar de él.

Respira profundo. Inhala valor, exhala miedo.

Recuerda: Eres capaz de atravesar cualquier tormenta. Ya lo has demostrado antes, y lo harás de nuevo.

💜 Estás protegida. Estás guiada. Estás a salvo.`,
        afirmacion: "Soy más fuerte que mis miedos. Tengo el poder de superar cualquier desafío."
    },
    ansiedad: {
        titulo: "Calma en la Tormenta",
        emoji: "🌸",
        mensaje: `Querida alma valiente,

Tu mente está acelerada, lo sé. Pero este momento pasará. La ansiedad es solo tu cuerpo tratando de protegerte, aunque a veces se excede.

Hagamos algo juntas: 
- Respira profundo 4 segundos
- Sostén 4 segundos  
- Exhala 6 segundos

Tu presente está seguro. Este momento está bien. Tú estás bien.

No tienes que resolver todo ahora mismo. Solo necesitas atravesar este momento, y puedes hacerlo.

💜 Estás aquí. Estás presente. Estás a salvo.`,
        afirmacion: "Mi calma interior es más poderosa que cualquier tormenta. Elijo la paz ahora mismo."
    },
    tristeza: {
        titulo: "Tu Luz Sigue Brillando",
        emoji: "🌻",
        mensaje: `Mi querida,

La tristeza que sientes es válida. Cada emoción merece ser sentida y honrada. Pero quiero recordarte algo: la oscuridad que ves ahora no es permanente.

Al igual que la noche da paso al amanecer, tu tristeza dará paso a la alegría. Esto es temporal.

Eres amada. Eres valiosa. Tu existencia importa más de lo que imaginas.

Permítete sentir, pero también permítete sanar. Mereces la felicidad tanto como cualquier persona en este mundo.

💜 No estás sola. Nunca lo estás. Siempre hay luz esperándote.`,
        afirmacion: "Merezco alegría y amor. Mi luz interior brilla incluso en los días oscuros."
    },
    inseguridad: {
        titulo: "Tu Valor es Incuestionable",
        emoji: "👑",
        mensaje: `Reina incomparable,

Esas voces de duda en tu mente no son la verdad. Son solo ecos de miedos antiguos que ya no te sirven.

La verdad es esta: Eres suficiente. Siempre lo has sido. Tu valor no depende de tu productividad, de la opinión de otros, ni de tus logros.

Eres valiosa por el simple hecho de existir.

Mira todo lo que has superado. Mira lo lejos que has llegado. Eso no fue suerte, fue TU fuerza, TU determinación, TU poder.

💜 Eres única. Eres irreemplazable. Eres absolutamente suficiente.`,
        afirmacion: "Soy completamente suficiente tal como soy. Mi valor es inherente y nadie puede quitármelo."
    },
    estres: {
        titulo: "Mereces Descanso y Paz",
        emoji: "🌿",
        mensaje: `Querida luchadora incansable,

Has estado cargando demasiado sobre tus hombros. Pero quiero que sepas: está bien soltar. Está bien pedir ayuda. Está bien descansar.

Tu valor no se mide por cuánto produces o cuánto haces por otros. Mereces cuidarte a ti misma con la misma dedicación con la que cuidas todo lo demás.

Hoy, te doy permiso para:
- Hacer menos
- Pedir ayuda
- Priorizar tu bienestar
- Soltar lo que no puedes controlar

💜 Tu bienestar es la prioridad. Todo lo demás puede esperar.`,
        afirmacion: "Me doy permiso para descansar. Mi paz interior es mi mayor prioridad."
    },
    enojo: {
        titulo: "Tu Fuego es Poder",
        emoji: "🔥",
        mensaje: `Guerrera de corazón ardiente,

Tu enojo es válido. Es una señal de que algo en tu vida necesita cambiar, de que tus límites fueron cruzados, de que mereces más.

El enojo puede ser destructivo o puede ser combustible para el cambio. Elige usarlo como poder para transformar lo que no te sirve.

Pero también recuerda ser gentil contigo misma. Puedes sentir fuego sin dejarte quemar.

Respira. Canaliza esa energía. Úsala para construir la vida que mereces.

💜 Tu poder es real. Tu voz importa. Mereces respeto.`,
        afirmacion: "Transformo mi enojo en poder positivo. Uso mi fuego para crear cambio y proteger mis límites."
    }
};

let ultimaEmocionDetectada = null;
let tiempoUltimaDeteccion = 0;
const TIEMPO_MINIMO_ENTRE_DETECCIONES = 30000; // 30 segundos entre detecciones

function detectarEmocionEnTexto(texto) {
    const textoLower = texto.toLowerCase();
    
    for (const [emocion, palabras] of Object.entries(palabrasEmocionales)) {
        for (const palabra of palabras) {
            if (textoLower.includes(palabra)) {
                return emocion;
            }
        }
    }
    return null;
}

function mostrarCartaEmpoderamiento(emocion) {
    const carta = cartasEmpoderamiento[emocion];
    if (!carta) return;
    
    // Verificar si ya existe un modal
    const modalExistente = document.getElementById('modal-carta-empoderamiento');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const modalHTML = `
        <div id="modal-carta-empoderamiento" class="modal-carta-empoderamiento">
            <div class="carta-empoderamiento-overlay" onclick="cerrarCartaEmpoderamiento()"></div>
            <div class="carta-empoderamiento-contenido">
                <button class="btn-cerrar-carta" onclick="cerrarCartaEmpoderamiento()">×</button>
                <div class="carta-empoderamiento-header">
                    <span class="carta-emoji">${carta.emoji}</span>
                    <h2 class="carta-titulo">${carta.titulo}</h2>
                </div>
                <div class="carta-mensaje">
                    ${carta.mensaje.split('\n').map(linea => `<p>${linea}</p>`).join('')}
                </div>
                <div class="carta-afirmacion">
                    <p class="afirmacion-label">Repite conmigo:</p>
                    <p class="afirmacion-texto">"${carta.afirmacion}"</p>
                </div>
                <div class="carta-acciones">
                    <button class="btn-respiracion" onclick="iniciarEjercicioRespiracion()">
                        🌬️ Ejercicio de Respiración
                    </button>
                    <button class="btn-cerrar-agradecida" onclick="cerrarCartaEmpoderamiento()">
                        💜 Gracias, me siento mejor
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Animación de entrada
    setTimeout(() => {
        const modal = document.getElementById('modal-carta-empoderamiento');
        if (modal) {
            modal.classList.add('visible');
        }
    }, 10);
}

function cerrarCartaEmpoderamiento() {
    const modal = document.getElementById('modal-carta-empoderamiento');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
    }
}

function iniciarEjercicioRespiracion() {
    const contenido = document.querySelector('.carta-empoderamiento-contenido');
    if (!contenido) return;
    
    contenido.innerHTML = `
        <button class="btn-cerrar-carta" onclick="cerrarCartaEmpoderamiento()">×</button>
        <div class="ejercicio-respiracion">
            <h2>🌬️ Respiración Guiada</h2>
            <div class="circulo-respiracion" id="circulo-respiracion">
                <span id="texto-respiracion">Prepárate...</span>
            </div>
            <p class="instruccion-respiracion">Sigue el ritmo del círculo</p>
            <button class="btn-cerrar-agradecida" onclick="cerrarCartaEmpoderamiento()" style="margin-top: 2rem;">
                💜 Terminar ejercicio
            </button>
        </div>
    `;
    
    // Iniciar ciclo de respiración
    let fase = 0;
    const fases = [
        { texto: 'Inhala...', duracion: 4000, clase: 'inhalar' },
        { texto: 'Sostén...', duracion: 4000, clase: 'sostener' },
        { texto: 'Exhala...', duracion: 6000, clase: 'exhalar' }
    ];
    
    function siguienteFase() {
        const circulo = document.getElementById('circulo-respiracion');
        const texto = document.getElementById('texto-respiracion');
        
        if (!circulo || !texto) return;
        
        const faseActual = fases[fase];
        circulo.className = 'circulo-respiracion ' + faseActual.clase;
        texto.textContent = faseActual.texto;
        
        fase = (fase + 1) % fases.length;
        setTimeout(siguienteFase, faseActual.duracion);
    }
    
    setTimeout(siguienteFase, 1000);
}

function inicializarDeteccionEmocional() {
    const textareas = [
        document.getElementById('diario-texto-entrada'),
        document.getElementById('texto-diario')
    ];
    
    textareas.forEach(textarea => {
        if (textarea) {
            textarea.addEventListener('input', function(e) {
                const texto = e.target.value;
                const ahora = Date.now();
                
                // Solo detectar si el texto tiene al menos 20 caracteres
                if (texto.length < 20) return;
                
                // Verificar tiempo mínimo entre detecciones
                if (ahora - tiempoUltimaDeteccion < TIEMPO_MINIMO_ENTRE_DETECCIONES) return;
                
                const emocionDetectada = detectarEmocionEnTexto(texto);
                
                if (emocionDetectada && emocionDetectada !== ultimaEmocionDetectada) {
                    ultimaEmocionDetectada = emocionDetectada;
                    tiempoUltimaDeteccion = ahora;
                    
                    // Pequeño delay para no interrumpir la escritura
                    setTimeout(() => {
                        mostrarCartaEmpoderamiento(emocionDetectada);
                    }, 500);
                }
            });
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarDeteccionEmocional();
});
let elementoSeleccionado = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let fondoActual = 'linear-gradient(135deg, #fef9f3 0%, #fff 50%, #fef5f9 100%)'; // Fondo por defecto

// Cambiar entre tabs del canvas
function cambiarTabCanvas(tab) {
    // Remover clase active de todos los tabs y paneles
    document.querySelectorAll('.canvas-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.canvas-panel').forEach(p => p.classList.remove('active'));
    
    // Activar tab y panel correspondiente
    event.target.classList.add('active');
    document.getElementById(`panel-${tab}`).classList.add('active');
    
    // Si es la galería, cargarla
    if (tab === 'galeria') {
        cargarGaleriaFotos();
    }
}

// Guardar foto en galería personal
function guardarEnGaleria(fotoBase64) {
    let galeria = JSON.parse(localStorage.getItem('galeria_fotos') || '[]');
    
    // No duplicar si ya existe
    if (!galeria.includes(fotoBase64)) {
        galeria.unshift(fotoBase64);
        // Mantener máximo 50 fotos
        if (galeria.length > 50) {
            galeria = galeria.slice(0, 50);
        }
        localStorage.setItem('galeria_fotos', JSON.stringify(galeria));
    }
}

// Cargar galería de fotos guardadas
function cargarGaleriaFotos() {
    const galeriaDiv = document.getElementById('galeria-fotos');
    const galeria = JSON.parse(localStorage.getItem('galeria_fotos') || '[]');
    
    if (galeria.length === 0) {
        galeriaDiv.innerHTML = '<p style="text-align: center; color: #8b7355; opacity: 0.7;">Aún no tienes fotos guardadas. Agrega fotos a tus páginas para verlas aquí.</p>';
        return;
    }
    
    galeriaDiv.innerHTML = galeria.map((foto, index) => `
        <div class="foto-galeria" onclick="agregarFotoDesdeGaleria(${index})">
            <img src="${foto}" alt="Foto ${index + 1}">
            <div class="foto-overlay">+ Usar</div>
        </div>
    `).join('');
}

// Agregar foto desde la galería personal
function agregarFotoDesdeGaleria(index) {
    const galeria = JSON.parse(localStorage.getItem('galeria_fotos') || '[]');
    const fotoSrc = galeria[index];
    
    if (!fotoSrc) return;
    
    const fotoData = {
        type: 'foto',
        src: fotoSrc,
        x: Math.random() * 200 + 50,
        y: Math.random() * 150 + 50,
        rotation: (Math.random() - 0.5) * 20
    };
    
    canvasElementos.push(fotoData);
    renderizarCanvas();
    ocultarPlaceholder();
}

// Agregar foto al canvas
function agregarFotoAlCanvas(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fotoData = {
            type: 'foto',
            src: e.target.result,
            x: Math.random() * 200 + 50,
            y: Math.random() * 150 + 50,
            rotation: (Math.random() - 0.5) * 20,
            scale: 1.0  // Tamaño por defecto
        };
        
        canvasElementos.push(fotoData);
        renderizarCanvas();
        ocultarPlaceholder();
        
        // Guardar en galería personal
        guardarEnGaleria(e.target.result);
    };
    leerFotoReducida(file, reader.onload);
    
    // Reset input
    event.target.value = '';
}

// Agregar sticker al canvas
function agregarStickerAlCanvas(emoji) {
    const stickerData = {
        type: 'sticker',
        emoji: emoji,
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100,
        rotation: (Math.random() - 0.5) * 30
    };
    
    canvasElementos.push(stickerData);
    renderizarCanvas();
    ocultarPlaceholder();
}

// Cambiar fondo del canvas
function cambiarFondoCanvas(fondo) {
    fondoActual = fondo;
    const canvas = document.getElementById('scrapbook-canvas');
    canvas.style.background = fondo;
}

// Agregar texto al canvas
function agregarTextoAlCanvas() {
    const textoData = {
        type: 'texto',
        texto: 'Haz doble clic para editar',
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100,
        fontSize: 24,
        color: '#6b4423',
        fontFamily: 'Georgia, serif'
    };
    
    canvasElementos.push(textoData);
    renderizarCanvas();
    ocultarPlaceholder();
}

// Ocultar placeholder cuando hay elementos
function ocultarPlaceholder() {
    const placeholder = document.querySelector('.canvas-placeholder');
    if (placeholder && canvasElementos.length > 0) {
        placeholder.style.display = 'none';
    }
}

// Renderizar canvas con todos los elementos
function renderizarCanvas() {
    const canvas = document.getElementById('scrapbook-canvas');
    
    // Limpiar canvas (excepto placeholder)
    const placeholder = canvas.querySelector('.canvas-placeholder');
    canvas.innerHTML = '';
    if (placeholder && canvasElementos.length === 0) {
        canvas.appendChild(placeholder);
        placeholder.style.display = 'block';
    }
    
    canvasElementos.forEach((elemento, index) => {
        if (elemento.type === 'foto') {
            const div = document.createElement('div');
            div.className = 'canvas-foto';
            div.style.left = `${elemento.x}px`;
            div.style.top = `${elemento.y}px`;
            const scale = elemento.scale || 1.0;
            div.style.transform = `rotate(${elemento.rotation}deg) scale(${scale})`;
            div.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = elemento.src;
            div.appendChild(img);
            
            // Agregar botones de redimensionar
            const btnMas = document.createElement('button');
            btnMas.innerHTML = '+';
            btnMas.className = 'btn-resize-foto';
            btnMas.style.cssText = 'position: absolute; top: -8px; right: 20px; width: 24px; height: 24px; border-radius: 50%; background: #4CAF50; color: white; border: none; font-size: 16px; cursor: pointer; z-index: 10;';
            btnMas.onclick = (e) => {
                e.stopPropagation();
                canvasElementos[index].scale = Math.min((canvasElementos[index].scale || 1.0) + 0.1, 3.0);
                renderizarCanvas();
            };
            
            const btnMenos = document.createElement('button');
            btnMenos.innerHTML = '-';
            btnMenos.className = 'btn-resize-foto';
            btnMenos.style.cssText = 'position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #f44336; color: white; border: none; font-size: 16px; cursor: pointer; z-index: 10;';
            btnMenos.onclick = (e) => {
                e.stopPropagation();
                canvasElementos[index].scale = Math.max((canvasElementos[index].scale || 1.0) - 0.1, 0.3);
                renderizarCanvas();
            };
            
            div.appendChild(btnMas);
            div.appendChild(btnMenos);
            
            // Eventos para mouse Y touch (celulares)
            div.addEventListener('mousedown', iniciarDrag);
            div.addEventListener('touchstart', iniciarDrag, { passive: false });
            
            canvas.appendChild(div);
        } else if (elemento.type === 'sticker') {
            const div = document.createElement('div');
            div.className = 'canvas-sticker';
            div.textContent = elemento.emoji;
            div.style.left = `${elemento.x}px`;
            div.style.top = `${elemento.y}px`;
            div.style.transform = `rotate(${elemento.rotation}deg)`;
            div.dataset.index = index;
            
            // Eventos para mouse Y touch (celulares)
            div.addEventListener('mousedown', iniciarDrag);
            div.addEventListener('touchstart', iniciarDrag, { passive: false });
            
            canvas.appendChild(div);
        } else if (elemento.type === 'texto') {
            const div = document.createElement('div');
            div.className = 'canvas-texto';
            div.contentEditable = false;
            div.textContent = elemento.texto;
            div.style.left = `${elemento.x}px`;
            div.style.top = `${elemento.y}px`;
            div.style.fontSize = `${elemento.fontSize}px`;
            div.style.color = elemento.color;
            div.style.fontFamily = elemento.fontFamily;
            div.dataset.index = index;
            
            // Eventos para mouse Y touch (celulares)
            div.addEventListener('mousedown', iniciarDrag);
            div.addEventListener('touchstart', iniciarDrag, { passive: false });
            div.addEventListener('dblclick', editarTexto);
            
            canvas.appendChild(div);
        }
    });
}

// Editar texto con doble click
function editarTexto(e) {
    e.stopPropagation();
    const div = e.target;
    const index = parseInt(div.dataset.index);
    
    div.contentEditable = true;
    div.focus();
    
    // Seleccionar todo el texto
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    
    div.addEventListener('blur', function() {
        div.contentEditable = false;
        canvasElementos[index].texto = div.textContent;
    }, { once: true });
    
    div.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            div.blur();
        }
    });
}

// Seleccionar elemento
function seleccionarElemento(e) {
    e.stopPropagation();
    
    // Remover selección anterior
    document.querySelectorAll('.elemento-seleccionado').forEach(el => {
        el.classList.remove('elemento-seleccionado');
        const btnEliminar = el.querySelector('.btn-eliminar-elemento');
        if (btnEliminar) btnEliminar.remove();
    });
    
    // Seleccionar nuevo elemento
    this.classList.add('elemento-seleccionado');
    elementoSeleccionado = parseInt(this.dataset.index);
    
    // Agregar botón de eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-eliminar-elemento';
    btnEliminar.textContent = '×';
    btnEliminar.onclick = (e) => {
        e.stopPropagation();
        eliminarElemento();
    };
    this.appendChild(btnEliminar);
}

// Eliminar elemento seleccionado
function eliminarElemento() {
    if (elementoSeleccionado !== null) {
        canvasElementos.splice(elementoSeleccionado, 1);
        elementoSeleccionado = null;
        renderizarCanvas();
    }
}

// Iniciar drag (con soporte táctil para celulares)
function iniciarDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const elementoActual = this;
    elementoSeleccionado = parseInt(this.dataset.index);
    
    const rect = elementoActual.getBoundingClientRect();
    const canvasRect = document.getElementById('scrapbook-canvas').getBoundingClientRect();
    
    // Detectar si es touch o mouse
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragOffsetX = clientX - rect.left;
    dragOffsetY = clientY - rect.top;
    
    let haMovido = false;
    
    const onMove = (e) => {
        haMovido = true;
        isDragging = true;
        elementoActual.style.cursor = 'grabbing';
        moverElemento(e);
    };
    
    const onEnd = (e) => {
        // Remover todos los listeners
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        
        if (!haMovido) {
            // Si no se movió, es un click/tap para seleccionar
            seleccionarElemento.call(elementoActual, e);
        }
        
        isDragging = false;
        elementoActual.style.cursor = 'move';
    };
    
    // Agregar listeners para mouse Y touch
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// Mover elemento (con soporte táctil)
function moverElemento(e) {
    if (!isDragging || elementoSeleccionado === null) return;
    
    e.preventDefault(); // Prevenir scroll en touch
    
    const canvas = document.getElementById('scrapbook-canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    // Detectar si es touch o mouse
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const elementos = canvas.querySelectorAll('.canvas-foto, .canvas-sticker, .canvas-texto');
    elementos.forEach(el => {
        if (parseInt(el.dataset.index) === elementoSeleccionado) {
            let x = clientX - canvasRect.left - dragOffsetX;
            let y = clientY - canvasRect.top - dragOffsetY;
            
            // Mantener dentro del canvas
            x = Math.max(0, Math.min(x, canvasRect.width - el.offsetWidth));
            y = Math.max(0, Math.min(y, canvasRect.height - el.offsetHeight));
            
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            
            // Actualizar en el array
            canvasElementos[elementoSeleccionado].x = x;
            canvasElementos[elementoSeleccionado].y = y;
        }
    });
}

// Guardar página del diario personal
async function guardarPaginaScrapbook(event) {
    event.preventDefault();

    const texto = document.getElementById('diario-texto-entrada').value;
    const notas = (document.getElementById('diario-notas')?.value || '');
    const mensajeDiv = document.getElementById('mensaje-diario');
    const gratitudes = [1, 2, 3].map(n => document.getElementById('diario-gratitud-' + n)?.value || '').filter(g => g.trim());

    if (!texto.trim() && !notas.trim() && !gratitudes.length && !dcFotosNuevas.length && !dcStickersNuevos.length) {
        mensajeDiv.className = 'mensaje-diario aviso';
        mensajeDiv.textContent = '✍️ Escribe algo o agrega una foto antes de guardar';
        setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 3000);
        return;
    }

    const moodSeleccionado = document.querySelector('.diario-mood-btn.active');
    const mood = moodSeleccionado ? moodSeleccionado.dataset.mood : '';
    const moodEmoji = moodSeleccionado ? moodSeleccionado.childNodes[0].textContent.trim() : '';
    const fuenteGuardada = localStorage.getItem('diarioFuenteSeleccionada') || "'Lora', Georgia, serif";

    const pagina = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        texto: texto,
        notas: notas,
        mood: mood,
        moodEmoji: moodEmoji,
        gratitudes: gratitudes,
        fotos: dcFotosNuevas.slice(),
        stickers: dcStickersNuevos.slice(),
        fuente: fuenteGuardada,
        elementos: [],
        fondo: ''
    };

    const paginas = dcPaginas();
    paginas.unshift(pagina);
    dcGuardarLocal(paginas);
    const subida = subirPaginaDiario(pagina);

    mensajeDiv.className = 'mensaje-diario exito';
    mensajeDiv.textContent = '📔 Tu página quedó guardada en tu cuaderno ✨';

    document.getElementById('diario-texto-entrada').value = '';
    if (document.getElementById('diario-notas')) document.getElementById('diario-notas').value = '';
    [1, 2, 3].forEach(n => { const el = document.getElementById('diario-gratitud-' + n); if (el) el.value = ''; });
    document.querySelectorAll('.diario-mood-btn').forEach(b => b.classList.remove('active'));
    dcFotosNuevas = [];
    dcPintarFotosNuevas();
    dcStickersNuevos = [];
    dcPintarStickers();
    dcVerHoja(1);

    dcPaginaVista = 0;
    cargarPaginasAnteriores();
    setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 3500);

    if (!(await subida) && pagina.fotos.length) {
        mensajeDiv.className = 'mensaje-diario aviso';
        mensajeDiv.textContent = 'La página se guardó en este teléfono. Se subirá a la nube cuando haya conexión.';
        setTimeout(() => { mensajeDiv.className = 'mensaje-diario'; }, 4000);
    }
}

// ===================== CUADERNO ABIERTO =====================
// Páginas completas (con fotos) en memoria; en el teléfono se guardan aunque no quepan las fotos
let dcMemoria = null;
let dcFotosNuevas = [];
let dcStickersNuevos = [];
const DC_MAX_STICKERS = 8;
const DC_GIROS = [-8, 6, -4, 10, -10, 4, -6, 8];
let dcPaginaVista = 0;
const DC_MAX_FOTOS = 2;

function dcPaginas() {
    if (dcMemoria) return dcMemoria.slice();
    try { return JSON.parse(localStorage.getItem('scrapbook_paginas') || '[]'); } catch (e) { return []; }
}

// Guarda en el teléfono. Si las fotos no caben, se guardan sin fotos las páginas más viejas
// (las fotos siguen en la nube y en memoria).
function dcGuardarLocal(paginas) {
    dcMemoria = paginas.slice();
    const intentar = (lista) => { localStorage.setItem('scrapbook_paginas', JSON.stringify(lista)); };
    try { intentar(paginas); return; } catch (e) { /* no cabe */ }
    for (const conFotos of [10, 3, 0]) {
        try {
            intentar(paginas.map((p, i) => (i < conFotos || !p.fotos || !p.fotos.length) ? p : Object.assign({}, p, { fotos: [], fotosEnNube: p.fotos.length })));
            return;
        } catch (e) { /* seguir quitando */ }
    }
}

function dcEscapar(t) {
    return String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// --- fotos de la página nueva ---
function dcAgregarFoto(event) {
    const archivo = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!archivo) return;
    if (dcFotosNuevas.length >= DC_MAX_FOTOS) return;
    dcReducirFoto(archivo, (dataUrl) => {
        dcFotosNuevas.push(dataUrl);
        dcPintarFotosNuevas();
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

function dcQuitarFoto(i) {
    dcFotosNuevas.splice(i, 1);
    dcPintarFotosNuevas();
}

function dcPintarFotosNuevas() {
    const caja = document.getElementById('dcFotos');
    if (!caja) return;
    let html = dcFotosNuevas.map((f, i) => `<figure class="dc-polaroid" style="--giro:${i % 2 ? 3 : -3}deg"><img src="${f}" alt="Foto ${i + 1}"><button type="button" onclick="dcQuitarFoto(${i})" aria-label="Quitar foto">×</button></figure>`).join('');
    if (dcFotosNuevas.length < DC_MAX_FOTOS) html += `<button type="button" class="dc-foto-mas" onclick="document.getElementById('dcFotoInput').click()"><span>+</span>Añadir foto</button>`;
    caja.innerHTML = html;
}


// --- stickers de la página nueva ---
function dcPonerSticker(emoji) {
    if (dcStickersNuevos.length >= DC_MAX_STICKERS) return;
    dcStickersNuevos.push(emoji);
    dcPintarStickers();
    if (dcStickersNuevos.length >= DC_MAX_STICKERS) document.querySelector('.dc-bloque-stickers')?.classList.remove('abierta');
}

function dcQuitarSticker(i) {
    dcStickersNuevos.splice(i, 1);
    dcPintarStickers();
}

function dcHtmlStickers(lista, editable) {
    return lista.map((e, i) => editable
        ? `<button type="button" class="dc-sticker" style="--giro:${DC_GIROS[i % 8]}deg" onclick="dcQuitarSticker(${i})" aria-label="Quitar sticker">${e}</button>`
        : `<span class="dc-sticker" style="--giro:${DC_GIROS[i % 8]}deg">${e}</span>`).join('');
}

function dcPintarStickers() {
    const caja = document.getElementById('dcStickers');
    if (!caja) return;
    let html = dcHtmlStickers(dcStickersNuevos, true);
    if (dcStickersNuevos.length < DC_MAX_STICKERS) html += `<button type="button" class="dc-sticker-mas" onclick="this.closest('.dc-bloque-stickers').classList.toggle('abierta')">+ Sticker</button>`;
    caja.innerHTML = html;
}

// --- pasar la hoja (en el teléfono se ve una hoja a la vez) ---
function dcVerHoja(n) {
    const libro = document.getElementById('dcLibro');
    if (!libro) return;
    libro.classList.toggle('ver-2', n === 2);
    document.querySelectorAll('.dc-pasar .dc-puntos i').forEach((p, i) => p.classList.toggle('activo', i === n - 1));
    document.getElementById('dcAnterior')?.classList.toggle('apagada', n === 1);
    document.getElementById('dcSiguiente')?.classList.toggle('apagada', n === 2);
}

function dcActivarDeslizar(el, izquierda, derecha) {
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? izquierda : derecha)();
    }, { passive: true });
}

function dcIrAPagina(n) {
    const total = dcPaginas().length;
    if (!total) return;
    dcPaginaVista = Math.max(0, Math.min(total - 1, n));
    cargarPaginasAnteriores();
}

document.addEventListener('DOMContentLoaded', () => {
    dcPintarFotosNuevas();
    dcPintarStickers();
    dcVerHoja(1);
    document.addEventListener('click', e => {
        document.querySelectorAll('.dc-letra.abierta').forEach(m => { if (!m.contains(e.target)) m.classList.remove('abierta'); });
    });
    const libro = document.getElementById('dcLibro');
    if (libro) dcActivarDeslizar(libro, () => dcVerHoja(2), () => dcVerHoja(1));
    const lista = document.getElementById('lista-entradas-diario');
    if (lista) dcActivarDeslizar(lista, () => dcIrAPagina(dcPaginaVista + 1), () => dcIrAPagina(dcPaginaVista - 1));
});

// Descargar página como imagen
async function descargarPagina(index) {
    const paginas = JSON.parse(localStorage.getItem('scrapbook_paginas') || '[]');
    const pagina = paginas[index];
    
    if (!pagina) return;
    
    // Crear canvas temporal
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 1000, 1400);
    gradient.addColorStop(0, '#fef9f3');
    gradient.addColorStop(0.5, '#fff');
    gradient.addColorStop(1, '#fef5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1400);
    
    // Título
    ctx.fillStyle = '#b8926a';
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('MI DIARIO DE VIAJE', 500, 60);
    
    // Fecha
    const fecha = new Date(pagina.fecha);
    const fechaTexto = fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.font = 'italic 20px Georgia';
    ctx.fillStyle = '#8b7355';
    ctx.fillText(fechaTexto, 500, 100);
    
    // Área del canvas (con borde)
    ctx.fillStyle = '#fff';
    ctx.fillRect(50, 130, 900, 700);
    ctx.strokeStyle = '#ffd4a3';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 130, 900, 700);
    
    // Cargar y dibujar elementos
    const loadPromises = [];
    
    pagina.elementos.forEach(elemento => {
        if (elemento.type === 'foto') {
            const promise = new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    ctx.save();
                    ctx.translate(50 + elemento.x + 125, 130 + elemento.y + 125);
                    ctx.rotate(elemento.rotation * Math.PI / 180);
                    
                    // Marco blanco polaroid
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(-125, -125, 250, 270);
                    ctx.shadowColor = 'rgba(0,0,0,0.3)';
                    ctx.shadowBlur = 15;
                    ctx.fillRect(-125, -125, 250, 270);
                    ctx.shadowBlur = 0;
                    
                    // Imagen
                    ctx.drawImage(img, -120, -120, 240, 240);
                    ctx.restore();
                    resolve();
                };
                img.src = elemento.src;
            });
            loadPromises.push(promise);
        } else if (elemento.type === 'sticker') {
            ctx.save();
            ctx.translate(50 + elemento.x, 130 + elemento.y);
            ctx.rotate(elemento.rotation * Math.PI / 180);
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(elemento.emoji, 0, 0);
            ctx.restore();
        } else if (elemento.type === 'texto') {
            ctx.save();
            ctx.font = `${elemento.fontSize}px ${elemento.fontFamily}`;
            ctx.fillStyle = elemento.color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            // Fondo del texto
            const textMetrics = ctx.measureText(elemento.texto);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(50 + elemento.x - 10, 130 + elemento.y - 5, textMetrics.width + 20, elemento.fontSize + 10);
            
            // Texto
            ctx.fillStyle = elemento.color;
            ctx.fillText(elemento.texto, 50 + elemento.x, 130 + elemento.y);
            ctx.restore();
        }
    });
    
    // Esperar a que todas las imágenes carguen
    await Promise.all(loadPromises);
    
    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 860, 900, 490);
    ctx.strokeStyle = '#ffd4a3';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 860, 900, 490);
    
    ctx.fillStyle = '#4a4a4a';
    ctx.font = '22px Georgia';
    ctx.textAlign = 'left';
    
    const words = pagina.texto.split(' ');
    let line = '';
    let y = 900;
    const maxWidth = 850;
    const lineHeight = 32;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, 80, y);
            line = words[i] + ' ';
            y += lineHeight;
            
            if (y > 1320) break; // No exceder el área
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 80, y);
    
    // Descargar
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-diario-${fecha.getTime()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// Cargar páginas anteriores
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
    const fotos = (p.fotos || []).map((f, k) => `<figure class="dc-polaroid" style="--giro:${k % 2 ? 3 : -3}deg"><img src="${f}" alt="Foto"></figure>`).join('');
    const fotosNube = !fotos && p.fotosEnNube ? `<p class="dc-suave">📷 ${p.fotosEnNube} foto(s) guardada(s) en la nube</p>` : '';
    const grat = (p.gratitudes || []).length ? `<p class="dc-etq">🌸 Agradecí</p><ol class="dc-lista-grat">${p.gratitudes.map(g => `<li>${dcEscapar(g)}</li>`).join('')}</ol>` : '';
    const notas = p.notas ? `<p class="dc-etq">📝 Notas</p><div class="dc-nota dc-nota-leer">${dcEscapar(p.notas)}</div>` : '';
    const stickers = (p.stickers || []).length ? `<div class="dc-stickers">${dcHtmlStickers(p.stickers, false)}</div>` : '';
    const derecha = stickers + grat + notas + (fotos ? `<p class="dc-etq">📷 Fotos</p><div class="dc-fotos">${fotos}</div>` : fotosNube);

    listaDiv.innerHTML = `
        <div class="dc-libro dc-libro-leer${derecha ? '' : ' dc-una-hoja'}">
            <div class="dc-hoja dc-izq">
                <div class="dc-hoja-cab"><span class="dc-fecha">${fechaTxt} · ${horaTxt}</span>${p.moodEmoji ? `<span class="dc-mood-leer">${p.moodEmoji}</span>` : ''}</div>
                <div class="dc-texto-leer" style="font-family:${dcEscapar(p.fuente || "'Lora', Georgia, serif")}">${dcEscapar(p.texto) || '<span class="dc-suave">Sin texto este día</span>'}</div>
            </div>
            ${derecha ? `<div class="dc-lomo" aria-hidden="true"></div><div class="dc-hoja dc-der">${derecha}</div>` : ''}
        </div>
        <div class="dc-hojear">
            <button type="button" class="dc-flecha${i >= paginas.length - 1 ? ' apagada' : ''}" onclick="dcIrAPagina(${i + 1})" aria-label="Página más vieja">‹</button>
            <span>Página ${paginas.length - i} de ${paginas.length}</span>
            <button type="button" class="dc-flecha${i === 0 ? ' apagada' : ''}" onclick="dcIrAPagina(${i - 1})" aria-label="Página más nueva">›</button>
        </div>
        <button type="button" class="dc-borrar" onclick="eliminarPaginaDiario(${i})">Borrar esta página</button>
    `;
}

function eliminarPaginaDiario(index) {
    if (!confirm('¿Segura que quieres eliminar esta página de tu diario?')) return;
    const paginas = dcPaginas();
    const quitada = paginas.splice(index, 1)[0];
    dcGuardarLocal(paginas);
    if (quitada && quitada.id) borrarPaginaDiarioEnNube(String(quitada.id));
    cargarPaginasAnteriores();
}

let moodSeleccionadoActual = '';

function seleccionarMood(btn) {
    document.querySelectorAll('.diario-mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moodSeleccionadoActual = btn.dataset.mood;
}

function cambiarFuenteDiario(btn) {
    document.querySelectorAll('.diario-font-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const fuente = btn.dataset.font;
    const textarea = document.getElementById('diario-texto-entrada');
    if (textarea) {
        textarea.style.fontFamily = fuente;
    }
    localStorage.setItem('diarioFuenteSeleccionada', fuente);
    dcNombreLetra();
    btn.closest('.dc-letra')?.classList.remove('abierta');
}

function dcNombreLetra() {
    const activo = document.querySelector('.diario-font-btn.active');
    const nombre = document.getElementById('dcLetraNombre');
    if (nombre) nombre.textContent = activo ? (activo.dataset.nombre || 'Clásica') : 'Clásica';
}

function restaurarFuenteDiario() {
    const fuente = localStorage.getItem('diarioFuenteSeleccionada');
    if (fuente) {
        const textarea = document.getElementById('diario-texto-entrada');
        if (textarea) textarea.style.fontFamily = fuente;
        const hay = [...document.querySelectorAll('.diario-font-btn')].some(b => b.dataset.font === fuente);
        document.querySelectorAll('.diario-font-btn').forEach((btn, i) => {
            btn.classList.toggle('active', hay ? btn.dataset.font === fuente : i === 0);
        });
    }
    dcNombreLetra();
}

function actualizarFechaDiario() {
    const fechaDiv = document.getElementById('diario-fecha-hoy');
    if (fechaDiv) {
        const hoy = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaDiv.textContent = hoy.toLocaleDateString('es-ES', opciones);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const diarioForm = document.getElementById('diario-form');
    if (diarioForm) {
        diarioForm.addEventListener('submit', guardarPaginaScrapbook);
        actualizarFechaDiario();
        cargarPaginasAnteriores();
        restaurarFuenteDiario();
        sincronizarDiario();
    }
});

window.addEventListener('seccion-changed', function(e) {
    if (e.detail === 'diario') {
        actualizarFechaDiario();
        cargarPaginasAnteriores();
        restaurarFuenteDiario();
        sincronizarDiario();
    }
});

// Función para limpiar botones flotantes duplicados
function limpiarBotonesDiario() {
    let eliminados = 0;
    
    // Buscar y eliminar botones flotantes en todo el documento
    document.querySelectorAll('button').forEach(boton => {
        // Verificar si el botón está flotando (position fixed/absolute)
        const estilo = window.getComputedStyle(boton);
        if (estilo.position === 'fixed' || estilo.position === 'absolute') {
            // Verificar si está en el viewport pero fuera del flujo normal
            const rect = boton.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0 || rect.left > window.innerWidth || rect.right < 0) {
                boton.remove();
                eliminados++;
            }
        }
    });
    
    // También buscar botones con clases específicas que suelen ser flotantes
    const selectoresFlotantes = [
        '.floating-button',
        '.btn-fixed',
        '.btn-floating',
        '[style*="position: fixed"]',
        '[style*="position: absolute"]'
    ];
    
    selectoresFlotantes.forEach(selector => {
        document.querySelectorAll(selector).forEach(elemento => {
            if (elemento.tagName === 'BUTTON') {
                elemento.remove();
                eliminados++;
            }
        });
    });
    
    alert('🧹 Se eliminaron ' + eliminados + ' botones flotantes!');
}

// ============================================
// DIARIO EN LA NUBE
// Las páginas se guardan en el teléfono (al instante) y también en el servidor,
// para que no se pierdan al cambiar de teléfono y aparezcan en otros dispositivos.
// ============================================
let diarioSincronizando = false;

function leerListaDiario(clave) {
    try { return JSON.parse(localStorage.getItem(clave) || '[]'); } catch (e) { return []; }
}

async function subirPaginaDiario(pagina) {
    try {
        const res = await fetch('/api/diario/paginas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(pagina)
        });
        return res.ok;
    } catch (e) {
        return false; // sin conexión: queda en el teléfono y se sube en la próxima sincronización
    }
}

async function borrarPaginaDiarioEnNube(id) {
    // Se anota como pendiente por si no hay conexión en este momento
    const pendientes = leerListaDiario('scrapbook_borradas');
    if (!pendientes.includes(id)) pendientes.push(id);
    localStorage.setItem('scrapbook_borradas', JSON.stringify(pendientes));
    try {
        const res = await fetch('/api/diario/paginas/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
            localStorage.setItem('scrapbook_borradas', JSON.stringify(leerListaDiario('scrapbook_borradas').filter(x => x !== id)));
        }
    } catch (e) { /* se reintenta en la próxima sincronización */ }
}

async function sincronizarDiario() {
    if (diarioSincronizando) return;
    if (!localStorage.getItem('usuario')) return; // todavía no ha entrado: no hay nada que sincronizar
    diarioSincronizando = true;
    try {
        const res = await fetch('/api/diario/paginas', { credentials: 'include' });
        if (!res.ok) return; // sin sesión o sin conexión: se sigue usando lo del teléfono
        const nube = await res.json();
        const dueno = String(nube.usuario_id);

        // Si en este teléfono había páginas de OTRA cuenta, no se mezclan con esta
        const duenoLocal = localStorage.getItem('scrapbook_dueno');
        let locales = leerListaDiario('scrapbook_paginas');
        let pendientesBorrar = leerListaDiario('scrapbook_borradas');
        if (duenoLocal && duenoLocal !== dueno) {
            locales = [];
            pendientesBorrar = [];
        }
        localStorage.setItem('scrapbook_dueno', dueno);

        // 1) borrados hechos aquí que aún no llegaron al servidor
        for (const id of pendientesBorrar) {
            try { await fetch('/api/diario/paginas/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' }); } catch (e) {}
        }
        const borradas = new Set([...(nube.borradas || []), ...pendientesBorrar].map(String));
        localStorage.setItem('scrapbook_borradas', '[]');

        // 2) unir lo del teléfono con lo de la nube
        const porId = new Map();
        (nube.paginas || []).forEach(p => { if (p && p.id && !borradas.has(String(p.id))) porId.set(String(p.id), p); });
        const idsEnNube = new Set(porId.keys());
        for (const p of locales) {
            if (!p || !p.id) continue;
            const id = String(p.id);
            if (borradas.has(id)) continue;
            if (!idsEnNube.has(id)) {
                porId.set(id, p);
                await subirPaginaDiario(p); // páginas que solo estaban en este teléfono
            }
        }
        const todas = [...porId.values()].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        dcGuardarLocal(todas);
        if (document.getElementById('lista-entradas-diario')) cargarPaginasAnteriores();
    } catch (e) {
        console.log('Diario: se usa lo guardado en el teléfono');
    } finally {
        diarioSincronizando = false;
    }
}
