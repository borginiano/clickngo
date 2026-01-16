const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get my notifications
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.id, read: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Error al marcar como leída' });
    }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, read: false },
            data: { read: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Error al marcar como leídas' });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
});

// Clear all notifications
router.delete('/clear-all', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.deleteMany({
            where: { userId: req.user.id }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Clear all error:', error);
        res.status(500).json({ error: 'Error al limpiar notificaciones' });
    }
});

// ===== Helper to create notifications =====
// This will be called from other routes (reviews, products, etc.)

const createNotification = async (userId, type, title, message, data = null) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data
            }
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

// Notify all vendors about new product (example broadcast)
router.post('/broadcast', authMiddleware, async (req, res) => {
    try {
        // Only admin can broadcast
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Solo admin puede enviar broadcasts' });
        }

        const { title, message, type = 'SYSTEM' } = req.body;

        // Get all users
        const users = await prisma.user.findMany({
            select: { id: true }
        });

        // Create notification for each user
        await Promise.all(
            users.map(user =>
                prisma.notification.create({
                    data: {
                        userId: user.id,
                        type,
                        title,
                        message
                    }
                })
            )
        );

        res.json({ success: true, count: users.length });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ error: 'Error al enviar broadcast' });
    }
});

module.exports = router;
module.exports.createNotification = createNotification;
