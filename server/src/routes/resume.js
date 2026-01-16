const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /resume/my - Get my resume
router.get('/my', auth, async (req, res) => {
    try {
        const resume = await prisma.resume.findUnique({
            where: { userId: req.user.id }
        });

        res.json(resume);
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Error al obtener CV' });
    }
});

// GET /resume/:userId - Get public resume by user ID
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const resume = await prisma.resume.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        if (!resume) {
            return res.status(404).json({ error: 'CV no encontrado' });
        }

        // Only return if public or if owner is requesting
        if (!resume.isPublic) {
            return res.status(403).json({ error: 'Este CV es privado' });
        }

        res.json(resume);
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ error: 'Error al obtener CV' });
    }
});

// POST /resume - Create or update resume
router.post('/', auth, async (req, res) => {
    try {
        const { template, category, data, isPublic } = req.body;

        if (!category || !data) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Upsert - create or update
        const resume = await prisma.resume.upsert({
            where: { userId: req.user.id },
            create: {
                userId: req.user.id,
                template: template || 'professional',
                category,
                data,
                isPublic: isPublic || false
            },
            update: {
                template: template || 'professional',
                category,
                data,
                isPublic: isPublic !== undefined ? isPublic : false
            }
        });

        res.json(resume);
    } catch (error) {
        console.error('Error saving resume:', error);
        res.status(500).json({ error: 'Error al guardar CV' });
    }
});

// PATCH /resume/visibility - Toggle public/private
router.patch('/visibility', auth, async (req, res) => {
    try {
        const { isPublic } = req.body;

        const resume = await prisma.resume.findUnique({
            where: { userId: req.user.id }
        });

        if (!resume) {
            return res.status(404).json({ error: 'No tienes un CV creado' });
        }

        const updated = await prisma.resume.update({
            where: { userId: req.user.id },
            data: { isPublic }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating visibility:', error);
        res.status(500).json({ error: 'Error al actualizar visibilidad' });
    }
});

// DELETE /resume - Delete my resume
router.delete('/', auth, async (req, res) => {
    try {
        await prisma.resume.deleteMany({
            where: { userId: req.user.id }
        });

        res.json({ message: 'CV eliminado' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ error: 'Error al eliminar CV' });
    }
});

module.exports = router;
