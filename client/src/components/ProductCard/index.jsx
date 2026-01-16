import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { favoriteAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './ProductCard.module.css';

function ProductCard({ product, onEdit, onDelete, editable = false, initialFavorite = false }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(initialFavorite || product.isFavorite || false);
    const [loading, setLoading] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price);
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Iniciá sesión para guardar favoritos');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await favoriteAPI.toggle(product.id);
            setIsFavorite(response.data.isFavorite);
            toast.success(response.data.isFavorite ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos');
        } catch (error) {
            toast.error('Error al cambiar favorito');
        } finally {
            setLoading(false);
        }
    };

    const cardContent = (
        <>
            <div className={styles.image}>
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                ) : (
                    <div className={styles.noImage}>
                        <FiPackage />
                    </div>
                )}
                {/* Favorite button - only show if not editable */}
                {!editable && (
                    <button
                        className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
                        onClick={handleToggleFavorite}
                        disabled={loading}
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
                {/* Featured badge */}
                {product.featured && (
                    <span className={styles.featuredBadge}>⭐</span>
                )}
            </div>

            <div className={styles.info}>
                <h3>{product.name}</h3>
                <span className={styles.category}>{product.category}</span>

                {product.description && (
                    <p className={styles.description}>{product.description}</p>
                )}

                <div className={styles.price}>{formatPrice(product.price)}</div>

                {editable && (
                    <div className={styles.actions} onClick={(e) => e.preventDefault()}>
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(product); }} className={styles.btnEdit}>
                            Editar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete?.(product); }} className={styles.btnDelete}>
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </>
    );

    // If editable, use div to avoid navigation issues
    if (editable) {
        return <div className={styles.card}>{cardContent}</div>;
    }

    return (
        <Link to={`/product/${product.id}`} className={styles.card}>
            {cardContent}
        </Link>
    );
}

export default ProductCard;
