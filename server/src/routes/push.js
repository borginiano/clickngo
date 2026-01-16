const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Register push token for the authenticated user
router.post('/register', authMiddleware, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token es requerido' });
        }

        // Update user's push token
        await prisma.user.update({
            where: { id: req.user.id },
            data: { pushToken: token }
        });

        console.log(`Push token registered for user ${req.user.id}`);
        res.json({ message: 'Token registrado correctamente' });
    } catch (error) {
        console.error('Register push token error:', error);
        res.status(500).json({ error: 'Error al registrar token' });
    }
});

// Unregister push token (logout)
router.post('/unregister', authMiddleware, async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { pushToken: null }
        });

        res.json({ message: 'Token eliminado correctamente' });
    } catch (error) {
        console.error('Unregister push token error:', error);
        res.status(500).json({ error: 'Error al eliminar token' });
    }
});

// Test push notification (for development)
router.post('/test', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { pushToken: true, name: true }
        });

        if (!user?.pushToken) {
            return res.status(400).json({ error: 'No hay token registrado' });
        }

        const { sendPushNotification } = require('../services/firebase');

        const result = await sendPushNotification(
            user.pushToken,
            '🔔 Test de ClickNGo',
            `Hola ${user.name}! Las notificaciones funcionan correctamente`,
            { type: 'test' }
        );

        if (result?.invalidToken) {
            // Clear invalid token
            await prisma.user.update({
                where: { id: req.user.id },
                data: { pushToken: null }
            });
            return res.status(400).json({ error: 'Token inválido, re-registrar' });
        }

        res.json({ message: 'Notificación de prueba enviada', result });
    } catch (error) {
        console.error('Test push error:', error);
        res.status(500).json({ error: 'Error al enviar notificación' });
    }
});

module.exports = router;
