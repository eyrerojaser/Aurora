// Sistema de sincronización automática entre localStorage y servidor

let syncInterval = null;
let isSyncing = false;

// Iniciar sincronización automática cada 30 segundos
function iniciarSincronizacion() {
    if (syncInterval) return;
    
    // Sincronizar inmediatamente al iniciar
    sincronizarTodo();
    
    // Luego cada 30 segundos
    syncInterval = setInterval(() => {
        sincronizarTodo();
    }, 30000);
}

// Detener sincronización
function detenerSincronizacion() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Sincronizar todos los datos
async function sincronizarTodo() {
    if (isSyncing) return;
    isSyncing = true;
    
    try {
        await sincronizarCollage();
        await sincronizarVisionBoard();
        await sincronizarMetas();
        console.log('✅ Sincronización completa');
    } catch (error) {
        console.error('Error sincronización:', error);
    } finally {
        isSyncing = false;
    }
}

// Sincronizar collage
async function sincronizarCollage() {
    try {
        const canvas = document.getElementById('collage-canvas');
        if (!canvas) return;
        
        const htmlContent = canvas.innerHTML;
        if (!htmlContent || htmlContent.trim() === '') return;
        
        await fetch('/api/collage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ html_content: htmlContent })
        });
    } catch (error) {
        console.error('Error sync collage:', error);
    }
}

// Sincronizar vision board
async function sincronizarVisionBoard() {
    try {
        const canvas = document.getElementById('vision-canvas');
        if (!canvas) return;
        
        const htmlContent = canvas.innerHTML;
        if (!htmlContent || htmlContent.trim() === '') return;
        
        await fetch('/api/vision-board', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ html_content: htmlContent })
        });
    } catch (error) {
        console.error('Error sync vision board:', error);
    }
}

// Sincronizar metas
async function sincronizarMetas() {
    try {
        const metasLocal = localStorage.getItem('metas');
        if (!metasLocal) return;
        
        const metas = JSON.parse(metasLocal);
        if (!Array.isArray(metas) || metas.length === 0) return;
        
        // Obtener metas del servidor
        const res = await fetch('/api/metas', {
            credentials: 'include'
        });
        const metasServidor = await res.json();
        
        // Sincronizar solo metas nuevas que no estén en el servidor
        for (const meta of metas) {
            const existeEnServidor = metasServidor.some(m => 
                m.titulo === meta.titulo && m.categoria === meta.categoria
            );
            
            if (!existeEnServidor) {
                await fetch('/api/metas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        titulo: meta.titulo,
                        categoria: meta.categoria,
                        fecha_limite: meta.fechaLimite
                    })
                });
            }
        }
    } catch (error) {
        console.error('Error sync metas:', error);
    }
}

// Cargar datos desde servidor al iniciar
async function cargarDatosDesdeServidor() {
    try {
        // NO cargar collage/vision automáticamente - pierde event listeners
        // await cargarCollageDesdeServidor();
        // await cargarVisionBoardDesdeServidor();
        await cargarMetasDesdeServidor();
    } catch (error) {
        console.error('Error cargar datos:', error);
    }
}

// Cargar collage desde servidor
async function cargarCollageDesdeServidor() {
    try {
        const res = await fetch('/api/collage', {
            credentials: 'include'
        });
        const data = await res.json();
        
        if (data && data.html_content) {
            const canvas = document.getElementById('collage-canvas');
            if (canvas && !canvas.innerHTML.trim()) {
                canvas.innerHTML = data.html_content;
            }
        }
    } catch (error) {
        console.error('Error cargar collage:', error);
    }
}

// Cargar vision board desde servidor
async function cargarVisionBoardDesdeServidor() {
    try {
        const res = await fetch('/api/vision-board', {
            credentials: 'include'
        });
        const data = await res.json();
        
        if (data && data.html_content) {
            const canvas = document.getElementById('vision-canvas');
            if (canvas && !canvas.innerHTML.trim()) {
                canvas.innerHTML = data.html_content;
            }
        }
    } catch (error) {
        console.error('Error cargar vision board:', error);
    }
}

// Cargar metas desde servidor
async function cargarMetasDesdeServidor() {
    try {
        const res = await fetch('/api/metas', {
            credentials: 'include'
        });
        if (!res.ok) return;
        const metas = await res.json();
        
        if (Array.isArray(metas) && metas.length > 0) {
            // Solo actualizar si no hay metas locales
            const metasLocal = localStorage.getItem('metas');
            if (!metasLocal || metasLocal === '[]') {
                // Convertir formato servidor a formato local
                const metasFormateadas = metas.map(m => ({
                    titulo: m.titulo,
                    categoria: m.categoria,
                    fechaLimite: m.fecha_limite,
                    completada: m.completada
                }));
                localStorage.setItem('metas', JSON.stringify(metasFormateadas));
            }
        }
    } catch (error) {
        console.error('Error cargar metas:', error);
    }
}

// Iniciar cuando el usuario esté autenticado
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const usuario = obtenerUsuarioActual ? obtenerUsuarioActual() : null;
        if (usuario) {
            cargarDatosDesdeServidor();
            iniciarSincronizacion();
        }
    }, 2000);
});
