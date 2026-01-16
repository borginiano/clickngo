const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware: auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const MAX_CLASSIFIEDS_PER_USER = 5;

// Job categories
const JOB_CATEGORIES = [
    'Gastronomía', 'Limpieza', 'Ventas', 'Construcción',
    'Cuidado de personas', 'Transporte', 'Administración',
    'Tecnología', 'Educación', 'Salud', 'Belleza', 'Otros'
];

// GET /classifieds - List all active classifieds
router.get('/', async (req, res) => {
    try {
        const { type, category, city, search } = req.query;

        const where = {
            active: true,
            expiresAt: { gt: new Date() }
        };

        if (type) where.type = type;
        if (category) where.category = category;
        if (city) where.city = { contains: city, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const classifieds = await prisma.classified.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(classifieds);
    } catch (error) {
        console.error('Error fetching classifieds:', error);
        res.status(500).json({ error: 'Error al obtener clasificados' });
    }
});

// GET /classifieds/categories - Get job categories
router.get('/categories', (req, res) => {
    res.json(JOB_CATEGORIES);
});

// GET /classifieds/my - Get my classifieds
router.get('/my', auth, async (req, res) => {
    try {
        const classifieds = await prisma.classified.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            classifieds,
            count: classifieds.length,
            maxAllowed: MAX_CLASSIFIEDS_PER_USER,
            remaining: MAX_CLASSIFIEDS_PER_USER - classifieds.length
        });
    } catch (error) {
        console.error('Error fetching my classifieds:', error);
        res.status(500).json({ error: 'Error al obtener tus clasificados' });
    }
});

// GET /classifieds/:id - Get single classified
router.get('/:id', async (req, res) => {
    try {
        const classified = await prisma.classified.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true, phone: true }
                }
            }
        });

        if (!classified) {
            return res.status(404).json({ error: 'Clasificado no encontrado' });
        }

        res.json(classified);
    } catch (error) {
        console.error('Error fetching classified:', error);
        res.status(500).json({ error: 'Error al obtener clasificado' });
    }
});

// POST /classifieds - Create new classified
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, category, jobType, province, city, contact, attachResume } = req.body;

        // Validate required fields
        if (!title || !description || !type || !category || !jobType || !city) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Check limit
        const count = await prisma.classified.count({
            where: { userId: req.user.id }
        });

        if (count >= MAX_CLASSIFIEDS_PER_USER) {
            return res.status(400).json({
                error: `Has alcanzado el límite de ${MAX_CLASSIFIEDS_PER_USER} clasificados. Elimina uno para crear otro.`
            });
        }

        // Create with 30 days expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const classified = await prisma.classified.create({
            data: {
                userId: req.user.id,
                title,
                description,
                type,
                category,
                jobType,
                province: province || null,
                city,
                contact: contact || null,
                attachResume: attachResume || false,
                expiresAt
            }
        });

        res.status(201).json(classified);
    } catch (error) {
        console.error('Error creating classified:', error);
        res.status(500).json({ error: 'Error al crear clasificado' });
    }
});

// PUT /classifieds/:id - Update classified
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, category, jobType, province, city, contact, active, attachResume } = req.body;

        // Check ownership
        const existing = await prisma.classified.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Clasificado no encontrado' });
        }

        if (existing.userId !== req.user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // Extend expiration on update
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const updated = await prisma.classified.update({
            where: { id },
            data: {
                title: title || existing.title,
                description: description || existing.description,
                type: type || existing.type,
                category: category || existing.category,
                jobType: jobType || existing.jobType,
                province: province !== undefined ? province : existing.province,
                city: city || existing.city,
                contact: contact !== undefined ? contact : existing.contact,
                attachResume: attachResume !== undefined ? attachResume : existing.attachResume,
                active: active !== undefined ? active : existing.active,
                expiresAt
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error updating classified:', error);
        res.status(500).json({ error: 'Error al actualizar clasificado' });
    }
});

// DELETE /classifieds/:id - Delete classified
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existing = await prisma.classified.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Clasificado no encontrado' });
        }

        if (existing.userId !== req.user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        await prisma.classified.delete({ where: { id } });

        res.json({ message: 'Clasificado eliminado' });
    } catch (error) {
        console.error('Error deleting classified:', error);
        res.status(500).json({ error: 'Error al eliminar clasificado' });
    }
});

module.exports = router;
