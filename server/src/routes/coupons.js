const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all coupons for a vendor (public - for customers to see)
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            where: {
                vendorId: req.params.vendorId,
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        // Hide sensitive info for public view
        const publicCoupons = coupons.map(c => ({
            id: c.id,
            code: c.code,
            discount: c.discount,
            description: c.description,
            minPurchase: c.minPurchase,
            expiresAt: c.expiresAt
        }));

        res.json(publicCoupons);
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ error: 'Error al obtener cupones' });
    }
});

// Get MY coupons (vendor only)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.id }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'No eres vendedor' });
        }

        const coupons = await prisma.coupon.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(coupons);
    } catch (error) {
        console.error('Get my coupons error:', error);
        res.status(500).json({ error: 'Error al obtener cupones' });
    }
});

// Create a coupon
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { code, discount, description, minPurchase, maxUses, expiresAt } = req.body;

        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.id }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'No eres vendedor' });
        }

        if (!code || !discount) {
            return res.status(400).json({ error: 'Código y descuento son requeridos' });
        }

        if (discount < 1 || discount > 100) {
            return res.status(400).json({ error: 'Descuento debe ser entre 1 y 100' });
        }

        // Check if code already exists for this vendor
        const existing = await prisma.coupon.findUnique({
            where: {
                vendorId_code: { vendorId: vendor.id, code: code.toUpperCase() }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Ya existe un cupón con ese código' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                vendorId: vendor.id,
                code: code.toUpperCase(),
                discount,
                description,
                minPurchase: minPurchase || null,
                maxUses: maxUses || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        res.json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ error: 'Error al crear cupón' });
    }
});

// Update a coupon
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { active, description, minPurchase, maxUses, expiresAt } = req.body;

        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.id }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'No eres vendedor' });
        }

        const coupon = await prisma.coupon.findFirst({
            where: {
                id: req.params.id,
                vendorId: vendor.id
            }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupón no encontrado' });
        }

        const updated = await prisma.coupon.update({
            where: { id: req.params.id },
            data: {
                active: active !== undefined ? active : coupon.active,
                description: description !== undefined ? description : coupon.description,
                minPurchase: minPurchase !== undefined ? minPurchase : coupon.minPurchase,
                maxUses: maxUses !== undefined ? maxUses : coupon.maxUses,
                expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : coupon.expiresAt
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ error: 'Error al actualizar cupón' });
    }
});

// Delete a coupon
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.id }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'No eres vendedor' });
        }

        const coupon = await prisma.coupon.findFirst({
            where: {
                id: req.params.id,
                vendorId: vendor.id
            }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupón no encontrado' });
        }

        await prisma.coupon.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Cupón eliminado' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ error: 'Error al eliminar cupón' });
    }
});

// Validate a coupon (for customers)
router.post('/validate', async (req, res) => {
    try {
        const { vendorId, code } = req.body;

        const coupon = await prisma.coupon.findFirst({
            where: {
                vendorId,
                code: code.toUpperCase(),
                active: true
            }
        });

        if (!coupon) {
            return res.status(404).json({ valid: false, error: 'Cupón no válido' });
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ valid: false, error: 'Cupón expirado' });
        }

        // Check max uses
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ valid: false, error: 'Cupón agotado' });
        }

        res.json({
            valid: true,
            discount: coupon.discount,
            description: coupon.description,
            minPurchase: coupon.minPurchase
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ error: 'Error al validar cupón' });
    }
});

module.exports = router;
