import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { favoriteAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import styles from './MyFavorites.module.css';

function MyFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await favoriteAPI.getAll();
            setFavorites(response.data.favorites || []);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>Cargando favoritos...</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/" className={styles.backLink}>
                    <FiArrowLeft /> Volver
                </Link>
                <h1 className={styles.title}>
                    <FiHeart /> Mis Favoritos
                </h1>
            </div>

            {favorites.length === 0 ? (
                <div className={styles.empty}>
                    <FiHeart className={styles.emptyIcon} />
                    <h2>No tenés favoritos aún</h2>
                    <p>Explorá productos y tocá el ❤️ para guardarlos</p>
                    <Link to="/" className={styles.exploreBtn}>
                        <FiShoppingBag /> Explorar Productos
                    </Link>
                </div>
            ) : (
                <>
                    <p className={styles.count}>{favorites.length} producto{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}</p>
                    <div className={styles.grid}>
                        {favorites.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                initialFavorite={true}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default MyFavorites;
