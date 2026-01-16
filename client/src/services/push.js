import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../api';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjTmNe_-HeaWKeysLxJjmoCXledKu-rus",
    authDomain: "clickngo-a0c9e.firebaseapp.com",
    projectId: "clickngo-a0c9e",
    storageBucket: "clickngo-a0c9e.firebasestorage.app",
    messagingSenderId: "543122896226",
    appId: "1:543122896226:web:5f3083b556ef072e28630a"
};

// VAPID key for web push
const VAPID_KEY = "BPj7ADuGXNz4JfDZsmiQRGWjgc5DIAXUgunss4omY7lh1hLA46EhGGm_z26c80kQMzR-gl4L7XVPsVUI0PTxsvE";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let messaging = null;

// Check if messaging is supported
const isMessagingSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Initialize messaging
const initMessaging = () => {
    if (!messaging && isMessagingSupported()) {
        messaging = getMessaging(app);
    }
    return messaging;
};

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if denied
 */
export const requestNotificationPermission = async () => {
    if (!isMessagingSupported()) {
        console.log('Push notifications not supported');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        const msg = initMessaging();

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker registered:', registration);

        // Get FCM token
        const token = await getToken(msg, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
};

/**
 * Register FCM token with backend
 * @param {string} token - FCM device token
 */
export const registerPushToken = async (token) => {
    try {
        await api.post('/push/register', { token });
        console.log('Push token registered with backend');
        return true;
    } catch (error) {
        console.error('Error registering push token:', error);
        return false;
    }
};

/**
 * Unregister push token (on logout)
 */
export const unregisterPushToken = async () => {
    try {
        await api.post('/push/unregister');
        console.log('Push token unregistered');
        return true;
    } catch (error) {
        console.error('Error unregistering push token:', error);
        return false;
    }
};

/**
 * Initialize push notifications (call after login)
 */
export const initPushNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
        await registerPushToken(token);
        setupForegroundHandler();
    }
    return token;
};

/**
 * Setup handler for foreground messages
 */
const setupForegroundHandler = () => {
    const msg = initMessaging();
    if (!msg) return;

    onMessage(msg, (payload) => {
        console.log('Foreground message received:', payload);

        // Show notification using Notification API
        if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'ClickNGo', {
                body: payload.notification?.body || 'Nueva notificación',
                icon: '/icon-192.png',
                tag: payload.data?.type || 'default'
            });
        }
    });
};

export default {
    requestNotificationPermission,
    registerPushToken,
    unregisterPushToken,
    initPushNotifications,
    isMessagingSupported
};
