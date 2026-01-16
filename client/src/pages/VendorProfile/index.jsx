import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorAPI, chatAPI, followAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiMapPin, FiPackage, FiStar, FiMessageSquare, FiMap, FiUserPlus, FiUserCheck, FiUsers } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ProductCard from '../../components/ProductCard';
import StarRating from '../../components/StarRating';
import ReviewSection from '../../components/ReviewSection';
import QRCodeButton from '../../components/QRCodeButton';
import styles from './VendorProfile.module.css';

function VendorProfile() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    // Follow state
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => { loadVendor(); }, [id]);

    useEffect(() => {
        if (vendor) {
            loadFollowStatus();
        }
    }, [vendor, isAuthenticated]);

    const loadVendor = async () => {
        try {
            const { data } = await vendorAPI.getById(id);
            setVendor(data);
            setFollowerCount(data.followerCount || 0);
        } catch (error) {
            toast.error('Error al cargar vendedor');
        } finally {
            setLoading(false);
        }
    };

    const loadFollowStatus = async () => {
        try {
            const response = await followAPI.getStatus(id);
            setIsFollowing(response.data.isFollowing);
            setFollowerCount(response.data.followerCount);
        } catch (error) {
            console.error('Error loading follow status:', error);
        }
    };

    const handleToggleFollow = async () => {
        if (!isAuthenticated) {
            toast.error('Iniciá sesión para seguir vendedores');
            navigate('/login');
            return;
        }

        setFollowLoading(true);
        try {
            const response = await followAPI.toggle(id);
            setIsFollowing(response.data.isFollowing);
            setFollowerCount(response.data.followerCount);
            toast.success(response.data.isFollowing ? '👤 ¡Ahora seguís a este vendedor!' : 'Dejaste de seguir');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al cambiar seguimiento');
        } finally {
            setFollowLoading(false);
        }
    };

    const shareWhatsApp = () => {
        const text = `Mira este vendedor: ${vendor.businessName} - ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    const startChat = async () => {
        if (!user) {
            toast.error('Inicia sesión para chatear');
            navigate('/login');
            return;
        }

        try {
            const { data } = await chatAPI.startConversation(vendor.userId);
            navigate(`/chat/${data.id}`);
        } catch (error) {
            toast.error('Error al iniciar chat');
        }
    };

    if (loading) return <div className="loading-page">Cargando...</div>;
    if (!vendor) return <div className="loading-page">Vendedor no encontrado</div>;

    const isPremium = vendor.user?.subscription === 'PREMIUM';
    const isOwnProfile = user?.id === vendor.userId;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerBg} />
                <div className={styles.headerContent}>
                    <div className={styles.avatar}>
                        {vendor.user?.avatar ? <img src={vendor.user.avatar} alt={vendor.businessName} /> : <span>{vendor.businessName.charAt(0)}</span>}
                    </div>
                    <div className={styles.info}>
                        <div className={styles.title}>
                            <h1>{vendor.businessName}</h1>
                            {isPremium && <span className={styles.premiumBadge}><FiStar /> Premium</span>}
                        </div>
                        {vendor.verified && <span className={styles.verifiedBadge}>✓ Verificado</span>}

                        {/* Follower Count */}
                        <div className={styles.followerCount}>
                            <FiUsers /> {followerCount} {followerCount === 1 ? 'seguidor' : 'seguidores'}
                        </div>

                        {/* Rating Display */}
                        {vendor.totalReviews > 0 && (
                            <div className={styles.ratingDisplay}>
                                <StarRating
                                    rating={vendor.avgRating || 0}
                                    showCount
                                    count={vendor.totalReviews}
                                />
                            </div>
                        )}

                        <span className={styles.category}>{vendor.category || 'General'}</span>
                        {vendor.description && <p className={styles.description}>{vendor.description}</p>}
                        <div className={styles.metaRow}>
                            {vendor.city && (
                                <span>
                                    <FiMap />
                                    {vendor.address ? `${vendor.address}, ${vendor.city}` : vendor.city}
                                </span>
                            )}
                            <span><FiPackage /> {vendor.products?.length || 0} productos</span>
                        </div>
                        <div className={styles.shareButtons}>
                            {/* Follow Button */}
                            {!isOwnProfile && (
                                <button
                                    onClick={handleToggleFollow}
                                    className={`${styles.shareBtn} ${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                                    disabled={followLoading}
                                >
                                    {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                                </button>
                            )}

                            {!isOwnProfile && (
                                <button onClick={startChat} className={`${styles.shareBtn} ${styles.chatBtn}`}>
                                    <FiMessageSquare /> Chatear
                                </button>
                            )}

                            {vendor.facebookPage && (
                                <a
                                    href={vendor.facebookPage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.shareBtn} ${styles.facebookPageBtn}`}
                                    style={{ backgroundColor: '#1877F2', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                                >
                                    <FaFacebook /> Ver Página
                                </a>
                            )}

                            <button onClick={shareWhatsApp} className={`${styles.shareBtn} ${styles.whatsapp}`}><FaWhatsapp /> Compartir</button>
                            <button onClick={shareFacebook} className={`${styles.shareBtn} ${styles.facebook}`}><FaFacebook /> Compartir</button>
                            <QRCodeButton
                                url={`/vendor/${id}`}
                                title={vendor.businessName}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.productsSection}>
                <h2>Productos</h2>
                {vendor.products?.length > 0 ? (
                    <div className={styles.productsGrid}>
                        {vendor.products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className={styles.noProducts}><p>Este vendedor aún no tiene productos publicados</p></div>
                )}
            </div>

            {/* Reviews Section */}
            <ReviewSection vendorId={vendor.id} vendorUserId={vendor.userId} />
        </div>
    );
}

export default VendorProfile;
