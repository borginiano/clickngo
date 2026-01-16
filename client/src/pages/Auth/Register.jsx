import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from './Auth.module.css';

function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { register, loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setLoading(true);
        try {
            await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
            toast.success('¡Cuenta creada exitosamente!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    // Web Google Login using @react-oauth/google
    const googleWebLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoResponse.json();

                const { data } = await api.post('/auth/google', {
                    credential: tokenResponse.access_token,
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture
                });

                loginWithToken(data.user, data.token);
                toast.success(`¡Bienvenido ${data.user.name}!`);
                navigate('/');
            } catch (error) {
                console.error('Google auth error:', error);
                toast.error('Error con Google Sign-In');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error('Error con Google Sign-In');
        }
    });

    const handleGoogleSignIn = () => {
        googleWebLogin();
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Crear Cuenta</h1>
                    <p>Únete a la comunidad de vendedores</p>
                </div>

                {/* Google Sign-In Button - always show */}
                <div className={styles.googleSection}>
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className={styles.googleButton}
                        disabled={loading}
                    >
                        <FcGoogle size={24} />
                        <span>Registrarse con Google</span>
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>o con email</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <FiUser className={styles.inputIcon} />
                        <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <FiMail className={styles.inputIcon} />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <FiPhone className={styles.inputIcon} />
                        <input type="tel" name="phone" placeholder="Teléfono (opcional)" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className={styles.inputGroup}>
                        <FiLock className={styles.inputIcon} />
                        <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <FiLock className={styles.inputIcon} />
                        <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Creando cuenta...' : <><span>Registrarse</span> <FiArrowRight /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>¿Ya tienes cuenta?</p>
                    <Link to="/login">Iniciar sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;

