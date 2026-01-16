import { Link } from 'react-router-dom';
import { FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './WelcomeBanner.module.css';

function WelcomeBanner() {
    const { isAuthenticated } = useAuth();

    // Don't show if user is logged in
    if (isAuthenticated) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <span className={styles.emoji}>👋</span>
                    <div className={styles.text}>
                        <h3>¡Bienvenido a ClickNGo!</h3>
                        <p>Creá tu cuenta gratis y accedé a ofertas exclusivas</p>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Link to="/register" className={styles.btnCreate}>
                        <FiUserPlus /> Crear Cuenta
                    </Link>
                    <Link to="/login" className={styles.btnLogin}>
                        Ya tengo cuenta
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default WelcomeBanner;
