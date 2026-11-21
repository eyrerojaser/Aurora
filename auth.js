let usuarioActual = null;

async function verificarSesion() {
    try {
        const res = await fetch('/api/sesion', {
            credentials: 'include'
        });
        const data = await res.json();
        
        if (data.logueado) {
            usuarioActual = data.usuario;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            mostrarApp();
            actualizarHeaderPersonalizado();
            return true;
        } else {
            // Si no hay sesión activa, verificar si hay usuario guardado localmente
            const usuarioLocal = localStorage.getItem('usuario');
            if (usuarioLocal) {
                const usuario = JSON.parse(usuarioLocal);
                // Hacer auto-login solo si tenemos email
                if (usuario.email) {
                    const autoLogin = await hacerAutoLogin(usuario.nombre, usuario.email);
                    if (autoLogin) {
                        return true;
                    }
                }
            }
            mostrarRegistro();
            return false;
        }
    } catch (error) {
        console.error('Error verificar sesión:', error);
        // Intentar recuperar sesión local
        const usuarioLocal = localStorage.getItem('usuario');
        if (usuarioLocal) {
            const usuario = JSON.parse(usuarioLocal);
            if (usuario.email) {
                const autoLogin = await hacerAutoLogin(usuario.nombre, usuario.email);
                if (autoLogin) {
                    return true;
                }
            }
        }
        mostrarRegistro();
        return false;
    }
}

// El acceso ahora pide un código que llega por email, así que ya no se puede
// volver a entrar automáticamente solo con el email guardado en el teléfono.
async function hacerAutoLogin(nombre, email) {
    return false;
}

// Muestra la ventana para escribir el código de 6 dígitos enviado por email.
// Devuelve { success: true, usuario } o { success: false, error }.
function pedirCodigoAcceso(nombre, email) {
    return new Promise((resolve) => {
        const previo = document.getElementById('ventana-codigo-acceso');
        if (previo) previo.remove();

        const ventana = document.createElement('div');
        ventana.id = 'ventana-codigo-acceso';
        ventana.innerHTML = `
            <div class="a2-login-fondo" style="z-index: 10001;">
                <div class="a2-login-card">
                    <img src="/static/images/cartas-aurora/loto.svg" alt="" class="a2-loto">
                    <h2 class="a2-login-titulo" style="font-size: 2rem;">Revisa tu email</h2>
                    <p class="a2-login-texto">Te enviamos un código de 6 dígitos a<br><strong id="codigo-email-destino"></strong></p>
                    <input type="text" id="codigo-acceso-input" class="a2-input a2-input-codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000">
                    <p id="codigo-acceso-error" class="a2-login-error"></p>
                    <button id="codigo-acceso-entrar" class="a2-btn">Entrar</button>
                    <p class="a2-login-enlaces">
                        <a href="#" id="codigo-acceso-reenviar">Enviar otro código</a>
                        &nbsp;·&nbsp;
                        <a href="#" id="codigo-acceso-cancelar" style="color: var(--a2-suave);">Cancelar</a>
                    </p>
                    <p class="a2-login-nota">¿No lo ves? Mira en Spam o Promociones.</p>
                </div>
            </div>
        `;
        document.body.appendChild(ventana);

        const input = document.getElementById('codigo-acceso-input');
        const error = document.getElementById('codigo-acceso-error');
        const btn = document.getElementById('codigo-acceso-entrar');
        document.getElementById('codigo-email-destino').textContent = email;

        const terminar = (resultado) => {
            ventana.remove();
            resolve(resultado);
        };

        const verificar = async () => {
            const codigo = input.value.replace(/\D/g, '');
            if (codigo.length !== 6) {
                error.textContent = 'Escribe los 6 dígitos del código';
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Verificando...';
            error.textContent = '';
            try {
                const res = await fetch('/api/verificar-codigo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nombre, email, codigo })
                });
                const data = await res.json();
                if (data.success) {
                    terminar(data);
                    return;
                }
                error.textContent = data.error || 'No se pudo verificar el código';
            } catch (e) {
                console.error('Error verificar código:', e);
                error.textContent = 'Error de conexión. Intenta nuevamente.';
            }
            btn.disabled = false;
            btn.textContent = 'Entrar';
        };

        btn.addEventListener('click', verificar);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verificar();
        });

        document.getElementById('codigo-acceso-reenviar').addEventListener('click', async (e) => {
            e.preventDefault();
            error.textContent = 'Enviando...';
            try {
                const res = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nombre, email })
                });
                const data = await res.json();
                error.textContent = data.requiere_codigo
                    ? 'Listo. Si no llega, espera un minuto y vuelve a pedirlo.'
                    : (data.error || 'No se pudo enviar el código');
            } catch (err) {
                error.textContent = 'Error de conexión. Intenta nuevamente.';
            }
        });

        document.getElementById('codigo-acceso-cancelar').addEventListener('click', (e) => {
            e.preventDefault();
            terminar({ success: false, error: 'Necesitas el código para entrar' });
        });

        setTimeout(() => input.focus(), 200);
    });
}

