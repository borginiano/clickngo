const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                subscription: true,
                createdAt: true
            }
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { vendor: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { password: _, ...userWithoutPassword } = req.user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, phone, avatar },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                subscription: true,
                vendor: true
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// Google OAuth login/register
router.post('/google', async (req, res) => {
    try {
        const { credential, name, email, picture } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email de Google requerido' });
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            include: { vendor: true }
        });

        if (!user) {
            // Create new user from Google data
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    password: '', // No password for Google users
                    avatar: picture
                },
                include: { vendor: true }
            });
        } else if (picture && !user.avatar) {
            // Update avatar if user doesn't have one
            user = await prisma.user.update({
                where: { id: user.id },
                data: { avatar: picture },
                include: { vendor: true }
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Error con autenticación de Google' });
    }
});

module.exports = router;

