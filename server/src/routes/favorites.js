const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all favorites for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        // Get the product IDs
        const productIds = favorites.map(f => f.productId);

        // Fetch full product data
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                active: true
            },
            include: {
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        city: true
                    }
                }
            }
        });

        // Map to include isFavorite flag and preserve order
        const result = productIds.map(id => {
            const product = products.find(p => p.id === id);
            if (product) {
                return { ...product, isFavorite: true };
            }
            return null;
        }).filter(Boolean);

        res.json({
            favorites: result,
            count: result.length
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Error al obtener favoritos' });
    }
});

// Check if a product is in favorites
router.get('/check/:productId', authMiddleware, async (req, res) => {
    try {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: req.params.productId
                }
            }
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Error al verificar favorito' });
    }
});

// Add product to favorites
router.post('/:productId', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.productId;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Check if already in favorites
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId
                }
            }
        });

        if (existing) {
            return res.json({ message: 'Ya está en favoritos', isFavorite: true });
        }

        // Create favorite
        await prisma.favorite.create({
            data: {
                userId: req.user.id,
                productId
            }
        });

        res.json({ message: 'Agregado a favoritos', isFavorite: true });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Error al agregar a favoritos' });
    }
});

// Remove product from favorites
router.delete('/:productId', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.productId;

        await prisma.favorite.deleteMany({
            where: {
                userId: req.user.id,
                productId
            }
        });

        res.json({ message: 'Eliminado de favoritos', isFavorite: false });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Error al eliminar de favoritos' });
    }
});

// Toggle favorite (add if not exists, remove if exists)
router.post('/:productId/toggle', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.productId;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Check current state
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId
                }
            }
        });

        if (existing) {
            // Remove
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            res.json({ message: 'Eliminado de favoritos', isFavorite: false });
        } else {
            // Add
            await prisma.favorite.create({
                data: {
                    userId: req.user.id,
                    productId
                }
            });
            res.json({ message: 'Agregado a favoritos', isFavorite: true });
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ error: 'Error al cambiar favorito' });
    }
});

module.exports = router;
