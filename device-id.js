// Sistema simple de ID único por dispositivo
// No usa cookies ni sesiones - solo localStorage

function obtenerDeviceId() {
    let deviceId = localStorage.getItem('aurora_device_id');
    
    if (!deviceId) {
        // Generar ID único: timestamp + random
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('aurora_device_id', deviceId);
        console.log('🆔 Nuevo Device ID creado:', deviceId);
    }
    
    return deviceId;
}

// Exportar para usar en otros archivos
window.obtenerDeviceId = obtenerDeviceId;
