import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, productAPI, classifiedAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMapPin, FiGrid, FiMap, FiFilter, FiTruck, FiPackage, FiShoppingBag, FiBriefcase, FiArrowRight, FiUserPlus } from 'react-icons/fi';
import VendorCard from '../../components/VendorCard';
import ProductCard from '../../components/ProductCard';
import VendorsMap from '../../components/VendorsMap';
import { FILTER_CATEGORIES } from '../../data/categories';

import styles from './Home.module.css';

// Delivery options
const DELIVERY_OPTIONS = [
    { value: '', label: 'Todos', icon: FiPackage },
    { value: 'DELIVERY', label: 'Delivery', icon: FiTruck },
    { value: 'PICKUP', label: 'Retiro', icon: FiMapPin },
];

function Home() {
    const { user } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [classifieds, setClassifieds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState(null);
    const [useLocation, setUseLocation] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    // Filter states
    const [category, setCategory] = useState('Todos');
    const [deliveryFilter, setDeliveryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadData();
    }, [location, useLocation]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (useLocation && location) {
                params.lat = location.lat;
                params.lng = location.lng;
                params.radius = 10;
            }

            // Load vendors, products, featured and classifieds
            const [vendorsRes, productsRes, featuredRes, classifiedsRes] = await Promise.all([
                vendorAPI.getAll(params),
                productAPI.getAll({ limit: 8 }),
                productAPI.getFeatured(),
                classifiedAPI.getAll({ city: user?.vendor?.city || '' })
            ]);

            setVendors(vendorsRes.data);
            setProducts(productsRes.data?.slice?.(0, 8) || []);
            setFeaturedProducts(featuredRes.data || []);

            // Sort classifieds: user's city first
            const userCity = user?.vendor?.city || '';
            const sortedClassifieds = (classifiedsRes.data || []).sort((a, b) => {
                const aMatch = a.city?.toLowerCase() === userCity.toLowerCase();
                const bMatch = b.city?.toLowerCase() === userCity.toLowerCase();
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setClassifieds(sortedClassifieds.slice(0, 6));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadData();
    };

    const getMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setUseLocation(true);
                },
                (error) => console.error('Error getting location:', error)
            );
        }
    };

    // Filter vendors locally
    const filteredVendors = vendors.filter(vendor => {
        if (category !== 'Todos' && vendor.category !== category) {
            return false;
        }
        if (deliveryFilter) {
            const hasMatchingDelivery = vendor.products?.some(product =>
                product.deliveryType === deliveryFilter || product.deliveryType === 'BOTH'
            );
            if (!hasMatchingDelivery && vendor.products?.length > 0) {
                return false;
            }
        }
        return true;
    });

    const activeFiltersCount = (category !== 'Todos' ? 1 : 0) + (deliveryFilter ? 1 : 0);

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Descubre vendedores cerca de ti</h1>
                    <p className={styles.heroSubtitle}>Conecta con emprendedores locales y encuentra productos únicos</p>

                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <div className={styles.searchWrapper}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="¿Qué estás buscando?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={styles.searchButton}>Buscar</button>
                    </form>

                    <div className={styles.heroActions}>
                        <button
                            className={`${styles.locationButton} ${useLocation ? styles.locationButtonActive : ''}`}
                            onClick={getMyLocation}
                        >
                            <FiMapPin />
                            {useLocation ? 'Cerca de ti' : 'Mi ubicación'}
                        </button>
                        <button
                            className={`${styles.filterButton} ${activeFiltersCount > 0 ? styles.filterButtonActive : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiFilter />
                            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>

                    {showFilters && (
                        <div className={styles.filtersPanel}>
                            <div className={styles.filterGroup}>
                                <label>Categoría</label>
                                <div className={styles.filterChips}>
                                    {FILTER_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Tipo de entrega</label>
                                <div className={styles.filterChips}>
                                    {DELIVERY_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`${styles.chip} ${deliveryFilter === opt.value ? styles.chipActive : ''}`}
                                            onClick={() => setDeliveryFilter(opt.value)}
                                        >
                                            <opt.icon /> {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFiltersCount > 0 && (
                                <button
                                    className={styles.clearFilters}
                                    onClick={() => { setCategory('Todos'); setDeliveryFilter(''); }}
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner for non-vendors */}
            {user && !user.vendor && (
                <section className={styles.vendorCtaBanner}>
                    <div className={styles.vendorCtaContent}>
                        <div className={styles.vendorCtaText}>
                            <h3>🚀 ¿Querés vender tus productos?</h3>
                            <p>Creá tu tienda gratis y empezá a vender hoy mismo</p>
                        </div>
                        <Link to="/become-vendor" className={styles.vendorCtaBtn}>
                            <FiShoppingBag /> Crear mi Tienda
                        </Link>
                    </div>
                </section>
            )}

            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
                <section className={styles.productsSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2>⭐ Productos Destacados</h2>
                            <span className={styles.count}>{featuredProducts.length} destacados</span>
                        </div>
                    </div>
                    <div className={styles.productsScroll}>
                        {featuredProducts.map((product) => (
                            <div key={product.id} className={styles.productWrapper}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Products Section */}
            {products.length > 0 && (
                <section className={styles.productsSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2><FiShoppingBag /> Productos Recientes</h2>
                            <span className={styles.count}>{products.length} nuevos</span>
                        </div>
                    </div>
                    <div className={styles.productsScroll}>
                        {products.map((product) => (
                            <div key={product.id} className={styles.productWrapper}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Classifieds Feed Section */}
            {classifieds.length > 0 && (
                <section className={styles.classifiedsSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2><FiBriefcase /> Clasificados de Empleo</h2>
                            <span className={styles.count}>Oportunidades cerca tuyo</span>
                        </div>
                        <Link to="/classifieds" className={styles.viewAllLink}>
                            Ver todos <FiArrowRight />
                        </Link>
                    </div>
                    <div className={styles.classifiedsGrid}>
                        {classifieds.map((item) => (
                            <Link key={item.id} to="/classifieds" className={styles.classifiedCard}>
                                <div className={styles.classifiedHeader}>
                                    <span className={`${styles.classifiedBadge} ${item.type === 'SEEKING' ? styles.seeking : styles.offering}`}>
                                        {item.type === 'SEEKING' ? '🔍 Busca' : '💼 Ofrece'}
                                    </span>
                                    <span className={styles.classifiedCity}><FiMapPin /> {item.city}</span>
                                </div>
                                <h3 className={styles.classifiedTitle}>{item.title}</h3>
                                <p className={styles.classifiedDesc}>{item.description.substring(0, 80)}...</p>
                                <span className={styles.classifiedCategory}>{item.category}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className={styles.vendorsSection}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2>Vendedores Destacados</h2>
                        {filteredVendors.length > 0 && <span className={styles.count}>{filteredVendors.length} encontrados</span>}
                    </div>
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleBtnActive : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <FiGrid /> Grid
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.toggleBtnActive : ''}`}
                            onClick={() => setViewMode('map')}
                        >
                            <FiMap /> Mapa
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
                    </div>
                ) : viewMode === 'grid' ? (
                    filteredVendors.length > 0 ? (
                        <div className={styles.vendorsGrid}>
                            {filteredVendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <p>No se encontraron vendedores</p>
                            {(search || activeFiltersCount > 0) && (
                                <button onClick={() => { setSearch(''); setCategory('Todos'); setDeliveryFilter(''); loadData(); }}>
                                    Limpiar búsqueda y filtros
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    <VendorsMap vendors={filteredVendors} userLocation={useLocation ? location : null} />
                )}
            </section>

            <section className={styles.ctaSection}>
                <h2>¿Eres vendedor?</h2>
                <p>Muestra tus productos a miles de personas cerca de ti</p>
                <Link to="/become-vendor" className={styles.ctaButton}>Comenzar a Vender</Link>
            </section>
        </div>
    );
}

export default Home;
