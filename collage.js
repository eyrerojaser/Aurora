// ============================================
// COLLAGE.JS - Mi Collage Creativo
// ============================================

let collageCanvas = null;
let collageElementCounter = 0;

// Cargar collage desde el servidor al abrir la sección
async function cargarCollageDelServidor() {
  try {
    const response = await fetch('/api/collage', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.html_content) {
        const canvas = document.getElementById('collage-canvas');
        if (canvas) {
          canvas.innerHTML = data.html_content;
          console.log('✅ Collage cargado desde servidor');
          
          // Re-activar arrastre en los elementos cargados
          const elementos = canvas.querySelectorAll('.canvas-element');
          elementos.forEach(el => hacerArrastrable(el));
        }
      }
    }
  } catch (error) {
    console.log('No hay collage guardado en servidor');
  }
}

// Cambiar pestañas del collage
function cambiarTabCollage(tab) {
  const tabs = document.querySelectorAll('#seccion-collage .canvas-tab');
  const panels = document.querySelectorAll('#seccion-collage .canvas-panel');
  
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  
  tabs.forEach(t => {
    if (t.onclick && t.onclick.toString().includes(tab)) {
      t.classList.add('active');
    }
  });
  document.getElementById(`panel-collage-${tab}`).classList.add('active');
}

// Agregar foto al collage desde dispositivo  
function agregarFotoAlCollage(event) {
  console.log('✅ COLLAGE v2 - Función nueva cargada');
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const imgData = e.target.result;
    crearElementoFotoCollage(imgData);
    console.log('✅ Foto agregada al collage');
    
    // AUTO-GUARDAR al servidor
    autoGuardarCollage();
  };
  leerFotoReducida(file, reader.onload);
  
  // Reset input para poder agregar la misma foto o más fotos
  event.target.value = '';
  console.log('✅ Input reseteado - listo para otra foto');
}

// Auto-guardar collage al servidor
async function autoGuardarCollage() {
  try {
    const canvas = document.getElementById('collage-canvas');
    if (!canvas || !canvas.children.length) return;
    
    await fetch('/api/collage', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        html_content: canvas.innerHTML,
        background: canvas.style.background || ''
      })
    });
    console.log('💾 Collage guardado en servidor');
  } catch (error) {
    console.error('Error auto-guardar:', error);
  }
}

// Crear elemento de foto en el collage
function crearElementoFotoCollage(imageSrc) {
  if (!collageCanvas) {
    collageCanvas = document.getElementById('collage-canvas');
    const placeholder = collageCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const fotoElement = document.createElement('div');
  fotoElement.className = 'canvas-element foto-element';
  fotoElement.id = `collage-element-${collageElementCounter++}`;
  fotoElement.style.left = `${Math.random() * 50}%`;
  fotoElement.style.top = `${Math.random() * 40}%`;
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '8px';
  img.style.pointerEvents = 'none';
  
  // Botón ELIMINAR (X roja arriba a la izquierda)
  const btnEliminar = document.createElement('button');
  btnEliminar.innerHTML = '✕';
  btnEliminar.style.cssText = 'position:absolute; top:-12px; left:-12px; width:32px; height:32px; border-radius:50%; background:#e53935; color:white; border:2px solid white; cursor:pointer; font-size:16px; font-weight:bold; z-index:20; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
  btnEliminar.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    fotoElement.remove();
    autoGuardarCollage();
    console.log('🗑️ Foto eliminada');
  };
  
  // Botones de tamaño (abajo a la derecha)
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
    e.preventDefault();
    const currentWidth = fotoElement.offsetWidth;
    if (currentWidth > 100) {
      fotoElement.style.width = `${currentWidth - 40}px`;
      fotoElement.style.height = `${currentWidth - 40}px`;
    }
    setTimeout(() => autoGuardarCollage(), 500);
  };
  
  resizeBtns.appendChild(btnMenos);
  resizeBtns.appendChild(btnMas);
  
  fotoElement.appendChild(img);
  fotoElement.appendChild(btnEliminar);
  fotoElement.appendChild(resizeBtns);
  
  collageCanvas.appendChild(fotoElement);
  hacerArrastrable(fotoElement);
}

