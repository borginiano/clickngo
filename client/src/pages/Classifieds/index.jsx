import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classifiedAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FiBriefcase, FiSearch, FiMapPin, FiClock, FiPlus, FiFilter, FiUser, FiX } from 'react-icons/fi';
import { countries, getProvincesByCountry, getCitiesByProvince } from '../../data/locations';
import styles from './Classifieds.module.css';

const JOB_CATEGORIES = [
    'Todos', 'Gastronomía', 'Limpieza', 'Ventas', 'Construcción',
    'Cuidado de personas', 'Transporte', 'Administración',
    'Tecnología', 'Educación', 'Salud', 'Belleza', 'Otros'
];

const JOB_TYPES = {
    TEMPORARY: 'Temporal',
    PERMANENT: 'Permanente',
    TRIAL: 'A prueba'
};

function Classifieds() {
    const { user } = useAuth();
    const [classifieds, setClassifieds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [category, setCategory] = useState('Todos');
    const [showFilters, setShowFilters] = useState(false);

    // Location filters - default to user's location
    const userCity = user?.vendor?.city || '';
    const userProvince = user?.vendor?.province || '';
    const [province, setProvince] = useState(userProvince);
    const [city, setCity] = useState(userCity);

    useEffect(() => {
        loadClassifieds();
    }, [type, category, province, city]);

    const loadClassifieds = async () => {
        try {
            setLoading(true);
            const params = {};
            if (type) params.type = type;
            if (category && category !== 'Todos') params.category = category;
            if (search) params.search = search;
            if (province) params.province = province;
            if (city) params.city = city;

            const response = await classifiedAPI.getAll(params);
            setClassifieds(response.data);
        } catch (error) {
            console.error('Error loading classifieds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadClassifieds();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <h1><FiBriefcase /> Clasificados de Empleo</h1>
                <p>Encuentra trabajo o publica tu oferta laboral</p>

                {/* Location Badge */}
                {(province || city) && (
                    <div className={styles.locationBadge}>
                        <FiMapPin />
                        <span>Buscando en: {city || province}</span>
                        <button onClick={() => { setProvince(''); setCity(''); }} title="Limpiar ubicación">
                            <FiX />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar clasificados..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.searchBtn}>Buscar</button>
                </form>

                <div className={styles.heroActions}>
                    {user && (
                        <Link to="/my-classifieds" className={styles.createBtn}>
                            <FiPlus /> Publicar Clasificado
                        </Link>
                    )}
                    <button
                        className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Filtros
                    </button>
                </div>
            </section>

            {/* Filters */}
            {showFilters && (
                <section className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>Tipo</label>
                        <div className={styles.typeButtons}>
                            <button
                                className={`${styles.typeBtn} ${type === '' ? styles.active : ''}`}
                                onClick={() => setType('')}
                            >
                                Todos
                            </button>
                            <button
                                className={`${styles.typeBtn} ${styles.seeking} ${type === 'SEEKING' ? styles.active : ''}`}
                                onClick={() => setType('SEEKING')}
                            >
                                Buscan Trabajo
                            </button>
                            <button
                                className={`${styles.typeBtn} ${styles.offering} ${type === 'OFFERING' ? styles.active : ''}`}
                                onClick={() => setType('OFFERING')}
                            >
                                Ofrecen Trabajo
                            </button>
                        </div>
                    </div>

                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label>Provincia</label>
                            <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(''); }}>
                                <option value="">Todas las provincias</option>
                                {getProvincesByCountry('AR').map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Ciudad</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province}>
                                <option value="">Todas las ciudades</option>
                                {getCitiesByProvince(province).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Categoría</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {JOB_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </section>
            )}

            {/* Classifieds List */}
            <section className={styles.list}>
                {loading ? (
                    <div className={styles.loading}>Cargando clasificados...</div>
                ) : classifieds.length > 0 ? (
                    <div className={styles.grid}>
                        {classifieds.map((item) => (
                            <Link
                                key={item.id}
                                to={`/classified/${item.id}`}
                                className={styles.card}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={`${styles.badge} ${item.type === 'SEEKING' ? styles.badgeSeeking : styles.badgeOffering}`}>
                                        {item.type === 'SEEKING' ? '🔍 Busco Trabajo' : '💼 Ofrezco Trabajo'}
                                    </span>
                                    <span className={styles.jobType}>{JOB_TYPES[item.jobType]}</span>
                                </div>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardDesc}>{item.description.substring(0, 150)}...</p>
                                <div className={styles.cardMeta}>
                                    <span><FiMapPin /> {item.city}</span>
                                    <span><FiClock /> {formatDate(item.createdAt)}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.category}>{item.category}</span>
                                    <div className={styles.userInfo}>
                                        <FiUser /> {item.user?.name}
                                    </div>
                                </div>
                                {item.attachResume && (
                                    <span className={styles.cvBadge}>
                                        📄 CV adjunto
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <FiBriefcase />
                        <p>No hay clasificados disponibles</p>
                        {user && (
                            <Link to="/my-classifieds" className={styles.createBtn}>
                                <FiPlus /> Publicar el primero
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {/* CTA for non-logged users */}
            {!user && (
                <section className={styles.cta}>
                    <h2>¿Buscas trabajo o empleados?</h2>
                    <p>Crea una cuenta gratis para publicar tu clasificado</p>
                    <Link to="/register" className={styles.ctaBtn}>Crear Cuenta</Link>
                </section>
            )}
        </div>
    );
}

export default Classifieds;
