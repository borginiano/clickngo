const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

/**
 * Send push notification to a specific user
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
async function sendPushNotification(token, title, body, data = {}) {
    if (!token) {
        console.log('No push token provided, skipping notification');
        return null;
    }

    const message = {
        token,
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        webpush: {
            fcmOptions: {
                link: data.url || 'https://clickngo.bdsmbefree.com'
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Push notification sent:', response);
        return response;
    } catch (error) {
        console.error('Error sending push notification:', error);
        // If token is invalid, return special marker
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            return { invalidToken: true };
        }
        return null;
    }
}

/**
 * Send push notification to multiple users
 * @param {string[]} tokens - Array of FCM device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
async function sendMulticastNotification(tokens, title, body, data = {}) {
    if (!tokens || tokens.length === 0) {
        console.log('No tokens provided, skipping multicast');
        return null;
    }

    const message = {
        tokens,
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Multicast sent: ${response.successCount} success, ${response.failureCount} failures`);
        return response;
    } catch (error) {
        console.error('Error sending multicast notification:', error);
        return null;
    }
}

module.exports = {
    sendPushNotification,
    sendMulticastNotification,
    admin
};
