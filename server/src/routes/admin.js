const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalVendors,
            totalProducts,
            totalClassifieds,
            premiumUsers,
            newUsersThisWeek,
            verifiedVendors
        ] = await Promise.all([
            prisma.user.count(),
            prisma.vendor.count(),
            prisma.product.count(),
            prisma.classified.count(),
            prisma.user.count({ where: { subscription: 'PREMIUM' } }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.vendor.count({ where: { verified: true } })
        ]);

        res.json({
            totalUsers,
            totalVendors,
            totalProducts,
            totalClassifieds,
            premiumUsers,
            newUsersThisWeek,
            verifiedVendors
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// GET /api/admin/users - List users with pagination
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (role) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    role: true,
                    subscription: true,
                    createdAt: true,
                    vendor: { select: { id: true, businessName: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// PATCH /api/admin/users/:id - Update user role/subscription
router.patch('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, subscription } = req.body;

        const updateData = {};
        if (role) updateData.role = role;
        if (subscription) updateData.subscription = subscription;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                subscription: true
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// GET /api/admin/vendors - List vendors
router.get('/vendors', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', verified = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.businessName = { contains: search, mode: 'insensitive' };
        }
        if (verified !== '') {
            where.verified = verified === 'true';
        }

        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true, avatar: true } },
                    _count: { select: { products: true, reviews: true } }
                }
            }),
            prisma.vendor.count({ where })
        ]);

        res.json({
            vendors,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Admin vendors error:', error);
        res.status(500).json({ error: 'Error al obtener vendedores' });
    }
});

// PATCH /api/admin/vendors/:id/verify - Toggle vendor verification
router.patch('/vendors/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await prisma.vendor.findUnique({ where: { id } });
        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        const updated = await prisma.vendor.update({
            where: { id },
            data: { verified: !vendor.verified }
        });

        res.json(updated);
    } catch (error) {
        console.error('Admin verify vendor error:', error);
        res.status(500).json({ error: 'Error al verificar vendedor' });
    }
});

// GET /api/admin/products - List all products
router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (category) {
            where.category = category;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: {
                        select: {
                            id: true,
                            businessName: true,
                            user: { select: { name: true, email: true } }
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete product error:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// GET /api/admin/classifieds - List all classifieds
router.get('/classifieds', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', type = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        if (type) {
            where.type = type;
        }

        const [classifieds, total] = await Promise.all([
            prisma.classified.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true, avatar: true } }
                }
            }),
            prisma.classified.count({ where })
        ]);

        res.json({
            classifieds,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Admin classifieds error:', error);
        res.status(500).json({ error: 'Error al obtener clasificados' });
    }
});

// DELETE /api/admin/classifieds/:id - Delete classified
router.delete('/classifieds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.classified.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete classified error:', error);
        res.status(500).json({ error: 'Error al eliminar clasificado' });
    }
});

module.exports = router;
