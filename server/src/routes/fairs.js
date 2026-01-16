const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, isAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// =====================================================
// FAIR ENDPOINTS
// =====================================================

// Get all fairs (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { lat, lng, radius = 10, upcoming, all } = req.query;

        let where = {};

        // Only active fairs for public (unless admin requests all)
        if (all !== 'true') {
            where.active = true;
        }

        // Only upcoming fairs
        if (upcoming === 'true') {
            where.endDate = { gte: new Date() };
        }

        const fairs = await prisma.fair.findMany({
            where,
            include: {
                stands: {
                    select: {
                        id: true,
                        standNumber: true,
                        status: true,
                        vendorId: true
                    }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        // Add stand count info
        const fairsWithCounts = fairs.map(fair => ({
            ...fair,
            standsTotal: fair.stands.length,
            standsOccupied: fair.stands.filter(s => s.status === 'OCCUPIED').length
        }));

        // If location provided, filter by distance
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const radiusKm = parseFloat(radius);

            const filteredFairs = fairsWithCounts.filter(fair => {
                const distance = getDistance(userLat, userLng, fair.latitude, fair.longitude);
                return distance <= radiusKm;
            });

            return res.json(filteredFairs);
        }

        res.json(fairsWithCounts);
    } catch (error) {
        console.error('Get fairs error:', error);
        res.status(500).json({ error: 'Error al obtener ferias' });
    }
});

// Get single fair with stands and vendor info
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const fair = await prisma.fair.findUnique({
            where: { id: req.params.id },
            include: {
                stands: {
                    orderBy: { standNumber: 'asc' }
                }
            }
        });

        if (!fair) {
            return res.status(404).json({ error: 'Feria no encontrada' });
        }

        // Get vendor info for occupied stands
        const vendorIds = fair.stands
            .filter(s => s.vendorId)
            .map(s => s.vendorId);

        const vendors = vendorIds.length > 0 ? await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            include: {
                user: { select: { name: true, avatar: true } }
            }
        }) : [];

        // Map vendor info to stands
        const standsWithVendors = fair.stands.map(stand => ({
            ...stand,
            vendor: stand.vendorId
                ? vendors.find(v => v.id === stand.vendorId) || null
                : null
        }));

        res.json({
            ...fair,
            stands: standsWithVendors
        });
    } catch (error) {
        console.error('Get fair error:', error);
        res.status(500).json({ error: 'Error al obtener feria' });
    }
});

// Create fair (admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
    try {
        const {
            name, description, address, country, province, city, latitude, longitude, mapsUrl,
            startDate, endDate, openDays, openTime, closeTime, recurring, image, gallery,
            capacity, contactPhone, contactEmail, featured
        } = req.body;

        if (!name || !address || !startDate || !endDate) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const fair = await prisma.fair.create({
            data: {
                name,
                description,
                address,
                country,
                province,
                city,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                mapsUrl,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                openDays: openDays || [],
                openTime,
                closeTime,
                recurring,
                image,
                gallery: gallery || [],
                capacity: capacity ? parseInt(capacity) : null,
                contactPhone,
                contactEmail,
                featured: featured || false,
                createdBy: req.user.id
            }
        });

        res.status(201).json(fair);
    } catch (error) {
        console.error('Create fair error:', error);
        res.status(500).json({ error: 'Error al crear feria' });
    }
});

// Update fair
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const {
            name, description, address, country, province, city, latitude, longitude, mapsUrl,
            startDate, endDate, openDays, openTime, closeTime, recurring, image, gallery,
            capacity, contactPhone, contactEmail, featured, active
        } = req.body;

        const fair = await prisma.fair.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                address,
                country,
                province,
                city,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                mapsUrl,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                openDays,
                openTime,
                closeTime,
                recurring,
                image,
                gallery,
                capacity: capacity !== undefined ? parseInt(capacity) : undefined,
                contactPhone,
                contactEmail,
                featured,
                active
            }
        });

        res.json(fair);
    } catch (error) {
        console.error('Update fair error:', error);
        res.status(500).json({ error: 'Error al actualizar feria' });
    }
});

