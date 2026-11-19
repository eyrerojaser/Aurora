// ============ GESTIÓN DE DATOS DE LA USUARIA ============

function borrarTodosLosDatos() {
    const confirmacion1 = confirm('⚠️ ADVERTENCIA: Esta acción borrará TODOS tus datos de forma permanente.\n\n¿Estás absolutamente segura?');
    
    if (!confirmacion1) return;
    
    const confirmacion2 = confirm('🚨 ÚLTIMA CONFIRMACIÓN:\n\nSe borrarán:\n- Todas tus entradas del diario\n- Todas tus metas\n- Todos tus hábitos\n- Tus collages y vision board\n- Todas tus afirmaciones\n\nEsta acción NO se puede deshacer.\n\n¿Continuar?');
    
    if (!confirmacion2) return;
    
    fetch('/api/datos', { 
        method: 'DELETE',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpiar también localStorage
                localStorage.clear();
                alert('✅ Todos tus datos han sido eliminados permanentemente');
                // Cerrar sesión y recargar
                fetch('/api/sesion', { 
                    method: 'DELETE',
                    credentials: 'include'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                alert('❌ Error: ' + data.error);
            }
        })
        .catch(error => alert('Error: ' + error));
}