// Agregar sticker al collage
function agregarStickerAlCollage(emoji) {
  if (!collageCanvas) {
    collageCanvas = document.getElementById('collage-canvas');
    const placeholder = collageCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const stickerElement = document.createElement('div');
  stickerElement.className = 'canvas-element sticker-element';
  stickerElement.id = `collage-element-${collageElementCounter++}`;
  stickerElement.textContent = emoji;
  stickerElement.style.left = `${Math.random() * 70}%`;
  stickerElement.style.top = `${Math.random() * 70}%`;
  stickerElement.style.fontSize = '3rem';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'element-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.onclick = () => stickerElement.remove();
  
  stickerElement.appendChild(deleteBtn);
  collageCanvas.appendChild(stickerElement);
  hacerArrastrable(stickerElement);
  
  // Auto-guardar
  autoGuardarCollage();
}

// Agregar Badge Premium al collage
function agregarBadgeAlCollage(texto, color) {
  if (!collageCanvas) {
    collageCanvas = document.getElementById('collage-canvas');
    const placeholder = collageCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const badgeElement = document.createElement('div');
  badgeElement.className = `canvas-element badge-element badge-canvas-${color}`;
  badgeElement.id = `collage-element-${collageElementCounter++}`;
  badgeElement.textContent = texto;
  badgeElement.style.left = `${Math.random() * 60 + 10}%`;
  badgeElement.style.top = `${Math.random() * 60 + 10}%`;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'element-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    badgeElement.remove();
    autoGuardarCollage();
  };
  
  badgeElement.appendChild(deleteBtn);
  collageCanvas.appendChild(badgeElement);
  hacerArrastrable(badgeElement);
  
  // Auto-guardar
  autoGuardarCollage();
  
  console.log('👑 Badge Premium agregado:', texto);
}

// Agregar texto al collage
function agregarTextoAlCollage() {
  if (!collageCanvas) {
    collageCanvas = document.getElementById('collage-canvas');
    const placeholder = collageCanvas.querySelector('.canvas-placeholder');
    if (placeholder) placeholder.remove();
  }
  
  const contenedorTexto = document.createElement('div');
  contenedorTexto.className = 'canvas-element';
  contenedorTexto.id = `collage-element-${collageElementCounter++}`;
  contenedorTexto.style.left = `${Math.random() * 50}%`;
  contenedorTexto.style.top = `${Math.random() * 50}%`;
  contenedorTexto.style.minWidth = '150px';
  
  const textoEditable = document.createElement('div');
  textoEditable.className = 'texto-element';
  textoEditable.contentEditable = true;
  textoEditable.textContent = 'Tu texto aquí';
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
  collageCanvas.appendChild(contenedorTexto);
  hacerArrastrableTexto(contenedorTexto, textoEditable);
}

// Función especial para arrastrar elementos de texto
function hacerArrastrableTexto(contenedor, textoEditable) {
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

// Cambiar fondo del collage
function cambiarFondoCollage(fondo) {
  if (!collageCanvas) {
    collageCanvas = document.getElementById('collage-canvas');
  }
  collageCanvas.style.background = fondo;
}

// Hacer elemento arrastrable - VERSIÓN SIMPLIFICADA
function hacerArrastrable(elemento) {
  let offsetX = 0, offsetY = 0;
  let isDragging = false;
  
  // Obtener el canvas padre
  const canvas = document.getElementById('collage-canvas');
  
  function iniciarArrastre(e) {
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    elemento.style.zIndex = '1000';
    
    // Calcular offset desde la posición actual del elemento
    const rect = elemento.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', moverElemento);
    document.addEventListener('mouseup', soltarElemento);
  }
  
  function iniciarArrastreTactil(e) {
    if (e.target.tagName === 'BUTTON') {
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    elemento.style.zIndex = '1000';
    
    const touch = e.touches[0];
    const rect = elemento.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    
    document.addEventListener('touchmove', moverElementoTactil, { passive: false });
    document.addEventListener('touchend', soltarElemento);
  }
  
  function moverElemento(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const canvasRect = canvas.getBoundingClientRect();
    let newLeft = e.clientX - canvasRect.left - offsetX;
    let newTop = e.clientY - canvasRect.top - offsetY;
    
    // Mantener dentro del canvas
    newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - elemento.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, canvasRect.height - elemento.offsetHeight));
    
    elemento.style.left = newLeft + 'px';
    elemento.style.top = newTop + 'px';
  }
  
  function moverElementoTactil(e) {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const canvasRect = canvas.getBoundingClientRect();
    let newLeft = touch.clientX - canvasRect.left - offsetX;
    let newTop = touch.clientY - canvasRect.top - offsetY;
    
    // Mantener dentro del canvas
    newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - elemento.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, canvasRect.height - elemento.offsetHeight));
    
    elemento.style.left = newLeft + 'px';
    elemento.style.top = newTop + 'px';
  }
  
  function soltarElemento() {
    if (!isDragging) return;
    isDragging = false;
    elemento.style.zIndex = '1';
    
    // Auto-guardar después de mover
    autoGuardarCollage();
    
    document.removeEventListener('mousemove', moverElemento);
    document.removeEventListener('mouseup', soltarElemento);
    document.removeEventListener('touchmove', moverElementoTactil);
    document.removeEventListener('touchend', soltarElemento);
  }
  
  elemento.addEventListener('mousedown', iniciarArrastre);
  elemento.addEventListener('touchstart', iniciarArrastreTactil, { passive: false });
}

