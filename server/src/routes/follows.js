const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get follow status and follower count for a vendor
router.get('/vendor/:vendorId', optionalAuth, async (req, res) => {
    try {
        const vendorId = req.params.vendorId;

        // Get follower count
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { followerCount: true }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // Check if current user follows
        let isFollowing = false;
        if (req.user) {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_vendorId: {
                        followerId: req.user.id,
                        vendorId
                    }
                }
            });
            isFollowing = !!follow;
        }

        res.json({
            isFollowing,
            followerCount: vendor.followerCount
        });
    } catch (error) {
        console.error('Get follow status error:', error);
        res.status(500).json({ error: 'Error al obtener estado' });
    }
});

// Toggle follow for a vendor
router.post('/vendor/:vendorId/toggle', authMiddleware, async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const followerId = req.user.id;

        // Check if vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        // Can't follow yourself
        if (vendor.userId === followerId) {
            return res.status(400).json({ error: 'No podés seguirte a vos mismo' });
        }

        // Check current follow state
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_vendorId: { followerId, vendorId }
            }
        });

        if (existing) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existing.id }
            });

            // Decrement follower count
            await prisma.vendor.update({
                where: { id: vendorId },
                data: { followerCount: { decrement: 1 } }
            });

            const updatedVendor = await prisma.vendor.findUnique({
                where: { id: vendorId },
                select: { followerCount: true }
            });

            res.json({
                message: 'Dejaste de seguir',
                isFollowing: false,
                followerCount: updatedVendor.followerCount
            });
        } else {
            // Follow
            await prisma.follow.create({
                data: { followerId, vendorId }
            });

            // Increment follower count
            await prisma.vendor.update({
                where: { id: vendorId },
                data: { followerCount: { increment: 1 } }
            });

            const updatedVendor = await prisma.vendor.findUnique({
                where: { id: vendorId },
                select: { followerCount: true }
            });

            res.json({
                message: 'Ahora seguís a este vendedor',
                isFollowing: true,
                followerCount: updatedVendor.followerCount
            });
        }
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({ error: 'Error al cambiar seguimiento' });
    }
});

// Get vendors the user follows
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const follows = await prisma.follow.findMany({
            where: { followerId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const vendorIds = follows.map(f => f.vendorId);

        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: {
                id: true,
                businessName: true,
                category: true,
                city: true,
                verified: true,
                avgRating: true,
                followerCount: true
            }
        });

        res.json({
            vendors,
            count: vendors.length
        });
    } catch (error) {
        console.error('Get my follows error:', error);
        res.status(500).json({ error: 'Error al obtener seguidos' });
    }
});

module.exports = router;
