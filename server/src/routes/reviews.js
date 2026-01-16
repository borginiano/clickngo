const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// VENDOR REVIEWS
// ==========================================

// Get reviews for a vendor
router.get('/vendor/:vendorId', optionalAuth, async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { vendorId: req.params.vendorId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Check if current user has reviewed
        let userReview = null;
        if (req.user) {
            userReview = reviews.find(r => r.userId === req.user.id);
        }

        res.json({
            reviews,
            userReview,
            count: reviews.length
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
});

// Create or update a vendor review
router.post('/vendor/:vendorId', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const vendorId = req.params.vendorId;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });
        }

        // Check if vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // Can't review yourself
        if (vendor.userId === userId) {
            return res.status(400).json({ error: 'No puedes reseñarte a ti mismo' });
        }

        // Upsert review (create or update)
        const review = await prisma.review.upsert({
            where: {
                vendorId_userId: { vendorId, userId }
            },
            update: {
                rating,
                comment: comment || null
            },
            create: {
                vendorId,
                userId,
                rating,
                comment: comment || null
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        // Recalculate vendor average rating
        const stats = await prisma.review.aggregate({
            where: { vendorId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                avgRating: stats._avg.rating || 0,
                totalReviews: stats._count.rating || 0
            }
        });

        res.json({
            review,
            avgRating: stats._avg.rating || 0,
            totalReviews: stats._count.rating || 0
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Error al guardar reseña' });
    }
});

// Delete a vendor review
router.delete('/:reviewId', authMiddleware, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: req.params.reviewId }
        });

        if (!review) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        // Only review author or admin can delete
        if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const vendorId = review.vendorId;

        await prisma.review.delete({
            where: { id: req.params.reviewId }
        });

        // Recalculate vendor stats
        const stats = await prisma.review.aggregate({
            where: { vendorId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                avgRating: stats._avg.rating || 0,
                totalReviews: stats._count.rating || 0
            }
        });

        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
});

// ==========================================
// PRODUCT REVIEWS
// ==========================================

// Get reviews for a product
router.get('/product/:productId', optionalAuth, async (req, res) => {
    try {
        const reviews = await prisma.productReview.findMany({
            where: { productId: req.params.productId },
            orderBy: { createdAt: 'desc' }
        });

        // Check if current user has reviewed
        let userReview = null;
        if (req.user) {
            userReview = reviews.find(r => r.userId === req.user.id);
        }

        // Get product rating info
        const product = await prisma.product.findUnique({
            where: { id: req.params.productId },
            select: { avgRating: true, totalReviews: true }
        });

        res.json({
            reviews,
            userReview,
            count: reviews.length,
            avgRating: product?.avgRating || 0,
            totalReviews: product?.totalReviews || 0
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
});

// Create or update a product review
router.post('/product/:productId', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });
        }

        // Check if product exists and get vendor info
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { vendor: true }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Can't review your own product
        if (product.vendor.userId === userId) {
            return res.status(400).json({ error: 'No puedes reseñar tu propio producto' });
        }

        // Upsert review (create or update)
        const review = await prisma.productReview.upsert({
            where: {
                productId_userId: { productId, userId }
            },
            update: {
                rating,
                comment: comment || null,
                userName: req.user.name,
                userAvatar: req.user.avatar
            },
            create: {
                productId,
                userId,
                userName: req.user.name,
                userAvatar: req.user.avatar,
                rating,
                comment: comment || null
            }
        });

        // Recalculate product average rating
        const stats = await prisma.productReview.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.product.update({
            where: { id: productId },
            data: {
                avgRating: stats._avg.rating || 0,
                totalReviews: stats._count.rating || 0
            }
        });

        res.json({
            review,
            avgRating: stats._avg.rating || 0,
            totalReviews: stats._count.rating || 0
        });
    } catch (error) {
        console.error('Create product review error:', error);
        res.status(500).json({ error: 'Error al guardar reseña' });
    }
});

// Delete a product review
router.delete('/product/:reviewId', authMiddleware, async (req, res) => {
    try {
        const review = await prisma.productReview.findUnique({
            where: { id: req.params.reviewId }
        });

        if (!review) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        // Only review author or admin can delete
        if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const productId = review.productId;

        await prisma.productReview.delete({
            where: { id: req.params.reviewId }
        });

        // Recalculate product stats
        const stats = await prisma.productReview.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.product.update({
            where: { id: productId },
            data: {
                avgRating: stats._avg.rating || 0,
                totalReviews: stats._count.rating || 0
            }
        });

        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        console.error('Delete product review error:', error);
        res.status(500).json({ error: 'Error al eliminar reseña' });
    }
});

module.exports = router;
