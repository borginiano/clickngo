const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get my conversations
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            },
            orderBy: { lastActivity: 'desc' }
        });

        // Get other participant info for each conversation
        const conversationsWithUsers = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participant1 === userId ? conv.participant2 : conv.participant1;
                const otherUser = await prisma.user.findUnique({
                    where: { id: otherUserId },
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        vendor: { select: { id: true, businessName: true, city: true } }
                    }
                });

                // Count unread messages
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        read: false
                    }
                });

                return {
                    ...conv,
                    otherUser,
                    unreadCount
                };
            })
        );

        res.json(conversationsWithUsers);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Error al obtener conversaciones' });
    }
});

// Get or create conversation with a user
router.post('/start/:userId', authMiddleware, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.userId;

        if (myId === otherId) {
            return res.status(400).json({ error: 'No puedes chatear contigo mismo' });
        }

        // Check if conversation exists (either direction)
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { participant1: myId, participant2: otherId },
                    { participant1: otherId, participant2: myId }
                ]
            }
        });

        // Create if doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participant1: myId,
                    participant2: otherId
                }
            });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Error al iniciar conversación' });
    }
});

// Get messages from a conversation
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        // Mark received messages as read
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                read: false
            },
            data: { read: true }
        });

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// Send a message
router.post('/:conversationId/send', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Mensaje vacío' });
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { participant1: senderId },
                    { participant2: senderId }
                ]
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                content: content.trim()
            }
        });

        // Update conversation lastMessage and lastActivity
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content.trim().substring(0, 100),
                lastActivity: new Date()
            }
        });

        res.json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// Get total unread count (for badge)
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all conversations where I'm a participant
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            },
            select: { id: true }
        });

        const conversationIds = conversations.map(c => c.id);

        // Count unread messages not from me
        const unreadCount = await prisma.message.count({
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: userId },
                read: false
            }
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({ error: 'Error' });
    }
});

module.exports = router;
