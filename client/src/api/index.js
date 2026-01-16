import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Vendors
export const vendorAPI = {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    become: (data) => api.post('/vendors/become', data),
    updateMe: (data) => api.put('/vendors/me', data),
};

// Products
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getMine: () => api.get('/products/my/list'),
    getFeatured: () => api.get('/products/featured/list'),
    toggleFeatured: (id) => api.post(`/products/${id}/feature`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Fairs
export const fairAPI = {
    getAll: (params) => api.get('/fairs', { params }),
    getById: (id) => api.get(`/fairs/${id}`),
    create: (data) => api.post('/fairs', data),
    update: (id, data) => api.put(`/fairs/${id}`, data),
    delete: (id) => api.delete(`/fairs/${id}`),
    // Stands
    getStands: (fairId) => api.get(`/fairs/${fairId}/stands`),
    createStand: (fairId, data) => api.post(`/fairs/${fairId}/stands`, data),
    updateStand: (fairId, standId, data) => api.put(`/fairs/${fairId}/stands/${standId}`, data),
    deleteStand: (fairId, standId) => api.delete(`/fairs/${fairId}/stands/${standId}`),
    assignVendor: (fairId, standId, vendorId) => api.put(`/fairs/${fairId}/stands/${standId}/assign`, { vendorId })
};

// Upload
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadImages: (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

// Publish API
export const publishAPI = {
    generateText: (productData) => api.post('/publish/generate-text', productData),
    postToFacebook: (data) => api.post('/publish/facebook', data),
    updateDelivery: (productId, data) => api.put(`/publish/product/${productId}/delivery`, data)
};

// Reviews API
export const reviewAPI = {
    // Vendor reviews
    getVendorReviews: (vendorId) => api.get(`/reviews/vendor/${vendorId}`),
    createReview: (vendorId, data) => api.post(`/reviews/vendor/${vendorId}`, data),
    deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
    // Product reviews
    getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
    createProductReview: (productId, data) => api.post(`/reviews/product/${productId}`, data),
    deleteProductReview: (reviewId) => api.delete(`/reviews/product/${reviewId}`)
};

// Favorites API
export const favoriteAPI = {
    getAll: () => api.get('/favorites'),
    check: (productId) => api.get(`/favorites/check/${productId}`),
    add: (productId) => api.post(`/favorites/${productId}`),
    remove: (productId) => api.delete(`/favorites/${productId}`),
    toggle: (productId) => api.post(`/favorites/${productId}/toggle`)
};

// Follow API
export const followAPI = {
    getStatus: (vendorId) => api.get(`/follows/vendor/${vendorId}`),
    toggle: (vendorId) => api.post(`/follows/vendor/${vendorId}/toggle`),
    getMyFollows: () => api.get('/follows/my')
};

// Stats API
export const statsAPI = {
    getVendorStats: () => api.get('/stats/vendor')
};

// Coupons API
export const couponAPI = {
    getVendorCoupons: (vendorId) => api.get(`/coupons/vendor/${vendorId}`),
    getMyCoupons: () => api.get('/coupons/my'),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
    validate: (vendorId, code) => api.post('/coupons/validate', { vendorId, code })
};

// Notifications API
export const notificationAPI = {
    getMy: () => api.get('/notifications/my'),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications/clear-all')
};

// Chat API
export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    startConversation: (userId) => api.post(`/chat/start/${userId}`),
    getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
    sendMessage: (conversationId, content) => api.post(`/chat/${conversationId}/send`, { content }),
    getUnreadCount: () => api.get('/chat/unread-count')
};

// Classifieds API
export const classifiedAPI = {
    getAll: (params) => api.get('/classifieds', { params }),
    getCategories: () => api.get('/classifieds/categories'),
    getMy: () => api.get('/classifieds/my'),
    getById: (id) => api.get(`/classifieds/${id}`),
    create: (data) => api.post('/classifieds', data),
    update: (id, data) => api.put(`/classifieds/${id}`, data),
    delete: (id) => api.delete(`/classifieds/${id}`)
};

// Resume API
export const resumeAPI = {
    getMy: () => api.get('/resume/my'),
    getByUserId: (userId) => api.get(`/resume/${userId}`),
    save: (data) => api.post('/resume', data),
    toggleVisibility: (isPublic) => api.patch('/resume/visibility', { isPublic }),
    delete: () => api.delete('/resume')
};

// Admin API
export const adminAPI = {
    // Stats
    getStats: () => api.get('/admin/stats'),

    // Users
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),

    // Vendors
    getVendors: (params) => api.get('/admin/vendors', { params }),
    toggleVerify: (id) => api.patch(`/admin/vendors/${id}/verify`),

    // Products
    getProducts: (params) => api.get('/admin/products', { params }),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

    // Classifieds
    getClassifieds: (params) => api.get('/admin/classifieds', { params }),
    deleteClassified: (id) => api.delete(`/admin/classifieds/${id}`)
};

// Base URL for images
export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default api;
