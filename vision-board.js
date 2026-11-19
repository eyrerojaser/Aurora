// ============================================
// VISION-BOARD.JS - El Año donde Florezco
// ============================================

let visionCanvas = null;
let visionElementCounter = 0;

// Cargar vision board desde el servidor al abrir la sección
async function cargarVisionBoardDelServidor() {
  try {
    const response = await fetch('/api/vision-board', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.html_content) {
        const canvas = document.getElementById('vision-canvas');
        if (canvas) {
          canvas.innerHTML = data.html_content;
          console.log('✅ Vision Board cargado desde servidor');
          
          // Re-activar arrastre en los elementos cargados
          const elementos = canvas.querySelectorAll('.canvas-element');
          elementos.forEach(el => hacerArrastrableVision(el));
        }
      }
    }
  } catch (error) {
    console.log('No hay vision board guardado en servidor');
  }
}

// Cambiar pestañas del vision board
function cambiarTabVision(tab) {
  const tabs = document.querySelectorAll('#seccion-mi-año .canvas-tab');
  const panels = document.querySelectorAll('#seccion-mi-año .canvas-panel');
  
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  
  tabs.forEach(t => {
    if (t.onclick && t.onclick.toString().includes(tab)) {
      t.classList.add('active');
    }
  });
  document.getElementById(`panel-vision-${tab}`).classList.add('active');
}

// Auto-guardar vision board al servidor
async function autoGuardarVision() {
  try {
    const canvas = document.getElementById('vision-canvas');
    if (!canvas || !canvas.children.length) return;
    
    await fetch('/api/vision-board', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        html_content: canvas.innerHTML,
        background: canvas.style.background || ''
      })
    });
    console.log('💾 Vision Board guardado en servidor');
  } catch (error) {
    console.error('Error auto-guardar vision:', error);
  }
}

// Agregar foto al vision board desde dispositivo
function agregarFotoAlVision(event) {
  console.log('✅ VISION v2 - Función nueva cargada');
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imgData = e.target.result;
    crearElementoFotoVision(imgData);
    console.log('✅ Foto agregada al vision board');
    
    // AUTO-GUARDAR al servidor
    autoGuardarVision();
  };
  leerFotoReducida(file, reader.onload);
  
  // Reset input para poder agregar la misma foto o más fotos
  event.target.value = '';
  console.log('✅ Input reseteado - listo para otra foto');
}

