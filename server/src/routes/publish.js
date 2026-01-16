const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Facebook Page config
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// Groq config (free tier: 30 RPM, very fast)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Generate promo text with Groq AI (multiple styles)
router.post('/generate-text', authMiddleware, async (req, res) => {
    try {
        const { productName, productDescription, productPrice, productCategory, style } = req.body;

        if (!productName) {
            return res.status(400).json({ error: 'Nombre del producto es requerido' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'API de Groq no configurada' });
        }

        // Different styles for promotional text
        const styles = {
            casual: 'Usa un tono amigable e informal, como si hablaras con un amigo. Usa emojis divertidos.',
            urgent: 'Crea urgencia! Usa palabras como "¡Últimas unidades!", "¡Solo hoy!", "¡No te lo pierdas!". Emojis de alerta.',
            professional: 'Usa un tono profesional y elegante. Destaca la calidad y beneficios del producto.',
            funny: 'Sé gracioso y creativo. Usa humor y emojis divertidos para llamar la atención.',
            emotional: 'Conecta emocionalmente. Habla de cómo el producto mejorará la vida del comprador.'
        };

        const selectedStyle = styles[style] || styles.casual;

        // Build prompt for Groq
        const prompt = `Eres un experto en marketing digital. Genera un texto publicitario para redes sociales.

Producto: ${productName}
Categoría: ${productCategory || 'General'}
Precio: $${productPrice}
Descripción: ${productDescription || 'Producto de calidad'}

ESTILO: ${selectedStyle}

Requisitos:
- Máximo 200 caracteres
- Incluir emojis relevantes
- Mencionar el precio
- Incluir llamado a la acción (CTA)
- En español argentino
- Listo para copiar y pegar

Solo devuelve el texto publicitario, nada más.`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: GROQ_MODEL,
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        let generatedText = '';

        if (response.data?.choices?.[0]?.message?.content) {
            generatedText = response.data.choices[0].message.content.trim();
        }

        if (!generatedText) {
            return res.status(500).json({ error: 'No se pudo generar el texto' });
        }

        res.json({
            success: true,
            text: generatedText,
            style: style || 'casual'
        });

    } catch (error) {
        console.error('Generate text error:', error.response?.data || error.message);

        // Handle rate limit
        if (error.response?.status === 429) {
            return res.status(429).json({ error: 'Límite de requests alcanzado, espera un momento' });
        }

        res.status(500).json({ error: 'Error al generar texto con AI' });
    }
});

// Publish to Facebook Page
router.post('/facebook', authMiddleware, async (req, res) => {
    try {
        const { productId, message, imageUrl } = req.body;

        if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
            return res.status(500).json({ error: 'Facebook no configurado' });
        }

        // Verify product belongs to user
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                vendor: { userId: req.user.id }
            },
            include: { vendor: true }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Post to Facebook Page
        let fbResponse;

        if (imageUrl) {
            fbResponse = await axios.post(
                `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/photos`,
                {
                    url: imageUrl,
                    caption: message,
                    access_token: FB_PAGE_TOKEN
                }
            );
        } else {
            fbResponse = await axios.post(
                `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/feed`,
                {
                    message: message,
                    access_token: FB_PAGE_TOKEN
                }
            );
        }

        const fbPostId = fbResponse.data.id || fbResponse.data.post_id;

        // Update product with FB post info
        await prisma.product.update({
            where: { id: productId },
            data: {
                promoText: message,
                publishedToFB: true,
                fbPostId: fbPostId
            }
        });

        res.json({
            success: true,
            fbPostId,
            message: 'Publicado en Facebook exitosamente'
        });

    } catch (error) {
        console.error('Facebook publish error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message || 'Error al publicar en Facebook'
        });
    }
});

// Update product delivery options
router.put('/product/:id/delivery', authMiddleware, async (req, res) => {
    try {
        const { deliveryType, deliveryNote } = req.body;

        const product = await prisma.product.findFirst({
            where: {
                id: req.params.id,
                vendor: { userId: req.user.id }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const updated = await prisma.product.update({
            where: { id: req.params.id },
            data: { deliveryType, deliveryNote }
        });

        res.json(updated);

    } catch (error) {
        console.error('Update delivery error:', error);
        res.status(500).json({ error: 'Error al actualizar opciones de entrega' });
    }
});

module.exports = router;
