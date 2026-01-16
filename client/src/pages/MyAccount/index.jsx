import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiUser, FiMail, FiPhone, FiFileText, FiBriefcase, FiShoppingBag,
    FiGrid, FiExternalLink, FiSave, FiPackage, FiStar, FiDollarSign,
    FiShare2, FiEdit, FiX, FiPlus, FiEye, FiTrendingUp, FiCamera, FiUpload
} from 'react-icons/fi';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI, vendorAPI, productAPI } from '../../api';
import { VENDOR_CATEGORIES } from '../../data/categories';
import { getProvincesByCountry, getCitiesByProvince } from '../../data/locations';
import toast from 'react-hot-toast';
import styles from './MyAccount.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function MyAccount() {
    const { user, vendor, updateUser, isVendor } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Profile form
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        avatar: ''
    });

    // Avatar upload
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [webcamStream, setWebcamStream] = useState(null);

    // Vendor dashboard data
    const [vendorLoading, setVendorLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);

    // Edit vendor modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (isVendor && vendor) {
            loadVendorDashboard();
        } else {
            setVendorLoading(false);
        }
    }, [isVendor, vendor]);

    const loadVendorDashboard = async () => {
        try {
            const response = await productAPI.getMine();
            const productsData = Array.isArray(response.data) ? response.data :
                Array.isArray(response.data?.products) ? response.data.products : [];
            setProducts(productsData);

            const totalProducts = productsData.length;
            const activeProducts = productsData.filter(p => p.active).length;
            const totalValue = productsData.reduce((sum, p) => sum + (p.price || 0), 0);
            const publishedToFB = productsData.filter(p => p.publishedToFB).length;

            setStats({
                totalProducts,
                activeProducts,
                totalValue,
                publishedToFB,
                avgRating: vendor?.avgRating || 0,
                totalReviews: vendor?.totalReviews || 0
            });
        } catch (error) {
            console.error('Error loading vendor dashboard:', error);
            setStats({
                totalProducts: 0, activeProducts: 0, totalValue: 0,
                publishedToFB: 0, avgRating: 0, totalReviews: 0
            });
        } finally {
            setVendorLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authAPI.updateProfile(formData);
            updateUser(data);
            toast.success('Perfil actualizado');
        } catch (error) {
            toast.error('Error al actualizar perfil');
        }
        setLoading(false);
    };

    // Avatar upload from file
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten imágenes');
            return;
        }

        setAvatarUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await response.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, avatar: data.url }));
                toast.success('Imagen subida');
            } else {
                toast.error(data.error || 'Error al subir imagen');
            }
        } catch (error) {
            toast.error('Error al subir imagen');
        }
        setAvatarUploading(false);
    };

    // Start webcam
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            setWebcamStream(stream);
            setShowWebcam(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            toast.error('No se pudo acceder a la cámara');
        }
    };

    // Stop webcam
    const stopWebcam = () => {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            setWebcamStream(null);
        }
        setShowWebcam(false);
    };

    // Capture photo from webcam
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            setAvatarUploading(true);
            stopWebcam();

            try {
                const formDataUpload = new FormData();
                formDataUpload.append('image', blob, 'webcam-photo.jpg');

                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/upload/image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataUpload
                });

                const data = await response.json();
                if (data.url) {
                    setFormData(prev => ({ ...prev, avatar: data.url }));
                    toast.success('Foto capturada y subida');
                } else {
                    toast.error(data.error || 'Error al subir foto');
                }
            } catch (error) {
                toast.error('Error al subir foto');
            }
            setAvatarUploading(false);
        }, 'image/jpeg', 0.85);
    };

    const openEditModal = () => {
        const cityParts = vendor?.city?.split(', ') || [];
        const cityName = cityParts[0] || '';
        const provinceName = cityParts[1] || '';

        setEditData({
            businessName: vendor?.businessName || '',
            description: vendor?.description || '',
            category: vendor?.category || '',
            facebookPage: vendor?.facebookPage || '',
            locationType: vendor?.locationType || 'CITY',
            country: 'AR',
            province: provinceName,
            city: cityName,
            address: vendor?.address || ''
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name === 'country') {
            setEditData({ ...editData, country: value, province: '', city: '' });
        } else if (name === 'province') {
            setEditData({ ...editData, province: value, city: '' });
        } else {
            setEditData({ ...editData, [name]: value });
        }
    };

    const handleSaveVendorProfile = async (e) => {
        e.preventDefault();
        if (!editData.businessName || !editData.category) {
            toast.error('Nombre y categoría son requeridos');
            return;
        }

        setSaving(true);
        try {
            const cityString = editData.locationType === 'CITY' && editData.province
                ? `${editData.city}, ${editData.province}`
                : editData.city;

            await vendorAPI.updateMe({
                ...editData,
                city: cityString
            });

            toast.success('Perfil de vendedor actualizado');
            setShowEditModal(false);
            window.location.reload();
        } catch (error) {
            toast.error('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    const availableProvinces = getProvincesByCountry(editData.country);
    const availableCities = getCitiesByProvince(editData.province);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    <FiUser /> Mi Cuenta
                </h1>

                {/* ===== VENDOR DASHBOARD SECTION ===== */}
                {isVendor && vendor && (
                    <>
                        {/* Vendor Header */}
                        <section className={`${styles.section} ${styles.vendorHeader}`}>
                            <div className={styles.vendorInfo}>
                                <h2>🏪 {vendor.businessName}</h2>
                                <span className={styles.vendorCategory}>{vendor.category}</span>
                            </div>
                            <div className={styles.vendorActions}>
                                <button onClick={openEditModal} className={styles.editVendorBtn}>
                                    <FiEdit /> Editar Negocio
                                </button>
                                <Link to={`/vendor/${vendor.id}`} className={styles.viewProfileBtn}>
                                    <FiEye /> Ver Perfil Público
                                </Link>
                            </div>
                        </section>

                        {/* Stats Grid */}
                        {!vendorLoading && stats && (
                            <section className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(0, 217, 255, 0.15)' }}>
                                        <FiPackage style={{ color: '#00D9FF' }} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalProducts}</span>
                                        <span className={styles.statLabel}>Productos</span>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                        <FiDollarSign style={{ color: '#10B981' }} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{formatCurrency(stats.totalValue)}</span>
                                        <span className={styles.statLabel}>Valor Total</span>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                                        <FiStar style={{ color: '#FBBF24' }} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>
                                            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
                                        </span>
                                        <span className={styles.statLabel}>{stats.totalReviews} reseñas</span>
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                                        <FiShare2 style={{ color: '#8B5CF6' }} />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.publishedToFB}</span>
                                        <span className={styles.statLabel}>Publicados</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Vendor Quick Actions */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🛒 Mi Negocio</h2>
                            <div className={styles.quickLinks}>
                                <Link to="/my-products" className={styles.linkCard}>
                                    <FiShoppingBag className={styles.linkIcon} />
                                    <div className={styles.linkInfo}>
                                        <h3>Mis Productos</h3>
                                        <p>Administra tu catálogo</p>
                                    </div>
                                    <FiExternalLink />
                                </Link>
                                <Link to="/my-coupons" className={styles.linkCard}>
                                    <FiTrendingUp className={styles.linkIcon} />
                                    <div className={styles.linkInfo}>
                                        <h3>Mis Cupones</h3>
                                        <p>Promociones activas</p>
                                    </div>
                                    <FiExternalLink />
                                </Link>
                                <Link to="/vendor-stats" className={styles.linkCard}>
                                    <FiGrid className={styles.linkIcon} style={{ color: '#00d9ff' }} />
                                    <div className={styles.linkInfo}>
                                        <h3>📊 Mis Estadísticas</h3>
                                        <p>Métricas de tu negocio</p>
                                    </div>
                                    <FiExternalLink />
                                </Link>
                                <a
                                    href="https://chat.whatsapp.com/GpRPJaPAsKX5qvLL78Mw7m"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.linkCard} ${styles.whatsappLink}`}
                                >
                                    <FaWhatsapp className={styles.linkIcon} style={{ color: '#25D366' }} />
                                    <div className={styles.linkInfo}>
                                        <h3>Grupo WhatsApp</h3>
                                        <p>Comunidad de vendedores</p>
                                    </div>
                                    <FiExternalLink />
                                </a>
                                <a
                                    href="https://www.facebook.com/61584957903862"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.linkCard} ${styles.facebookLink}`}
                                >
                                    <FaFacebook className={styles.linkIcon} style={{ color: '#1877F2' }} />
                                    <div className={styles.linkInfo}>
                                        <h3>Página Facebook</h3>
                                        <p>ClickNGo oficial</p>
                                    </div>
                                    <FiExternalLink />
                                </a>
                            </div>
                        </section>

                        {/* Recent Products */}
                        {!vendorLoading && products.length > 0 && (
                            <section className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>📦 Productos Recientes</h2>
                                    <Link to="/my-products" className={styles.viewAll}>Ver todos →</Link>
                                </div>
                                <div className={styles.productsList}>
                                    {products.slice(0, 4).map((product) => (
                                        <div key={product.id} className={styles.productRow}>
                                            <div className={styles.productImage}>
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} />
                                                ) : (
                                                    <FiPackage />
                                                )}
                                            </div>
                                            <div className={styles.productInfo}>
                                                <span className={styles.productName}>{product.name}</span>
                                                <span className={styles.productCategory}>{product.category}</span>
                                            </div>
                                            <div className={styles.productPrice}>
                                                {formatCurrency(product.price)}
                                            </div>
                                            <div className={styles.productStatus}>
                                                {product.active ? (
                                                    <span className={styles.statusActive}>Activo</span>
                                                ) : (
                                                    <span className={styles.statusInactive}>Inactivo</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* ===== PROFILE SECTION (FOR ALL USERS) ===== */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>👤 Información Personal</h2>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarContainer}>
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt={formData.name} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {formData.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {avatarUploading && (
                                    <div className={styles.avatarLoading}>
                                        <span>Subiendo...</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.avatarActions}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={styles.avatarBtn}
                                    disabled={avatarUploading}
                                >
                                    <FiUpload /> Subir Imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={startWebcam}
                                    className={styles.avatarBtn}
                                    disabled={avatarUploading}
                                >
                                    <FiCamera /> Tomar Foto
                                </button>
                            </div>
                        </div>

                        {/* Webcam Modal */}
                        {showWebcam && (
                            <div className={styles.webcamModal}>
                                <div className={styles.webcamContent}>
                                    <h3><FiCamera /> Tomar Foto</h3>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className={styles.webcamVideo}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    <div className={styles.webcamActions}>
                                        <button onClick={stopWebcam} className={styles.btnSecondary}>
                                            <FiX /> Cancelar
                                        </button>
                                        <button onClick={capturePhoto} className={styles.btnPrimary}>
                                            <FiCamera /> Capturar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label><FiUser /> Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label><FiMail /> Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className={styles.disabled}
                            />
                            <small>El email no se puede cambiar</small>
                        </div>

                        <div className={styles.inputGroup}>
                            <label><FiPhone /> Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Ej: 1155667788"
                            />
                        </div>

                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            <FiSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </section>

                {/* ===== GENERAL QUICK LINKS (FOR ALL USERS) ===== */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>📋 Accesos Rápidos</h2>

                    <div className={styles.quickLinks}>
                        <Link to="/my-resume" className={styles.linkCard}>
                            <FiFileText className={styles.linkIcon} />
                            <div className={styles.linkInfo}>
                                <h3>Mi CV / Currículum</h3>
                                <p>Crea y edita tu currículum profesional</p>
                            </div>
                            <FiExternalLink />
                        </Link>

                        <Link to="/my-classifieds" className={styles.linkCard}>
                            <FiBriefcase className={styles.linkIcon} />
                            <div className={styles.linkInfo}>
                                <h3>Mis Clasificados</h3>
                                <p>Ofertas y búsquedas de trabajo</p>
                            </div>
                            <FiExternalLink />
                        </Link>

                        {!isVendor && (
                            <Link to="/become-vendor" className={styles.linkCard + ' ' + styles.vendorCta}>
                                <FiShoppingBag className={styles.linkIcon} />
                                <div className={styles.linkInfo}>
                                    <h3>¡Convertite en Vendedor!</h3>
                                    <p>Empezá a vender tus productos</p>
                                </div>
                                <FiExternalLink />
                            </Link>
                        )}

                    </div>
                </section>

                {/* ===== ACCOUNT INFO (FOR ALL USERS) ===== */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ℹ️ Información de Cuenta</h2>
                    <div className={styles.accountInfo}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Rol:</span>
                            <span className={styles.infoBadge}>{user.role}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Suscripción:</span>
                            <span className={user.subscription === 'PREMIUM' ? styles.premium : styles.free}>
                                {user.subscription}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Miembro desde:</span>
                            <span>{new Date(user.createdAt).toLocaleDateString('es-AR')}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ===== EDIT VENDOR MODAL ===== */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Perfil de Vendedor</h2>
                            <button onClick={() => setShowEditModal(false)} className={styles.closeBtn}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveVendorProfile}>
                            <div className={styles.formGroup}>
                                <label>Nombre del negocio *</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={editData.businessName}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Link Página de Facebook (Opcional)</label>
                                <input
                                    type="url"
                                    name="facebookPage"
                                    value={editData.facebookPage}
                                    onChange={handleEditChange}
                                    placeholder="https://facebook.com/mi-negocio"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Categoría *</label>
                                <select name="category" value={editData.category} onChange={handleEditChange} required>
                                    <option value="">Seleccionar</option>
                                    {VENDOR_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Descripción</label>
                                <textarea
                                    name="description"
                                    value={editData.description}
                                    onChange={handleEditChange}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Provincia</label>
                                <select name="province" value={editData.province} onChange={handleEditChange}>
                                    <option value="">Seleccionar</option>
                                    {availableProvinces.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {editData.province && (
                                <div className={styles.formGroup}>
                                    <label>Ciudad</label>
                                    <select name="city" value={editData.city} onChange={handleEditChange}>
                                        <option value="">Seleccionar</option>
                                        {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={saving}>
                                    <FiSave /> {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyAccount;