// Delete fair
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        await prisma.fair.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Feria eliminada' });
    } catch (error) {
        console.error('Delete fair error:', error);
        res.status(500).json({ error: 'Error al eliminar feria' });
    }
});

// =====================================================
// STAND ENDPOINTS
// =====================================================

// Get stands for a fair
router.get('/:id/stands', optionalAuth, async (req, res) => {
    try {
        const stands = await prisma.fairStand.findMany({
            where: { fairId: req.params.id },
            orderBy: { standNumber: 'asc' }
        });

        // Get vendor info
        const vendorIds = stands.filter(s => s.vendorId).map(s => s.vendorId);
        const vendors = vendorIds.length > 0 ? await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            include: {
                user: { select: { name: true, avatar: true } }
            }
        }) : [];

        const standsWithVendors = stands.map(stand => ({
            ...stand,
            vendor: stand.vendorId
                ? vendors.find(v => v.id === stand.vendorId) || null
                : null
        }));

        res.json(standsWithVendors);
    } catch (error) {
        console.error('Get stands error:', error);
        res.status(500).json({ error: 'Error al obtener stands' });
    }
});

// Create stand (admin only)
router.post('/:id/stands', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { standNumber, category, description, price, vendorId, status } = req.body;

        if (!standNumber) {
            return res.status(400).json({ error: 'Número de stand requerido' });
        }

        // Check if fair exists
        const fair = await prisma.fair.findUnique({
            where: { id: req.params.id }
        });

        if (!fair) {
            return res.status(404).json({ error: 'Feria no encontrada' });
        }

        // Check if stand number already exists in this fair
        const existing = await prisma.fairStand.findFirst({
            where: {
                fairId: req.params.id,
                standNumber
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Ya existe un stand con ese número' });
        }

        const stand = await prisma.fairStand.create({
            data: {
                fairId: req.params.id,
                standNumber,
                category,
                description,
                price: price ? parseFloat(price) : null,
                vendorId,
                status: vendorId ? 'OCCUPIED' : (status || 'AVAILABLE')
            }
        });

        res.status(201).json(stand);
    } catch (error) {
        console.error('Create stand error:', error);
        res.status(500).json({ error: 'Error al crear stand' });
    }
});

// Update stand
router.put('/:id/stands/:standId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { standNumber, category, description, price, status } = req.body;

        const stand = await prisma.fairStand.update({
            where: { id: req.params.standId },
            data: {
                standNumber,
                category,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                status
            }
        });

        res.json(stand);
    } catch (error) {
        console.error('Update stand error:', error);
        res.status(500).json({ error: 'Error al actualizar stand' });
    }
});

// Assign vendor to stand
router.put('/:id/stands/:standId/assign', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { vendorId } = req.body;

        // If vendorId provided, verify it exists
        if (vendorId) {
            const vendor = await prisma.vendor.findUnique({
                where: { id: vendorId }
            });
            if (!vendor) {
                return res.status(404).json({ error: 'Vendedor no encontrado' });
            }
        }

        const stand = await prisma.fairStand.update({
            where: { id: req.params.standId },
            data: {
                vendorId: vendorId || null,
                status: vendorId ? 'OCCUPIED' : 'AVAILABLE'
            }
        });

        res.json(stand);
    } catch (error) {
        console.error('Assign vendor error:', error);
        res.status(500).json({ error: 'Error al asignar vendedor' });
    }
});

// Delete stand
router.delete('/:id/stands/:standId', authMiddleware, isAdmin, async (req, res) => {
    try {
        await prisma.fairStand.delete({
            where: { id: req.params.standId }
        });

        res.json({ message: 'Stand eliminado' });
    } catch (error) {
        console.error('Delete stand error:', error);
        res.status(500).json({ error: 'Error al eliminar stand' });
    }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = router;
