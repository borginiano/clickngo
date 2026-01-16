import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiHeart, FiUsers, FiStar, FiTrendingUp, FiArrowLeft } from 'react-icons/fi';
import styles from './VendorStats.module.css';

function VendorStats() {
    const { isVendor } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const { data } = await statsAPI.getVendorStats();
            setStats(data);
        } catch (err) {
            console.error('Error loading stats:', err);
            setError('No se pudieron cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    if (!isVendor) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>
                    <p>Debes ser vendedor para ver estadísticas</p>
                    <Link to="/become-vendor" className={styles.ctaBtn}>
                        Convertirme en Vendedor
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Cargando estadísticas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link to="/my-products" className={styles.backLink}>
                    <FiArrowLeft /> Volver
                </Link>
                <h1>📊 Mis Estadísticas</h1>
                <p>Panel de métricas de {stats?.vendor?.businessName}</p>
            </header>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #00d9ff, #00ff88)' }}>
                        <FiPackage />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.stats?.totalProducts || 0}</span>
                        <span className={styles.statLabel}>Productos Totales</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #00ff88, #00d9ff)' }}>
                        <FiTrendingUp />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.stats?.activeProducts || 0}</span>
                        <span className={styles.statLabel}>Productos Activos</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)' }}>
                        <FiHeart />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.stats?.totalFavorites || 0}</span>
                        <span className={styles.statLabel}>Favoritos Recibidos</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <FiUsers />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.stats?.followers || 0}</span>
                        <span className={styles.statLabel}>Seguidores</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f6d365, #fda085)' }}>
                        <FiStar />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {stats?.stats?.avgRating?.toFixed(1) || '0.0'} ⭐
                        </span>
                        <span className={styles.statLabel}>{stats?.stats?.totalReviews || 0} Reseñas</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ffecd2, #fcb69f)' }}>
                        <span style={{ fontSize: '1.2rem' }}>⭐</span>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.stats?.featuredProducts || 0}</span>
                        <span className={styles.statLabel}>Productos Destacados</span>
                    </div>
                </div>
            </section>

            {stats?.topProducts?.length > 0 && (
                <section className={styles.topSection}>
                    <h2>🏆 Productos Más Populares</h2>
                    <div className={styles.topList}>
                        {stats.topProducts.map((product, index) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className={styles.topItem}
                            >
                                <span className={styles.topRank}>#{index + 1}</span>
                                <div className={styles.topImage}>
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} />
                                    ) : (
                                        <FiPackage />
                                    )}
                                </div>
                                <div className={styles.topInfo}>
                                    <span className={styles.topName}>{product.name}</span>
                                    <span className={styles.topMeta}>
                                        ❤️ {product.favoriteCount} favoritos
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default VendorStats;
