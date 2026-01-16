require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const fairRoutes = require('./routes/fairs');
const uploadRoutes = require('./routes/upload');
const publishRoutes = require('./routes/publish');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const notificationRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');
const classifiedRoutes = require('./routes/classifieds');
const resumeRoutes = require('./routes/resume');
const adminRoutes = require('./routes/admin');
const favoriteRoutes = require('./routes/favorites');
const followRoutes = require('./routes/follows');
const pushRoutes = require('./routes/push');
const statsRoutes = require('./routes/stats');
const ogRoutes = require('./routes/og');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS with multiple origins for web and Capacitor
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://localhost',              // Capacitor Android/iOS
    'http://localhost',               // Capacitor dev
    'capacitor://localhost',          // Capacitor native
    'ionic://localhost',              // Ionic native
    'https://clickngo.bdsmbefree.com' // Production
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Allow all for now to debug
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ClickNGo API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/fairs', fairRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/classifieds', classifiedRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/stats', statsRoutes);

// Open Graph meta tags for social sharing (used by nginx for crawlers)
app.use('/og', ogRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start server only if not running in a serverless environment (Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 ClickNGo API running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
