import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiCheck, FiPackage, FiTrendingUp, FiAward, FiPercent } from 'react-icons/fi';
import styles from './Premium.module.css';

function Premium() {
    const { isPremium } = useAuth();

    const features = [
        { icon: <FiPackage />, text: 'Productos ilimitados' },
        { icon: <FiTrendingUp />, text: 'Destacar en búsquedas' },
        { icon: <FiAward />, text: 'Badge de vendedor verificado' },
        { icon: <FiPercent />, text: 'Descuentos en comercios adheridos' },
        { icon: <FiStar />, text: 'Estadísticas de visitas' },
        { icon: <FiCheck />, text: 'Sin publicidad' },
    ];

    if (isPremium) {
        return (
            <div className={styles.page}>
                <div className={styles.alreadyPremium}>
                    <FiStar className={styles.premiumIcon} />
                    <h1>¡Ya eres Premium!</h1>
                    <p>Disfruta de todos los beneficios exclusivos</p>
                    <Link to="/my-products" className={styles.backBtn}>Ir a Mis Productos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <FiStar className={`${styles.premiumIcon} ${styles.animated}`} />
                <h1>ClickNGo Premium</h1>
                <p>Lleva tu negocio al siguiente nivel</p>
            </div>

            <div className={styles.card}>
                <div className={styles.priceSection}>
                    <span className={styles.price}>$999</span>
                    <span className={styles.period}>/mes</span>
                </div>

                <ul className={styles.featuresList}>
                    {features.map((feature, index) => (
                        <li key={index}><span className={styles.featureIcon}>{feature.icon}</span>{feature.text}</li>
                    ))}
                </ul>

                <button className={styles.subscribeBtn}><FiStar /> Suscribirse a Premium</button>
                <p className={styles.terms}>Cancela cuando quieras. Sin compromisos.</p>
            </div>

            <div className={styles.partnersSection}>
                <h2>Comercios Adheridos</h2>
                <p>Los suscriptores Premium tienen acceso a descuentos exclusivos</p>
                <div className={styles.partnersPlaceholder}><span>🏪</span><span>🍕</span><span>☕</span><span>🛒</span></div>
                <p className={styles.comingSoon}>Próximamente más comercios</p>
            </div>
        </div>
    );
}

export default Premium;
