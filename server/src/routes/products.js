const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, isVendor, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const FREE_PRODUCT_LIMIT = 5;

// Get all products (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { category, search, vendorId } = req.query;

        let where = { active: true };

        if (category) where.category = category;
        if (vendorId) where.vendorId = vendorId;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                vendor: {
                    include: {
                        user: { select: { name: true, avatar: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Get my products (vendor) - MUST be before /:id
router.get('/my/list', authMiddleware, isVendor, async (req, res) => {
    try {
        // Handle ADMIN users without vendor profile
        if (!req.user.vendor) {
            return res.json({
                products: [],
                productCount: 0,
                limit: null,
                canAddMore: false
            });
        }

        const products = await prisma.product.findMany({
            where: { vendorId: req.user.vendor.id },
            orderBy: { createdAt: 'desc' }
        });

        const productCount = products.length;
        const canAddMore = req.user.subscription === 'PREMIUM' || productCount < FREE_PRODUCT_LIMIT;

        res.json({
            products,
            productCount,
            limit: req.user.subscription === 'PREMIUM' ? null : FREE_PRODUCT_LIMIT,
            canAddMore
        });
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Get featured products - MUST be before /:id
router.get('/featured/list', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                active: true,
                featured: true,
                OR: [
                    { featuredUntil: null },
                    { featuredUntil: { gte: new Date() } }
                ]
            },
            include: {
                vendor: {
                    include: {
                        user: { select: { name: true, avatar: true } }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        res.json(products);
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ error: 'Error al obtener destacados' });
    }
});

// Get single product - MUST be after static routes
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                vendor: {
                    include: {
                        user: { select: { name: true, avatar: true, phone: true } }
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Create product (vendor only)
router.post('/', authMiddleware, isVendor, async (req, res) => {
    try {
        const { name, description, price, images, category } = req.body;

        // Allow price = 0 (free products)
        if (!name || price === undefined || price === null || price === '' || !category) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
        }

        // Check product limit for FREE users
        if (req.user.subscription === 'FREE') {
            const productCount = await prisma.product.count({
                where: { vendorId: req.user.vendor.id }
            });

            if (productCount >= FREE_PRODUCT_LIMIT) {
                return res.status(403).json({
                    error: `Límite de ${FREE_PRODUCT_LIMIT} productos alcanzado. Actualiza a Premium para productos ilimitados.`,
                    limitReached: true
                });
            }
        }

        const product = await prisma.product.create({
            data: {
                vendorId: req.user.vendor.id,
                name,
                description,
                price: parseFloat(price),
                images: images || [],
                category
            },
            include: {
                vendor: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Update product
router.put('/:id', authMiddleware, isVendor, async (req, res) => {
    try {
        const { name, description, price, images, category, active } = req.body;

        // Verify ownership
        const existingProduct = await prisma.product.findUnique({
            where: { id: req.params.id }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (existingProduct.vendorId !== req.user.vendor.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'No tienes permiso para editar este producto' });
        }

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                images,
                category,
                active
            }
        });

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Delete product
router.delete('/:id', authMiddleware, isVendor, async (req, res) => {
    try {
        // Verify ownership
        const existingProduct = await prisma.product.findUnique({
            where: { id: req.params.id }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (existingProduct.vendorId !== req.user.vendor.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
        }

        await prisma.product.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Toggle featured status (Premium vendors only)
router.post('/:id/feature', authMiddleware, isVendor, async (req, res) => {
    try {
        // Check if user is Premium
        if (req.user.subscription !== 'PREMIUM') {
            return res.status(403).json({ error: 'Solo usuarios Premium pueden destacar productos' });
        }

        const productId = req.params.id;

        // Verify product belongs to this vendor
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                vendor: { userId: req.user.id }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Toggle featured
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                featured: !product.featured,
                featuredUntil: !product.featured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 days
            }
        });

        res.json({
            message: updatedProduct.featured ? '⭐ Producto destacado!' : 'Producto quitado de destacados',
            featured: updatedProduct.featured,
            featuredUntil: updatedProduct.featuredUntil
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({ error: 'Error al destacar producto' });
    }
});

module.exports = router;