function mostrarRegistro() {
    const existeFormulario = document.getElementById('formulario-registro-simple');
    if (existeFormulario) return;
    
    const formulario = document.createElement('div');
    formulario.id = 'formulario-registro-simple';
    formulario.innerHTML = `
        <div class="a2-login-fondo">
            <div class="a2-login-card">
                <img src="/static/images/cartas-aurora/loto.svg" alt="" class="a2-loto">
                <h2 class="a2-login-titulo">Ella Florece</h2>
                <p class="a2-login-sub">Tu guía de empoderamiento</p>
                <p class="a2-login-texto">Un espacio solo para ti,<br>para florecer un día a la vez.</p>
                <input type="text" id="nombre-registro" class="a2-input" placeholder="Tu nombre" autocomplete="given-name">
                <input type="email" id="email-registro" class="a2-input" placeholder="Tu email" autocomplete="email">
                <button id="btn-registrar" class="a2-btn">Entrar</button>
                <p class="a2-login-nota">Te enviaremos un código a tu email para entrar.<br>Sin contraseñas, y tus datos son solo tuyos.</p>
            </div>
        </div>
    `;

    
    document.body.appendChild(formulario);
    
    const btnRegistrar = document.getElementById('btn-registrar');
    const inputNombre = document.getElementById('nombre-registro');
    const inputEmail = document.getElementById('email-registro');
    
    inputEmail.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnRegistrar.click();
        }
    });
    
    btnRegistrar.addEventListener('click', async () => {
        const nombre = inputNombre.value.trim();
        const email = inputEmail.value.trim().toLowerCase();
        
        if (!nombre) {
            alert('Por favor ingresa tu nombre');
            return;
        }
        
        if (!email) {
            alert('Por favor ingresa tu email');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingresa un email válido');
            return;
        }
        
        btnRegistrar.disabled = true;
        btnRegistrar.textContent = 'Registrando...';
        
        try {
            const res = await fetch('/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ nombre, email })
            });
            
            let data = await res.json();
            
            if (data.requiere_codigo) {
                btnRegistrar.textContent = 'Revisa tu email...';
                data = await pedirCodigoAcceso(nombre, email);
            }
            
            if (data.success) {
                usuarioActual = data.usuario;
                localStorage.setItem('usuario', JSON.stringify(usuarioActual));
                
                formulario.remove();
                mostrarApp();
                actualizarHeaderPersonalizado();
                
                setTimeout(() => {
                    alert(`¡Bienvenida ${nombre}! 🌸\n\nTus datos ahora están guardados de forma segura en la nube.`);
                }, 300);
            } else {
                alert(data.error || 'Error al registrar');
                btnRegistrar.disabled = false;
                btnRegistrar.textContent = 'Entrar';
            }
        } catch (error) {
            console.error('Error registro:', error);
            alert('Error de conexión. Intenta nuevamente.');
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = 'Entrar';
        }
    });
    
    setTimeout(() => {
        inputNombre.focus();
    }, 300);
}

function mostrarApp() {
    const formulario = document.getElementById('formulario-registro-simple');
    if (formulario) {
        formulario.remove();
    }
    
    const header = document.querySelector('header');
    if (header) {
        header.classList.remove('oculto');
    }
    
    const btnMenu = document.querySelector('.btn-menu-flotante');
    if (btnMenu) {
        btnMenu.classList.remove('oculto');
    }
    
    // Ya dentro: traer el diario guardado en la nube
    if (typeof sincronizarDiario === 'function') sincronizarDiario();
}

function obtenerUsuarioActual() {
    return usuarioActual;
}

window.addEventListener('DOMContentLoaded', async () => {
    const sesionActiva = await verificarSesion();
    if (sesionActiva && typeof verificarEstadoPremium === 'function') {
        await verificarEstadoPremium();
    }
});
