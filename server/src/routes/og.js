const express = require('express');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Base URL for the site
const BASE_URL = 'https://clickngo.bdsmbefree.com';

/**
 * Generate HTML with Open Graph meta tags for social sharing
 * This endpoint is called by crawlers (Facebook, Twitter, etc.)
 */
router.get('/product/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                vendor: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        if (!product) {
            // Return basic HTML for not found
            return res.send(generateBasicHTML());
        }

        const title = `${product.name} - ClickNGo`;
        const description = product.description?.substring(0, 160) ||
            `${product.name} por $${product.price?.toLocaleString('es-AR')} en ClickNGo`;
        const image = product.images?.[0] || `${BASE_URL}/og-image.png`;
        const url = `${BASE_URL}/product/${product.id}`;
        const price = product.price?.toLocaleString('es-AR') || '0';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="ClickNGo">
    <meta property="product:price:amount" content="${product.price || 0}">
    <meta property="product:price:currency" content="ARS">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Regular meta -->
    <meta name="description" content="${escapeHtml(description)}">
    
    <!-- Redirect browsers to the actual SPA -->
    <script>
        // Redirect to the actual page if this is a browser (not a crawler)
        window.location.href = "${url}";
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0;url=${url}">
    </noscript>
</head>
<body>
    <h1>${escapeHtml(product.name)}</h1>
    <p>Precio: $${price}</p>
    <p>${escapeHtml(product.description || '')}</p>
    ${product.images?.[0] ? `<img src="${product.images[0]}" alt="${escapeHtml(product.name)}">` : ''}
    <p>Vendedor: ${escapeHtml(product.vendor?.businessName || 'ClickNGo')}</p>
    <a href="${url}">Ver producto en ClickNGo</a>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('OG Meta error:', error);
        res.send(generateBasicHTML());
    }
});

/**
 * Generate HTML with Open Graph meta tags for vendor profiles
 */
router.get('/vendor/:id', async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, avatar: true } }
            }
        });

        if (!vendor) {
            return res.send(generateBasicHTML());
        }

        const title = `${vendor.businessName} - ClickNGo`;
        const description = vendor.description?.substring(0, 160) ||
            `${vendor.businessName} - ${vendor.category} en ClickNGo`;
        const image = vendor.user?.avatar || `${BASE_URL}/og-image.png`;
        const url = `${BASE_URL}/vendor/${vendor.id}`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="profile">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${image}">
    <meta property="og:site_name" content="ClickNGo">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Redirect browsers to the actual SPA -->
    <script>
        window.location.href = "${url}";
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0;url=${url}">
    </noscript>
</head>
<body>
    <h1>${escapeHtml(vendor.businessName)}</h1>
    <p>${escapeHtml(vendor.category || '')}</p>
    <p>${escapeHtml(vendor.description || '')}</p>
    <a href="${url}">Ver tienda en ClickNGo</a>
</body>
</html>`;

        res.send(html);
    } catch (error) {
        console.error('OG Meta error:', error);
        res.send(generateBasicHTML());
    }
});

function generateBasicHTML() {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>ClickNGo - Marketplace de Vendedores Ambulantes</title>
    <meta property="og:title" content="ClickNGo - Marketplace de Vendedores Ambulantes">
    <meta property="og:description" content="Conecta con emprendedores locales y encuentra productos únicos">
    <meta property="og:image" content="${BASE_URL}/og-image.png">
    <script>window.location.href = "${BASE_URL}";</script>
</head>
<body></body>
</html>`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = router;
