import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiShoppingBag, FiCalendar, FiStar, FiLogOut, FiGrid, FiChevronDown, FiMessageSquare, FiBriefcase, FiHeart } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from '../NotificationBell';
import styles from './Navbar.module.css';

function Navbar() {
    const { user, logout, isVendor } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
        setUserMenuOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoIcon}>📍</span>
                    <span className={styles.logoText}>ClickNGo</span>
                </Link>

                <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>

                <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ''} `}>
                    <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                        Explorar
                    </Link>
                    <Link to="/fairs" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                        <FiCalendar /> Ferias
                    </Link>
                    <Link to="/classifieds" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                        <FiBriefcase /> Clasificados
                    </Link>

                    {user ? (
                        <>
                            {isVendor && (
                                <Link to="/my-products" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                                    <FiShoppingBag /> Mis Productos
                                </Link>
                            )}

                            {/* Mi Cuenta - for all users */}
                            <Link to="/my-account" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                                <FiGrid /> Mi Cuenta
                            </Link>

                            {/* Favoritos */}
                            <Link to="/my-favorites" className={styles.favoritesLink} onClick={() => setMenuOpen(false)}>
                                <FiHeart /> Favoritos
                            </Link>

                            {!isVendor && (
                                <Link to="/become-vendor" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                                    Vender
                                </Link>
                            )}

                            {user.subscription !== 'PREMIUM' && (
                                <Link to="/premium" className={styles.premiumLink} onClick={() => setMenuOpen(false)}>
                                    <FiStar /> Premium
                                </Link>
                            )}

                            {/* Link al Chat */}
                            <Link to="/chat" className={styles.navLink} onClick={() => setMenuOpen(false)}>
                                <FiMessageSquare /> Chat
                            </Link>

                            {/* Admin Panel - only for admins */}
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`} onClick={() => setMenuOpen(false)}>
                                    🛡️ Admin
                                </Link>
                            )}

                            {/* La Vieja Chismosa - Notificaciones */}
                            <NotificationBell />

                            <div className={styles.userMenu} ref={userMenuRef}>
                                <button
                                    className={styles.userButton}
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <FiUser />
                                    <span>{user.name}</span>
                                    <FiChevronDown className={`${styles.chevron} ${userMenuOpen ? styles.chevronOpen : ''} `} />
                                </button>
                                {userMenuOpen && (
                                    <div className={styles.userDropdown}>
                                        <div className={styles.dropdownUser}>
                                            <strong>{user.name}</strong>
                                            <span>{user.email}</span>
                                        </div>
                                        <div className={styles.dropdownDivider} />

                                        <Link to="/my-account" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                                            <FiUser /> Mi Cuenta
                                        </Link>

                                        <div className={styles.dropdownDivider} />
                                        <button onClick={handleLogout} className={styles.dropdownItem}>
                                            <FiLogOut /> Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link to="/login" className={styles.btnLogin} onClick={() => setMenuOpen(false)}>
                                Ingresar
                            </Link>
                            <Link to="/register" className={styles.btnRegister} onClick={() => setMenuOpen(false)}>
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
