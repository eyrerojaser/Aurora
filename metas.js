function mostrarFormularioMeta() {
    const formulario = document.getElementById('formulario-meta-expandible');
    if (formulario.style.display === 'none') {
        formulario.style.display = 'block';
    } else {
        formulario.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    cargarMetas();

    const metaForm = document.getElementById("metaForm");
    metaForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = localStorage.getItem('userEmail') || 'anonimo';
        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        const categoria = document.getElementById('categoria').value;
        const fechaLimite = document.getElementById('fechaLimite').value;

        try {
            const response = await fetch('/api/metas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    titulo,
                    descripcion,
                    categoria,
                    fecha_limite: fechaLimite,
                    completada: false
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarNotificacion('✨ ¡Meta creada exitosamente! 🎯', 'success');
                metaForm.reset();
                document.getElementById('formulario-meta-expandible').style.display = 'none';
                cargarMetas();
            } else {
                alert('⚠️ Error al crear la meta: ' + data.error);
            }
        } catch (error) {
            alert('⚠️ Error al crear la meta. Por favor, intenta de nuevo.');
        }
    });
});

async function cargarMetas() {
    const email = localStorage.getItem('userEmail');
    
    if (!email || email === 'anonimo') {
        mostrarMetasActivas([]);
        mostrarLogros([]);
        return;
    }
    
    try {
        // Las metas se piden con la sesión abierta (antes se pedían a una dirección que no existe)
        const response = await fetch('/api/metas', { credentials: 'include' });
        
        if (!response.ok) {
            mostrarMetasActivas([]);
            mostrarLogros([]);
            return;
        }
        
        const metas = await response.json();

        const metasActivas = metas.filter(m => !m.completada);
        const logrosCompletados = metas.filter(m => m.completada);

        mostrarMetasActivas(metasActivas);
        mostrarLogros(logrosCompletados);
    } catch (error) {
        console.error('Error al cargar metas:', error);
        mostrarMetasActivas([]);
        mostrarLogros([]);
    }
}

function mostrarMetasActivas(metas) {
    const container = document.getElementById('metasActivas');
    
    if (metas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Aún no tienes metas. ¡Crea tu primera meta arriba! 🌟</p>';
        return;
    }

    container.innerHTML = metas.map(meta => {
        const fechaLimite = new Date(meta.fecha_limite);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        
        const iconosCategoria = {
            'salud': '🧘‍♀️',
            'belleza': '💅',
            'desarrollo': '📚',
            'trabajo': '💼',
            'relaciones': '💖',
            'hobbies': '🎨'
        };

        return `
            <div class="meta-card">
                <div class="meta-header">
                    <span class="meta-icon">${iconosCategoria[meta.categoria] || '🎯'}</span>
                    <h3>${meta.titulo}</h3>
                </div>
                <p class="meta-descripcion">${meta.descripcion || ''}</p>
                <div class="meta-footer">
                    <span class="meta-fecha">📅 ${!meta.fecha_limite ? 'Sin fecha límite' : (diasRestantes > 0 ? `${diasRestantes} días restantes` : '¡Fecha límite pasada!')}</span>
                    <button onclick="marcarCompletada(${meta.id})" class="btn-completar">✓ Completar</button>
                </div>
            </div>
        `;
    }).join('');
}

function mostrarLogros(logros) {
    const container = document.getElementById('logrosCompletados');
    
    if (logros.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Aún no has completado ninguna meta. ¡Sigue adelante! 💪</p>';
        return;
    }

    container.innerHTML = logros.map(logro => {
        const iconosCategoria = {
            'salud': '🧘‍♀️',
            'belleza': '💅',
            'desarrollo': '📚',
            'trabajo': '💼',
            'relaciones': '💖',
            'hobbies': '🎨'
        };

        return `
            <div class="logro-card">
                <div class="logro-icon">🏆</div>
                <h4>${iconosCategoria[logro.categoria] || '🎯'} ${logro.titulo}</h4>
                <p>${logro.descripcion || ''}</p>
            </div>
        `;
    }).join('');
}

async function marcarCompletada(id) {
    try {
        const response = await fetch(`/api/metas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completada: true })
        });

        if (response.ok) {
            alert('🎉 ¡Felicitaciones! Meta completada 🏆');
            cargarMetas();
        } else {
            alert('⚠️ Error al actualizar la meta');
        }
    } catch (error) {
        alert('⚠️ Error al actualizar la meta');
    }
}