// Guardar collage (botón principal)
document.getElementById('collage-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const canvas = document.getElementById('collage-canvas');
  if (!canvas || !canvas.children.length) {
    alert('Agrega al menos una foto o sticker a tu collage');
    return;
  }
  
  const mensaje = document.getElementById('mensaje-collage');
  
  try {
    // Guardar en el servidor
    const response = await fetch('/api/collage', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        html_content: canvas.innerHTML,
        background: canvas.style.background || ''
      })
    });
    
    if (response.ok) {
      mensaje.textContent = '✨ Collage guardado exitosamente!';
      mensaje.style.color = '#4caf50';
      mensaje.style.display = 'block';
      console.log('💾 Collage guardado manualmente');
      
      setTimeout(() => {
        mensaje.style.display = 'none';
      }, 3000);
    } else {
      throw new Error('Error al guardar');
    }
  } catch (error) {
    mensaje.textContent = '❌ Error al guardar el collage';
    mensaje.style.color = '#e57373';
    mensaje.style.display = 'block';
    console.error('Error guardando collage:', error);
    
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 3000);
  }
});

// Cargar collages guardados
function cargarCollagesGuardados() {
  const collages = JSON.parse(localStorage.getItem('collages') || '[]');
  const lista = document.getElementById('lista-collages');
  
  if (!lista) return;
  
  if (collages.length === 0) {
    lista.innerHTML = '<p style="text-align: center; color: #8b7d7d; opacity: 0.7;">Aún no has guardado collages</p>';
    return;
  }
  
  lista.innerHTML = collages.map((collage, index) => `
    <div class="scrapbook-entrada-item">
      <div class="scrapbook-preview" style="background: ${collage.background}">
        ${collage.html}
      </div>
      <div class="scrapbook-entrada-info">
        <p class="scrapbook-fecha">${new Date(collage.fecha).toLocaleDateString('es-ES')}</p>
        <button onclick="eliminarCollage(${index})" class="btn-eliminar-entrada">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Eliminar collage
function eliminarCollage(index) {
  if (!confirm('¿Eliminar este collage?')) return;
  
  const collages = JSON.parse(localStorage.getItem('collages') || '[]');
  collages.splice(index, 1);
  localStorage.setItem('collages', JSON.stringify(collages));
  cargarCollagesGuardados();
}

// Limpiar botones huérfanos del canvas
function limpiarBotonesCollage() {
  const canvas = document.getElementById('collage-canvas');
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

// Inicializar al cargar la sección
document.addEventListener('DOMContentLoaded', () => {
  cargarCollagesGuardados();
});
