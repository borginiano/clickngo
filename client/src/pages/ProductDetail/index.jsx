import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, chatAPI, reviewAPI, favoriteAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
    FiArrowLeft, FiMapPin, FiUser, FiMessageCircle, FiShoppingBag,
    FiTag, FiPackage, FiStar, FiSend, FiHeart, FiShare2
} from 'react-icons/fi';
import { FaWhatsapp, FaStar, FaRegStar, FaHeart, FaRegHeart, FaFacebookF } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import QRCodeButton from '../../components/QRCodeButton';
import styles from './ProductDetail.module.css';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Favorite state
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            loadReviews();
            if (isAuthenticated) {
                loadFavoriteStatus();
            }
        }
    }, [product, isAuthenticated]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getById(id);
            setProduct(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Producto no encontrado');
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await reviewAPI.getProductReviews(id);
            setReviews(response.data.reviews || []);
            setUserReview(response.data.userReview);
            if (response.data.userReview) {
                setNewRating(response.data.userReview.rating);
                setNewComment(response.data.userReview.comment || '');
            }
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadFavoriteStatus = async () => {
        try {
            const response = await favoriteAPI.check(id);
            setIsFavorite(response.data.isFavorite);
        } catch (err) {
            console.error('Error checking favorite:', err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            toast.error('Iniciá sesión para guardar favoritos');
            navigate('/login');
            return;
        }

        setFavoriteLoading(true);
        try {
            const response = await favoriteAPI.toggle(id);
            setIsFavorite(response.data.isFavorite);
            toast.success(response.data.isFavorite ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos');
        } catch (error) {
            toast.error('Error al cambiar favorito');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Iniciá sesión para dejar una reseña');
            navigate('/login');
            return;
        }

        if (newRating === 0) {
            toast.error('Seleccioná una calificación');
            return;
        }

        setSubmitting(true);
        try {
            const response = await reviewAPI.createProductReview(id, {
                rating: newRating,
                comment: newComment.trim() || null
            });

            // Update product rating
            setProduct(prev => ({
                ...prev,
                avgRating: response.data.avgRating,
                totalReviews: response.data.totalReviews
            }));

            toast.success(userReview ? 'Reseña actualizada' : '¡Gracias por tu reseña!');
            loadReviews();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al guardar reseña');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartChat = async () => {
        if (!isAuthenticated) {
            toast.error('Iniciá sesión para enviar mensajes');
            navigate('/login');
            return;
        }

        if (product.vendor?.userId === user?.id) {
            toast.error('No podés chatear contigo mismo');
            return;
        }

        try {
            await chatAPI.startConversation(product.vendor.userId);
            navigate('/chat');
        } catch (error) {
            toast.error('Error al iniciar chat');
        }
    };

    const renderStars = (rating, interactive = false, size = 'normal') => {
        const stars = [];
        const displayRating = interactive ? (hoverRating || newRating) : rating;

        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= displayRating;
            stars.push(
                <span
                    key={i}
                    className={`${styles.star} ${size === 'small' ? styles.starSmall : ''} ${interactive ? styles.starInteractive : ''}`}
                    onClick={interactive ? () => setNewRating(i) : undefined}
                    onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                >
                    {isFilled ? <FaStar /> : <FaRegStar />}
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className={styles.loading}>Cargando producto...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>😕 {error}</h2>
                <Link to="/" className={styles.backBtn}>Volver al inicio</Link>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.error}>
                <h2>Producto no encontrado</h2>
                <Link to="/" className={styles.backBtn}>Volver al inicio</Link>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : ['/placeholder-product.png'];
    const whatsappUrl = product.vendor?.phone
        ? `https://wa.me/54${product.vendor.phone.replace(/\D/g, '')}?text=Hola! Me interesa "${product.name}" de ClickNGo`
        : null;
    const isOwnProduct = user?.id === product.vendor?.userId;

    // Share URLs
    const productUrl = `https://clickngo.bdsmbefree.com/product/${id}`;
    const shareText = `¡Mirá este producto en ClickNGo! 🛒\n\n${product.name}\n💰 $${product.price?.toLocaleString('es-AR')}\n\n${product.description?.substring(0, 100) || ''}...\n\n`;

    const shareWhatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + productUrl)}`;
    const shareFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/" className={styles.backLink}>
                    <FiArrowLeft /> Volver
                </Link>
            </div>

            <div className={styles.content}>
                {/* Image Gallery */}
                <div className={styles.gallery}>
                    <div className={styles.mainImage}>
                        <img
                            src={images[currentImage]}
                            alt={product.name}
                            onError={(e) => { e.target.src = '/placeholder-product.png' }}
                        />
                    </div>
                    {images.length > 1 && (
                        <div className={styles.thumbnails}>
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`${styles.thumbnail} ${currentImage === index ? styles.active : ''}`}
                                    onClick={() => setCurrentImage(index)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className={styles.info}>
                    {/* Category Badge */}
                    <span className={styles.category}>
                        <FiTag /> {product.category || 'Sin categoría'}
                    </span>

                    <h1 className={styles.name}>{product.name}</h1>

                    {/* Rating Display */}
                    <div className={styles.ratingDisplay}>
                        <div className={styles.stars}>
                            {renderStars(product.avgRating || 0)}
                        </div>
                        <span className={styles.ratingText}>
                            {product.avgRating > 0 ? product.avgRating.toFixed(1) : '-'}
                            <span className={styles.reviewCount}>({product.totalReviews || 0} reseñas)</span>
                        </span>
                    </div>

                    <div className={styles.price}>
                        ${product.price?.toLocaleString('es-AR')}
                    </div>

                    {product.stock !== undefined && (
                        <div className={styles.stock}>
                            <FiPackage /> {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className={styles.section}>
                            <h2>Descripción</h2>
                            <p className={styles.description}>{product.description}</p>
                        </div>
                    )}

                    {/* Vendor Info */}
                    {product.vendor && (
                        <div className={styles.section}>
                            <h2>Vendedor</h2>
                            <div className={styles.vendor}>
                                <Link to={`/vendor/${product.vendor.id}`} className={styles.vendorAvatar}>
                                    {product.vendor.logo ? (
                                        <img src={product.vendor.logo} alt={product.vendor.businessName} />
                                    ) : (
                                        <FiUser />
                                    )}
                                </Link>
                                <div className={styles.vendorInfo}>
                                    <Link to={`/vendor/${product.vendor.id}`} className={styles.vendorName}>
                                        {product.vendor.businessName}
                                    </Link>
                                    {product.vendor.city && (
                                        <span className={styles.vendorLocation}>
                                            <FiMapPin /> {product.vendor.city}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.actions}>
                        {!isOwnProduct && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
                                disabled={favoriteLoading}
                            >
                                {isFavorite ? <FaHeart /> : <FaRegHeart />}
                                {isFavorite ? 'Guardado' : 'Guardar'}
                            </button>
                        )}
                        {whatsappUrl && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.whatsappBtn}
                            >
                                <FaWhatsapp /> WhatsApp
                            </a>
                        )}
                        {!isOwnProduct && (
                            <button onClick={handleStartChat} className={styles.chatBtn}>
                                <FiMessageCircle /> Enviar mensaje
                            </button>
                        )}
                        {product.vendor && (
                            <Link to={`/vendor/${product.vendor.id}`} className={styles.storeBtn}>
                                <FiShoppingBag /> Ver tienda
                            </Link>
                        )}
                        <QRCodeButton
                            url={`/product/${id}`}
                            title={product.name}
                        />
                    </div>

                    {/* Share Section */}
                    <div className={styles.shareSection}>
                        <span className={styles.shareLabel}><FiShare2 /> Compartir:</span>
                        <div className={styles.shareButtons}>
                            <a
                                href={shareWhatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.shareWhatsapp}
                                title="Compartir en WhatsApp"
                            >
                                <FaWhatsapp /> WhatsApp
                            </a>
                            <a
                                href={shareFacebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.shareFacebook}
                                title="Compartir en Facebook"
                            >
                                <FaFacebookF /> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.reviewsSection}>
                <h2 className={styles.reviewsTitle}>
                    <FiStar /> Reseñas del Producto
                </h2>

                {/* Review Form */}
                {!isOwnProduct && (
                    <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                        <h3>{userReview ? 'Editar tu reseña' : 'Dejá tu reseña'}</h3>

                        <div className={styles.ratingInput}>
                            <span>Tu calificación:</span>
                            <div className={styles.starsInput}>
                                {renderStars(newRating, true)}
                            </div>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Contanos tu experiencia con este producto (opcional)"
                            rows={3}
                            className={styles.commentInput}
                        />

                        <button
                            type="submit"
                            className={styles.submitReviewBtn}
                            disabled={submitting || newRating === 0}
                        >
                            <FiSend /> {submitting ? 'Enviando...' : (userReview ? 'Actualizar Reseña' : 'Enviar Reseña')}
                        </button>
                    </form>
                )}

                {/* Reviews List */}
                <div className={styles.reviewsList}>
                    {reviewsLoading ? (
                        <p className={styles.loadingReviews}>Cargando reseñas...</p>
                    ) : reviews.length === 0 ? (
                        <p className={styles.noReviews}>
                            Aún no hay reseñas. ¡Sé el primero en opinar!
                        </p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.reviewUser}>
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className={styles.reviewAvatar} />
                                        ) : (
                                            <div className={styles.reviewAvatarPlaceholder}>
                                                {review.userName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div>
                                            <span className={styles.reviewUserName}>{review.userName}</span>
                                            <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className={styles.reviewRating}>
                                        {renderStars(review.rating, false, 'small')}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className={styles.reviewComment}>{review.comment}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
