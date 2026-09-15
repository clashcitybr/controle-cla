self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const titulo = data.titulo || 'Clash City BR';
    const opcoes = {
        body: data.corpo || 'Nova notificação',
        icon: data.icone || '/img/Perfil_COC-removebg-preview.png',
        badge: '/img/Perfil_COC-removebg-preview.png',
        vibrate: [200, 100, 200],
        data: { url: 'https://clashcitybr.github.io/controle-cla/' }
    };

    event.waitUntil(
        self.registration.showNotification(titulo, opcoes)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
