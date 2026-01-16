import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiMapPin, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { TourButton } from '../Tour';
import styles from './Footer.module.css';

// Social links
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/GpRPJaPAsKX5qvLL78Mw7m';
const FACEBOOK_PAGE = 'https://www.facebook.com/61584957903862';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Brand */}
                <div className={styles.brand}>
                    <h3>🛒 ClickNGo</h3>
                    <p>Tu marketplace local de vendedores independientes</p>
                </div>

                {/* Links */}
                <div className={styles.links}>
                    <h4>Navegación</h4>
                    <a href="/">Explorar</a>
                    <a href="/fairs">Ferias</a>
                    <a href="/premium">Premium</a>
                </div>

                {/* Legal */}
                <div className={styles.links}>
                    <h4>Ayuda</h4>
                    <a href="/faq">Preguntas Frecuentes</a>
                    <a href="/privacy">Política de Privacidad</a>
                    <a href="/terms">Términos y Condiciones</a>
                    <TourButton />
                </div>

                {/* Community */}
                <div className={styles.community}>
                    <h4>Comunidad</h4>
                    <a href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        <FaWhatsapp /> Grupo WhatsApp
                    </a>
                    <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        <FaFacebookF /> Página Facebook
                    </a>
                </div>

                {/* Social Icons */}
                <div className={styles.social}>
                    <h4>Seguinos</h4>
                    <div className={styles.socialIcons}>
                        <a href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                            <FaWhatsapp />
                        </a>
                        <a href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer" title="Facebook">
                            <FaFacebookF />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className={styles.bottom}>
                <p>© 2025 ClickNGo. Hecho con <FiHeart className={styles.heart} /> en Latinoamérica</p>
                <p className={styles.credits}>Desarrollado con <strong>Antigravity</strong> - Claude Opus 4.5</p>
            </div>
        </footer>
    );
}

export default Footer;