// Crear elemento de foto en el vision board
// Crear elemento de foto en vision board
function crearElementoFotoVision(imageSrc) {
  if (!visionCanvas) {
    visionCanvas = document.getElementById('vision-canvas');
    const placeholder = visionCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const fotoElement = document.createElement('div');
  fotoElement.className = 'canvas-element foto-element';
  fotoElement.id = `vision-element-${visionElementCounter++}`;
  fotoElement.style.left = `${Math.random() * 50}%`;
  fotoElement.style.top = `${Math.random() * 40}%`;
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '8px';
  img.style.pointerEvents = 'none';
  
  // Botones de tamaño
  const resizeBtns = document.createElement('div');
  resizeBtns.style.cssText = 'position:absolute; bottom:-15px; right:-15px; display:flex; gap:8px; z-index:10;';
  
  const btnMas = document.createElement('button');
  btnMas.innerHTML = '+';
  btnMas.style.cssText = 'width:35px; height:35px; border-radius:50%; background:#4caf50; color:white; border:2px solid white; cursor:pointer; font-size:20px; font-weight:bold;';
  btnMas.onclick = (e) => {
    e.stopPropagation();
    const currentWidth = fotoElement.offsetWidth;
    fotoElement.style.width = `${currentWidth + 40}px`;
    fotoElement.style.height = `${currentWidth + 40}px`;
  };
  
  const btnMenos = document.createElement('button');
  btnMenos.innerHTML = '−';
  btnMenos.style.cssText = 'width:35px; height:35px; border-radius:50%; background:#ff9800; color:white; border:2px solid white; cursor:pointer; font-size:20px; font-weight:bold;';
  btnMenos.onclick = (e) => {
    e.stopPropagation();
    const currentWidth = fotoElement.offsetWidth;
    if (currentWidth > 100) {
      fotoElement.style.width = `${currentWidth - 40}px`;
      fotoElement.style.height = `${currentWidth - 40}px`;
    }
  };
  
  resizeBtns.appendChild(btnMenos);
  resizeBtns.appendChild(btnMas);
  
  fotoElement.appendChild(img);
  fotoElement.appendChild(resizeBtns);
  
  visionCanvas.appendChild(fotoElement);
  hacerArrastrableVision(fotoElement);
}

// Agregar sticker al vision board
function agregarStickerAlVision(emoji) {
  if (!visionCanvas) {
    visionCanvas = document.getElementById('vision-canvas');
    const placeholder = visionCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const stickerElement = document.createElement('div');
  stickerElement.className = 'canvas-element sticker-element';
  stickerElement.id = `vision-element-${visionElementCounter++}`;
  stickerElement.textContent = emoji;
  stickerElement.style.left = `${Math.random() * 70}%`;
  stickerElement.style.top = `${Math.random() * 70}%`;
  stickerElement.style.fontSize = '3rem';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'element-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.onclick = () => stickerElement.remove();
  
  stickerElement.appendChild(deleteBtn);
  visionCanvas.appendChild(stickerElement);
  hacerArrastrableVision(stickerElement);
}

// Agregar texto al vision board
function agregarTextoAlVision() {
  if (!visionCanvas) {
    visionCanvas = document.getElementById('vision-canvas');
    const placeholder = visionCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const contenedorTexto = document.createElement('div');
  contenedorTexto.className = 'canvas-element';
  contenedorTexto.id = `vision-element-${visionElementCounter++}`;
  contenedorTexto.style.left = `${Math.random() * 50}%`;
  contenedorTexto.style.top = `${Math.random() * 50}%`;
  contenedorTexto.style.minWidth = '150px';
  
  const textoEditable = document.createElement('div');
  textoEditable.className = 'texto-element';
  textoEditable.contentEditable = true;
  textoEditable.textContent = 'Mi meta 2026';
  textoEditable.style.outline = 'none';
  textoEditable.style.padding = '10px';
  textoEditable.style.minHeight = '40px';
  // Evitar que el arrastre interfiera con la edición
  textoEditable.style.cursor = 'text';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'element-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    contenedorTexto.remove();
  };
  
  contenedorTexto.appendChild(textoEditable);
  contenedorTexto.appendChild(deleteBtn);
  visionCanvas.appendChild(contenedorTexto);
  hacerArrastrableTextoVision(contenedorTexto, textoEditable);
}

// Función especial para arrastrar elementos de texto
function hacerArrastrableTextoVision(contenedor, textoEditable) {
  let posX = 0, posY = 0, inicialX = 0, inicialY = 0;
  let isDragging = false;
  
  // Solo arrastramos si tocamos el contenedor, NO el texto editable
  contenedor.onmousedown = function(e) {
    if (e.target === textoEditable || textoEditable.contains(e.target)) {
      return; // No arrastrar si se hace click en el texto
    }
    iniciarArrastre(e);
  };
  
  contenedor.ontouchstart = function(e) {
    if (e.target === textoEditable || textoEditable.contains(e.target)) {
      return; // No arrastrar si se toca el texto
    }
    iniciarArrastreTactil(e);
  };
  
  function iniciarArrastre(e) {
    e.preventDefault();
    inicialX = e.clientX;
    inicialY = e.clientY;
    isDragging = true;
    document.onmouseup = detenerArrastre;
    document.onmousemove = arrastrarElemento;
  }
  
  function iniciarArrastreTactil(e) {
    e.preventDefault();
    const touch = e.touches[0];
    inicialX = touch.clientX;
    inicialY = touch.clientY;
    isDragging = true;
    document.ontouchend = detenerArrastre;
    document.ontouchmove = arrastrarElementoTactil;
  }
  
  function arrastrarElemento(e) {
    if (!isDragging) return;
    e.preventDefault();
    posX = inicialX - e.clientX;
    posY = inicialY - e.clientY;
    inicialX = e.clientX;
    inicialY = e.clientY;
    contenedor.style.top = (contenedor.offsetTop - posY) + 'px';
    contenedor.style.left = (contenedor.offsetLeft - posX) + 'px';
  }
  
  function arrastrarElementoTactil(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    posX = inicialX - touch.clientX;
    posY = inicialY - touch.clientY;
    inicialX = touch.clientX;
    inicialY = touch.clientY;
    contenedor.style.top = (contenedor.offsetTop - posY) + 'px';
    contenedor.style.left = (contenedor.offsetLeft - posX) + 'px';
  }
  
  function detenerArrastre() {
    isDragging = false;
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// Agregar frase rápida
function agregarFraseAlVision(frase) {
  if (!visionCanvas) {
    visionCanvas = document.getElementById('vision-canvas');
    const placeholder = visionCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const fraseElement = document.createElement('div');
  fraseElement.className = 'canvas-element frase-element';
  fraseElement.id = `vision-element-${visionElementCounter++}`;
  fraseElement.textContent = frase;
  fraseElement.style.left = `${Math.random() * 50}%`;
  fraseElement.style.top = `${Math.random() * 50}%`;
  fraseElement.style.background = 'linear-gradient(135deg, #f4c542, #ffd700)';
  fraseElement.style.color = '#fff';
  fraseElement.style.padding = '1rem 1.5rem';
  fraseElement.style.borderRadius = '12px';
  fraseElement.style.fontWeight = 'bold';
  fraseElement.style.fontSize = '1.2rem';
  fraseElement.style.textAlign = 'center';
  fraseElement.style.boxShadow = '0 4px 12px rgba(244, 197, 66, 0.3)';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'element-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.onclick = () => fraseElement.remove();
  
  fraseElement.appendChild(deleteBtn);
  visionCanvas.appendChild(fraseElement);
  hacerArrastrableVision(fraseElement);
}

// Cambiar fondo del vision board
function cambiarFondoVision(fondo) {
  if (!visionCanvas) {
    visionCanvas = document.getElementById('vision-canvas');
  }
  visionCanvas.style.background = fondo;
}

// Hacer elemento arrastrable (con soporte táctil)
function hacerArrastrableVision(elemento) {
  let posX = 0, posY = 0, inicialX = 0, inicialY = 0;
  let startX = 0, startY = 0;
  let isDragging = false;
  let hasMoved = false;
  const THRESHOLD = 15; // pixeles de tolerancia aumentados
  
  function iniciarArrastre(e) {
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    inicialX = e.clientX;
    inicialY = e.clientY;
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    hasMoved = false;
    elemento._isDragging = false;
    document.onmouseup = detenerArrastre;
    document.onmousemove = arrastrarElemento;
  }
  
  function iniciarArrastreTactil(e) {
    // NO tocar botones
    if (e.target.tagName === 'BUTTON') {
      return;
    }
    
    const touch = e.touches[0];
    inicialX = touch.clientX;
    inicialY = touch.clientY;
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = true;
    hasMoved = false;
    elemento._isDragging = false;
    
    document.addEventListener('touchend', detenerArrastre, { once: true, passive: true });
    document.addEventListener('touchmove', arrastrarElementoTactil, { passive: false });
  }
  
  function arrastrarElemento(e) {
    if (!isDragging) return;
    
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    
    if (deltaX > THRESHOLD || deltaY > THRESHOLD) {
      hasMoved = true;
      elemento._isDragging = true;
    }
    
    if (hasMoved) {
      e.preventDefault();
      posX = inicialX - e.clientX;
      posY = inicialY - e.clientY;
      inicialX = e.clientX;
      inicialY = e.clientY;
      elemento.style.top = (elemento.offsetTop - posY) + 'px';
      elemento.style.left = (elemento.offsetLeft - posX) + 'px';
    }
  }
  
  function arrastrarElementoTactil(e) {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    
    if (deltaX > THRESHOLD || deltaY > THRESHOLD) {
      hasMoved = true;
      elemento._isDragging = true;
    }
    
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      posX = inicialX - touch.clientX;
      posY = inicialY - touch.clientY;
      inicialX = touch.clientX;
      inicialY = touch.clientY;
      elemento.style.top = (elemento.offsetTop - posY) + 'px';
      elemento.style.left = (elemento.offsetLeft - posX) + 'px';
    }
  }
  
  function detenerArrastre() {
    if (!isDragging) return;
    isDragging = false;
    hasMoved = false;
    
    // Resetear estado después de 500ms
    setTimeout(() => {
      elemento._isDragging = false;
    }, 500);
    
    document.onmouseup = null;
    document.onmousemove = null;
    document.removeEventListener('touchend', detenerArrastre);
    document.removeEventListener('touchmove', arrastrarElementoTactil);
  }
  
  elemento.addEventListener('mousedown', iniciarArrastre);
  elemento.addEventListener('touchstart', iniciarArrastreTactil, { passive: false });
}

// Guardar Vision Board
function guardarVisionBoard() {
  const canvas = document.getElementById('vision-canvas');
  if (!canvas || !canvas.children.length) {
    alert('Agrega elementos a tu Vision Board antes de guardar');
    return;
  }
  
  const visionData = {
    html: canvas.innerHTML,
    background: canvas.style.background,
    fecha: new Date().toISOString()
  };
  
  localStorage.setItem('visionBoard2026', JSON.stringify(visionData));
  
  alert('✨ Tu Vision Board 2026 ha sido guardado!');
}

// Agregar meta del año
function agregarMetaAño() {
  const input = document.getElementById('nueva-meta-año');
  const meta = input.value.trim();
  
  if (!meta) {
    alert('Escribe una meta para el año');
    return;
  }
  
  const metas = JSON.parse(localStorage.getItem('metasAño2026') || '[]');
  metas.push({
    texto: meta,
    completada: false,
    fecha: new Date().toISOString()
  });
  
  localStorage.setItem('metasAño2026', JSON.stringify(metas));
  input.value = '';
  cargarMetasAño();
}

// Cargar metas del año
function cargarMetasAño() {
  const metas = JSON.parse(localStorage.getItem('metasAño2026') || '[]');
  const lista = document.getElementById('lista-metas-año');
  
  if (!lista) return;
  
  if (metas.length === 0) {
    lista.innerHTML = '<p style="text-align: center; color: #8b7d7d; opacity: 0.7;">Aún no has agregado metas para el año</p>';
    return;
  }
  
  lista.innerHTML = metas.map((meta, index) => `
    <div class="meta-año-item ${meta.completada ? 'completada' : ''}">
      <input 
        type="checkbox" 
        ${meta.completada ? 'checked' : ''} 
        onchange="toggleMetaAño(${index})"
      />
      <span>${meta.texto}</span>
      <button onclick="eliminarMetaAño(${index})" class="btn-eliminar-meta">🗑️</button>
    </div>
  `).join('');
}

// Toggle meta completada
function toggleMetaAño(index) {
  const metas = JSON.parse(localStorage.getItem('metasAño2026') || '[]');
  metas[index].completada = !metas[index].completada;
  localStorage.setItem('metasAño2026', JSON.stringify(metas));
  cargarMetasAño();
}

// Eliminar meta del año
function eliminarMetaAño(index) {
  const metas = JSON.parse(localStorage.getItem('metasAño2026') || '[]');
  metas.splice(index, 1);
  localStorage.setItem('metasAño2026', JSON.stringify(metas));
  cargarMetasAño();
}

// Guardar palabra del año
function guardarPalabraAño() {
  const input = document.getElementById('palabra-año-input');
  const palabra = input.value.trim().toUpperCase();
  
  if (!palabra) {
    alert('Escribe una palabra que te inspire para el año');
    return;
  }
  
  localStorage.setItem('palabraAño2026', palabra);
  mostrarPalabraAño();
}

// Mostrar palabra del año
function mostrarPalabraAño() {
  const palabra = localStorage.getItem('palabraAño2026');
  const display = document.getElementById('palabra-año-display');
  
  if (!display) return;
  
  if (palabra) {
    display.innerHTML = `
      <div class="palabra-año-card">
        <h2>${palabra}</h2>
        <p>Mi palabra para 2026</p>
      </div>
    `;
    display.style.display = 'block';
  } else {
    display.style.display = 'none';
  }
}

// Limpiar botones huérfanos del canvas
function limpiarBotonesVision() {
  const canvas = document.getElementById('vision-canvas');
  if (!canvas) return;
  
  // Eliminar todos los botones de delete huérfanos
  const deleteButtons = canvas.querySelectorAll('.element-delete-btn');
  deleteButtons.forEach(btn => {
    const parent = btn.parentElement;
    if (!parent || !parent.classList.contains('canvas-element')) {
      btn.remove();
    }
  });
  
  // Eliminar todos los contenedores de resize huérfanos
  const resizeContainers = canvas.querySelectorAll('.element-resize-btns');
  resizeContainers.forEach(container => {
    const parent = container.parentElement;
    if (!parent || !parent.classList.contains('canvas-element')) {
      container.remove();
    }
  });
  
  alert('🧹 Canvas limpio! Se eliminaron botones huérfanos.');
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  cargarMetasAño();
  mostrarPalabraAño();
  
  const visionGuardado = localStorage.getItem('visionBoard2026');
  if (visionGuardado) {
    const data = JSON.parse(visionGuardado);
    const canvas = document.getElementById('vision-canvas');
    if (canvas) {
      canvas.innerHTML = data.html;
      canvas.style.background = data.background;
      visionCanvas = canvas;
    }
  }
});
