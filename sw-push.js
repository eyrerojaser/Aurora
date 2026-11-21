self.addEventListener('push', function(event) {
    let data = { title: 'Ella Florece', body: 'Es hora de tu hábito!', icon: '/icon-512.png' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body || 'Recordatorio de Ella Florece',
        icon: data.icon || '/icon-512.png',
        badge: '/icon-512.png',
        vibrate: [200, 100, 200],
        tag: data.tag || ('aurora-' + (data.title || 'habito')),
        data: {
            url: data.url || '/app#habitos-calendario'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Ella Florece', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/app';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let client of clientList) {
                if (client.url.includes('/app') && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(urlToOpen);
        })
    );
});
