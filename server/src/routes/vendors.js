const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all vendors (with optional location filter)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { lat, lng, radius = 5, category, search } = req.query;

        let where = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const vendors = await prisma.vendor.findMany({
            where,
            include: {
                user: {
                    select: { name: true, avatar: true, subscription: true }
                },
                products: {
                    where: { active: true },
                    take: 4 // Solo mostrar 4 productos en preview
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // If location provided, filter by distance
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const radiusKm = parseFloat(radius);

            const filteredVendors = vendors.filter(vendor => {
                if (!vendor.latitude || !vendor.longitude) return false;

                const distance = getDistance(
                    userLat, userLng,
                    vendor.latitude, vendor.longitude
                );

                return distance <= radiusKm;
            });

            return res.json(filteredVendors);
        }

        res.json(vendors);
    } catch (error) {
        console.error('Get vendors error:', error);
        res.status(500).json({ error: 'Error al obtener vendedores' });
    }
});

// Get single vendor
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: { name: true, avatar: true, phone: true, subscription: true }
                },
                products: {
                    where: { active: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        res.json(vendor);
    } catch (error) {
        console.error('Get vendor error:', error);
        res.status(500).json({ error: 'Error al obtener vendedor' });
    }
});

// Become a vendor (create vendor profile)
router.post('/become', authMiddleware, async (req, res) => {
    try {
        const { businessName, description, category, locationType, city, latitude, longitude, address } = req.body;

        if (!businessName) {
            return res.status(400).json({ error: 'Nombre del negocio es requerido' });
        }

        // Check if already a vendor
        const existingVendor = await prisma.vendor.findUnique({
            where: { userId: req.user.id }
        });

        if (existingVendor) {
            return res.status(400).json({ error: 'Ya tienes un perfil de vendedor' });
        }

        // Create vendor and update user role
        const [vendor] = await prisma.$transaction([
            prisma.vendor.create({
                data: {
                    userId: req.user.id,
                    businessName,
                    description,
                    category,
                    locationType: locationType || 'CITY',
                    city,
                    address: locationType === 'EXACT' ? address : null,
                    latitude: locationType === 'EXACT' ? latitude : null,
                    longitude: locationType === 'EXACT' ? longitude : null
                },
                include: {
                    user: {
                        select: { name: true, avatar: true, subscription: true }
                    }
                }
            }),
            prisma.user.update({
                where: { id: req.user.id },
                data: { role: 'VENDOR' }
            })
        ]);

        res.status(201).json(vendor);
    } catch (error) {
        console.error('Become vendor error:', error);
        res.status(500).json({ error: 'Error al crear perfil de vendedor' });
    }
});

// Update vendor profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        if (!req.user.vendor) {
            return res.status(404).json({ error: 'No tienes perfil de vendedor' });
        }

        const { businessName, description, category, locationType, city, latitude, longitude, address } = req.body;

        const vendor = await prisma.vendor.update({
            where: { userId: req.user.id },
            data: {
                businessName,
                description,
                category,
                locationType,
                city,
                address: locationType === 'EXACT' ? address : null,
                latitude: locationType === 'EXACT' ? latitude : null,
                longitude: locationType === 'EXACT' ? longitude : null
            },
            include: {
                user: {
                    select: { name: true, avatar: true, subscription: true }
                },
                products: { where: { active: true } }
            }
        });

        res.json(vendor);
    } catch (error) {
        console.error('Update vendor error:', error);
        res.status(500).json({ error: 'Error al actualizar vendedor' });
    }
});

// Helper: Calculate distance between two points (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
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
