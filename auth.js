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
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.55); z-index: 10001; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #ffe9f3 0%, #faf5f0 100%); padding: 2.5rem 2rem; border-radius: 20px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">💌</div>
                    <h2 style="color: #d63384; margin-bottom: 0.75rem; font-size: 1.5rem;">Revisa tu email</h2>
                    <p style="color: #8b7d7d; margin-bottom: 1.25rem;">Te enviamos un código de 6 dígitos a<br><strong id="codigo-email-destino"></strong></p>
                    <input type="text" id="codigo-acceso-input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" style="width: 100%; padding: 1rem; border: 2px solid #f4c542; border-radius: 10px; font-size: 1.6rem; letter-spacing: 0.4rem; margin-bottom: 0.75rem; text-align: center; display: block; box-sizing: border-box;">
                    <p id="codigo-acceso-error" style="color: #c0392b; min-height: 1.2rem; margin: 0 0 0.75rem 0; font-size: 0.95rem;"></p>
                    <button id="codigo-acceso-entrar" style="background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; border: none; padding: 1rem 2rem; font-size: 1.1rem; border-radius: 15px; cursor: pointer; width: 100%; font-weight: bold;">✨ ENTRAR ✨</button>
                    <p style="margin-top: 1.25rem; font-size: 0.9rem;">
                        <a href="#" id="codigo-acceso-reenviar" style="color: #8b4789;">Enviar otro código</a>
                        &nbsp;·&nbsp;
                        <a href="#" id="codigo-acceso-cancelar" style="color: #8b7d7d;">Cancelar</a>
                    </p>
                    <p style="color: #8b7d7d; margin-top: 0.75rem; font-size: 0.8rem;">¿No lo ves? Mira en Spam o Promociones.</p>
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
            btn.textContent = '✨ ENTRAR ✨';
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
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: linear-gradient(135deg, #ffe9f3 0%, #faf5f0 100%); padding: 3rem; border-radius: 20px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🌸</div>
                <h2 style="color: #d63384; margin-bottom: 1rem; font-size: 1.8rem;">Bienvenida a Aurora</h2>
                <p style="color: #8b7d7d; margin-bottom: 1.5rem;">Crea tu cuenta para comenzar tu transformación</p>
                
                <input type="text" id="nombre-registro" placeholder="Tu nombre" style="width: 100%; padding: 1rem; border: 2px solid #f4c542; border-radius: 10px; font-size: 1.1rem; margin-bottom: 1rem; text-align: center; display: block; box-sizing: border-box;">
                
                <input type="email" id="email-registro" placeholder="Tu email" style="width: 100%; padding: 1rem; border: 2px solid #f4c542; border-radius: 10px; font-size: 1.1rem; margin-bottom: 1rem; text-align: center; display: block; box-sizing: border-box;">
                
                <button id="btn-registrar" style="background: linear-gradient(135deg, #f4c542 0%, #f4a742 100%); color: white; border: none; padding: 1rem 2rem; font-size: 1.2rem; border-radius: 15px; cursor: pointer; width: 100%; font-weight: bold; box-shadow: 0 4px 15px rgba(244, 197, 66, 0.4);">
                    ✨ ENTRAR ✨
                </button>
                
                <p style="color: #8b7d7d; margin-top: 1.5rem; font-size: 0.9rem;">Tus datos están seguros y solo tú puedes acceder a ellos</p>
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
                btnRegistrar.textContent = '✨ ENTRAR ✨';
            }
        } catch (error) {
            console.error('Error registro:', error);
            alert('Error de conexión. Intenta nuevamente.');
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = '✨ ENTRAR ✨';
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
