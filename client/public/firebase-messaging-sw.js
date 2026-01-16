// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDfNOeGo_EqaNKuyeJxJj7WKOLA6Wurwe",
    authDomain: "clickngo-a0c9e.firebaseapp.com",
    projectId: "clickngo-a0c9e",
    storageBucket: "clickngo-a0c9e.firebasestorage.app",
    messagingSenderId: "543122896226",
    appId: "1:543122896226:web:5f3083b556ef072e28630a"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'ClickNGo';
    const notificationOptions = {
        body: payload.notification?.body || 'Nueva notificación',
        icon: '/icon-192.png',
        badge: '/icon-badge.png',
        tag: payload.data?.type || 'default',
        data: payload.data,
        actions: [
            { action: 'open', title: 'Ver' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.notification.tag);
    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if open
                for (const client of clientList) {
                    if (client.url.includes('clickngo') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
