import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from './Auth.module.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('¡Bienvenido!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    // Web Google Login using @react-oauth/google
    const googleWebLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // Get user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoResponse.json();

                // Send to our backend
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
                    <h1>¡Hola de nuevo!</h1>
                    <p>Ingresa a tu cuenta para continuar</p>
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
                        <span>Continuar con Google</span>
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>o con email</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <FiMail className={styles.inputIcon} />
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className={styles.inputGroup}>
                        <FiLock className={styles.inputIcon} />
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Ingresando...' : <><span>Ingresar</span> <FiArrowRight /></>}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>¿No tienes cuenta?</p>
                    <Link to="/register">Crear cuenta</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;

