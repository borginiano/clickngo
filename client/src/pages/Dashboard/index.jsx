import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorAPI, productAPI } from '../../api';
import {
    FiPackage, FiEye, FiStar, FiTrendingUp, FiPlus,
    FiShare2, FiDollarSign, FiEdit, FiX, FiSave, FiFileText, FiBriefcase
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import { VENDOR_CATEGORIES } from '../../data/categories';
import { countries, getProvincesByCountry, getCitiesByProvince } from '../../data/locations';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

function Dashboard() {
    const { user, vendor, updateUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit profile modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Only load dashboard if user is a vendor
        if (vendor) {
            loadDashboard();
        } else {
            setLoading(false);
        }
    }, [vendor]);

    const loadDashboard = async () => {
        // Safety check - don't call API if not a vendor
        if (!vendor) {
            setLoading(false);
            return;
        }

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
            console.error('Error loading dashboard:', error);
            setStats({
                totalProducts: 0, activeProducts: 0, totalValue: 0,
                publishedToFB: 0, avgRating: 0, totalReviews: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        // Parse city to extract province if possible
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

    const handleSaveProfile = async (e) => {
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

            toast.success('Perfil actualizado');
            setShowEditModal(false);
            // Refresh auth context
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

    if (!vendor) {
        return (
            <div className={styles.page}>
                <div className={styles.noVendor}>
                    <h2>No eres vendedor aún</h2>
                    <p>Crea tu perfil de vendedor para acceder al dashboard</p>
                    <Link to="/become-vendor" className={styles.ctaBtn}>
                        Comenzar a Vender
                    </Link>
                </div>
            </div>
        );
    }

    if (loading || !stats) {
        return <div className={styles.loading}>Cargando dashboard...</div>;
    }

    const availableProvinces = getProvincesByCountry(editData.country);
    const availableCities = getCitiesByProvince(editData.province);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Hola, {vendor.businessName} 👋</p>
                </div>
                <Link to="/my-products" className={styles.addBtn}>
                    <FiPlus /> Nuevo Producto
                </Link>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
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
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <h2>Acciones Rápidas</h2>
                <div className={styles.quickActions}>
                    <Link to="/my-products" className={styles.actionCard}>
                        <FiPackage />
                        <span>Mis Productos</span>
                    </Link>
                    <Link to="/my-classifieds" className={`${styles.actionCard} ${styles.actionHighlight}`}>
                        <FiBriefcase />
                        <span>Mis Clasificados</span>
                    </Link>
                    <Link to="/my-resume" className={`${styles.actionCard} ${styles.actionHighlight2}`}>
                        <FiFileText />
                        <span>Mi CV</span>
                    </Link>
                    <Link to="/my-coupons" className={styles.actionCard}>
                        <FiTrendingUp />
                        <span>Mis Cupones</span>
                    </Link>
                    <button onClick={openEditModal} className={styles.actionCard}>
                        <FiEdit />
                        <span>Editar Perfil</span>
                    </button>
                    <Link to={`/vendor/${vendor.id}`} className={styles.actionCard}>
                        <FiEye />
                        <span>Ver Mi Perfil</span>
                    </Link>
                    <a
                        href="https://chat.whatsapp.com/GpRPJaPAsKX5qvLL78Mw7m"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionCard}
                        style={{ background: 'rgba(37, 211, 102, 0.1)' }}
                    >
                        <FaWhatsapp style={{ color: '#25D366' }} />
                        <span>Grupo WhatsApp</span>
                    </a>
                    <a
                        href="https://www.facebook.com/61584957903862"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionCard}
                        style={{ background: 'rgba(24, 119, 242, 0.1)' }}
                    >
                        <FaFacebook style={{ color: '#1877F2' }} />
                        <span>Página Facebook</span>
                    </a>
                </div>
            </div>

            {/* Recent Products */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Productos Recientes</h2>
                    <Link to="/my-products" className={styles.viewAll}>Ver todos →</Link>
                </div>
                {products.length > 0 ? (
                    <div className={styles.productsList}>
                        {products.slice(0, 5).map((product) => (
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
                ) : (
                    <div className={styles.emptyProducts}>
                        <p>No tienes productos aún</p>
                        <Link to="/my-products" className={styles.addProductBtn}>
                            <FiPlus /> Agregar Producto
                        </Link>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className={styles.tipsSection}>
                <h2>💡 Tips para Vender Más</h2>
                <div className={styles.tipsList}>
                    <div className={styles.tip}>
                        <strong>📸 Buenas fotos</strong>
                        <p>Los productos con fotos claras venden 3x más</p>
                    </div>
                    <div className={styles.tip}>
                        <strong>📱 Comparte seguido</strong>
                        <p>Publica en WhatsApp y Facebook regularmente</p>
                    </div>
                    <div className={styles.tip}>
                        <strong>⭐ Responde rápido</strong>
                        <p>Las respuestas rápidas mejoran tu reputación</p>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Perfil de Vendedor</h2>
                            <button onClick={() => setShowEditModal(false)} className={styles.closeBtn}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProfile}>
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

export default Dashboard;
