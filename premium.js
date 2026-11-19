let estadoPremium = false;

function obtenerEmailUsuario() {
    let email = localStorage.getItem('userEmail') || '';
    if (!email) {
        try {
            const usuarioData = localStorage.getItem('usuario');
            if (usuarioData) {
                const usuario = JSON.parse(usuarioData);
                if (usuario.email) {
                    email = usuario.email;
                    localStorage.setItem('userEmail', email);
                }
            }
        } catch(e) {}
    }
    return email;
}

async function verificarEstadoPremium() {
    try {
        const userEmail = obtenerEmailUsuario();
        const url = userEmail ? `/api/premium/status?email=${encodeURIComponent(userEmail)}` : '/api/premium/status';
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('📦 Respuesta Premium:', data);
        estadoPremium = data.premium;
        console.log('🔐 Estado Premium:', estadoPremium);
        
        actualizarUIPremium();
        
        const params = new URLSearchParams(window.location.search);
        if (params.get('premium') === 'success') {
            window.history.replaceState({}, '', window.location.pathname);
            mostrarCelebracionPremium();
        } else if (params.get('premium') === 'cancelled') {
            mostrarNotificacion('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.', 'info');
            window.history.replaceState({}, '', window.location.pathname);
        }
        
        return data.premium;
    } catch (error) {
        console.error('Error verificar premium:', error);
        return false;
    }
}

// plan: 'mensual' ($6.99 al mes) o 'anual' ($69.99 al año). La primera vez incluye 7 días gratis.
async function iniciarCheckout(plan, boton) {
    if (plan !== 'anual') plan = 'mensual';
    const botones = document.querySelectorAll('.btn-plan-premium');
    const textoOriginal = boton ? boton.innerHTML : '';
    try {
        botones.forEach(b => { b.disabled = true; });
        if (boton) boton.textContent = 'Procesando...';
        
        const response = await fetch('/api/premium/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ plan })
        });
        
        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Error al crear checkout');
        }
    } catch (error) {
        console.error('Error checkout:', error);
        mostrarNotificacion('Error al procesar el pago. Intenta de nuevo.', 'error');
        botones.forEach(b => { b.disabled = false; });
        if (boton) boton.innerHTML = textoOriginal;
    }
}

async function cancelarSuscripcion() {
    if (!confirm('¿Estás segura que quieres cancelar tu suscripción Premium? Perderás acceso a las funciones exclusivas.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/premium/cancel', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Suscripción cancelada. Tu acceso Premium terminará al final del periodo de pago.', 'info');
            await verificarEstadoPremium();
        } else {
            throw new Error(data.error || 'Error al cancelar');
        }
    } catch (error) {
        console.error('Error cancelar:', error);
        mostrarNotificacion('Error al cancelar la suscripción. Intenta de nuevo.', 'error');
    }
}

function actualizarUIPremium() {
    console.log('🎨 Actualizando UI Premium, estado:', estadoPremium);
    
    const badgePremium = document.querySelector('.badge-premium');
    const btnPremium = document.getElementById('btn-premium');
    const seccionPremiumActivo = document.getElementById('premium-activo');
    const seccionPremiumInactivo = document.getElementById('premium-inactivo');
    const lockBadges = document.querySelectorAll('.premium-lock-badge');
    const premiumTags = document.querySelectorAll('.premium-tag');
    
    console.log('Elementos encontrados:', {
        badge: !!badgePremium,
        btn: !!btnPremium,
        activo: !!seccionPremiumActivo,
        inactivo: !!seccionPremiumInactivo
    });
    
    if (estadoPremium) {
        if (badgePremium) badgePremium.style.display = 'inline-block';
        if (seccionPremiumActivo) {
            seccionPremiumActivo.style.display = 'flex';
            seccionPremiumActivo.style.flexDirection = 'column';
            seccionPremiumActivo.style.alignItems = 'center';
        }
        if (seccionPremiumInactivo) seccionPremiumInactivo.style.display = 'none';
        
        lockBadges.forEach(lock => lock.style.display = 'none');
        premiumTags.forEach(tag => tag.style.display = 'none');
        
        console.log('✅ UI actualizada a Premium ACTIVO - Candados ocultos');
    } else {
        if (badgePremium) badgePremium.style.display = 'none';
        if (seccionPremiumActivo) seccionPremiumActivo.style.display = 'none';
        if (seccionPremiumInactivo) seccionPremiumInactivo.style.display = 'block';
        
        lockBadges.forEach(lock => lock.style.display = 'flex');
        premiumTags.forEach(tag => tag.style.display = 'inline-block');
        
        console.log('⚠️ UI actualizada a Premium INACTIVO - Candados visibles');
    }
}

function esPremium() {
    return estadoPremium;
}

function mostrarMensajePremium() {
    mostrarNotificacion('Esta función es exclusiva para usuarios Premium 💎', 'info');
    mostrarSeccion('premium');
}

function irACheckoutPremium() {
    if (esPremium()) {
        mostrarToastPremium('👑 ¡Ya eres Premium!', 'Tienes acceso completo a todas las funciones');
        mostrarSeccion('menu');
    } else {
        // Primero se elige el plan (mensual o anual) en la sección Premium
        mostrarSeccion('premium');
    }
}

function mostrarToastPremium(titulo, mensaje) {
    const existente = document.getElementById('toast-premium');
    if (existente) existente.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast-premium';
    toast.innerHTML = `
        <div class="toast-premium-content">
            <div class="toast-titulo">${titulo}</div>
            <div class="toast-mensaje">${mensaje}</div>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('visible'), 100);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function mostrarCelebracionPremium() {
    const modal = document.createElement('div');
    modal.id = 'modal-celebracion-premium';
    modal.innerHTML = `
        <div class="celebracion-overlay">
            <div class="celebracion-content">
                <div class="confetti-container" id="confetti-container"></div>
                <div class="corona-celebracion">👑</div>
                <h1>¡FELICIDADES!</h1>
                <h2>¡Ya eres Premium!</h2>
                <p>Ahora tienes acceso completo a todas las funciones de Aurora</p>
                <div class="premium-features-celebracion">
                    <span>🎴 40 Cartas</span>
                    <span>💫 Afirmaciones</span>
                    <span>🎨 Collage</span>
                    <span>🌸 Vision Board</span>
                    <span>📅 Hábitos</span>
                </div>
                <button onclick="cerrarCelebracion()" class="btn-celebracion">✨ ¡Comenzar a Brillar! ✨</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    crearConfeti();
    
    setTimeout(() => {
        modal.classList.add('visible');
    }, 100);
}

function crearConfeti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    const colores = ['#f4c542', '#ffd700', '#ff69b4', '#ff85a2', '#ffe9f3', '#fff', '#ff1493', '#ffa500'];
    
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const confeti = document.createElement('div');
            confeti.className = 'confeti';
            confeti.style.left = Math.random() * 100 + '%';
            confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            confeti.style.width = (Math.random() * 8 + 8) + 'px';
            confeti.style.height = (Math.random() * 8 + 8) + 'px';
            confeti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confeti);
        }, i * 50);
    }
}

function cerrarCelebracion() {
    const modal = document.getElementById('modal-celebracion-premium');
    if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
            mostrarSeccion('menu');
        }, 300);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { verificarEstadoPremium, iniciarCheckout, cancelarSuscripcion, esPremium, mostrarMensajePremium, irACheckoutPremium };
}
