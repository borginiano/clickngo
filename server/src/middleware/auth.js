const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { vendor: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { vendor: true }
            });

            req.user = user;
        }
        next();
    } catch (error) {
        next();
    }
};

// Check if user is vendor
const isVendor = (req, res, next) => {
    if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso denegado. Solo vendedores.' });
    }
    // Safety check: ensure vendor profile exists (except for admins)
    if (req.user.role === 'VENDOR' && !req.user.vendor) {
        return res.status(400).json({ error: 'Perfil de vendedor no encontrado. Por favor, completa tu registro como vendedor.' });
    }
    next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    next();
};

module.exports = { authMiddleware, optionalAuth, isVendor, isAdmin, adminMiddleware: isAdmin };
