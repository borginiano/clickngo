const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, isVendor } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get vendor statistics
router.get('/vendor', authMiddleware, isVendor, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get vendor
        const vendor = await prisma.vendor.findUnique({
            where: { userId },
            select: {
                id: true,
                businessName: true,
                avgRating: true,
                totalReviews: true,
                followerCount: true
            }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // Get products
        const products = await prisma.product.findMany({
            where: { vendorId: vendor.id },
            select: {
                id: true,
                name: true,
                active: true,
                featured: true,
                avgRating: true,
                totalReviews: true,
                images: true,
                price: true
            }
        });

        // Count favorites for each product
        const productIds = products.map(p => p.id);
        const favoriteCounts = await prisma.favorite.groupBy({
            by: ['productId'],
            where: { productId: { in: productIds } },
            _count: { id: true }
        });

        // Map favorites to products
        const productsWithFavorites = products.map(product => {
            const favoriteData = favoriteCounts.find(f => f.productId === product.id);
            return {
                ...product,
                favoriteCount: favoriteData?._count?.id || 0
            };
        });

        // Calculate totals
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.active).length;
        const featuredProducts = products.filter(p => p.featured).length;
        const totalFavorites = favoriteCounts.reduce((sum, f) => sum + f._count.id, 0);

        // Top products by favorites
        const topProducts = productsWithFavorites
            .sort((a, b) => b.favoriteCount - a.favoriteCount)
            .slice(0, 5);

        res.json({
            vendor: {
                businessName: vendor.businessName,
                avgRating: vendor.avgRating,
                totalReviews: vendor.totalReviews,
                followerCount: vendor.followerCount
            },
            stats: {
                totalProducts,
                activeProducts,
                featuredProducts,
                totalFavorites,
                avgRating: vendor.avgRating,
                totalReviews: vendor.totalReviews,
                followers: vendor.followerCount
            },
            topProducts
        });
    } catch (error) {
        console.error('Get vendor stats error:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
