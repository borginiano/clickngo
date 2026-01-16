import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { classifiedAPI, chatAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
    FiArrowLeft, FiMapPin, FiClock, FiBriefcase, FiFileText,
    FiUser, FiCalendar, FiMessageCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import styles from './ClassifiedDetail.module.css';

const JOB_TYPES = {
    TEMPORARY: 'Temporal',
    PERMANENT: 'Permanente',
    TRIAL: 'A prueba'
};

function ClassifiedDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [classified, setClassified] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadClassified();
    }, [id]);

    const loadClassified = async () => {
        try {
            setLoading(true);
            const response = await classifiedAPI.getById(id);
            setClassified(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Clasificado no encontrado');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async () => {
        if (!isAuthenticated) {
            toast.error('Iniciá sesión para enviar mensajes');
            return;
        }

        if (classified.user?.id === user?.id) {
            toast.error('No podés chatear contigo mismo');
            return;
        }

        try {
            await chatAPI.startConversation(classified.user.id);
            navigate('/chat');
        } catch (error) {
            toast.error('Error al iniciar chat');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const daysUntilExpiry = (expiresAt) => {
        const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    if (loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>😕 {error}</h2>
                <Link to="/classifieds" className={styles.backBtn}>Volver a Clasificados</Link>
            </div>
        );
    }

    if (!classified) {
        return (
            <div className={styles.error}>
                <h2>Clasificado no encontrado</h2>
                <Link to="/classifieds" className={styles.backBtn}>Volver a Clasificados</Link>
            </div>
        );
    }

    const whatsappUrl = classified.contact
        ? `https://wa.me/54${classified.contact.replace(/\D/g, '')}?text=Hola! Vi tu clasificado "${classified.title}" en ClickNGo`
        : null;

    const isOwnClassified = user?.id === classified.user?.id;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/classifieds" className={styles.backLink}>
                    <FiArrowLeft /> Volver a Clasificados
                </Link>
            </div>

            <article className={styles.classified}>
                {/* Badge */}
                <div className={styles.badgeRow}>
                    <span className={`${styles.badge} ${classified.type === 'SEEKING' ? styles.badgeSeeking : styles.badgeOffering}`}>
                        {classified.type === 'SEEKING' ? '🔍 Busca Trabajo' : '💼 Ofrece Trabajo'}
                    </span>
                    <span className={styles.jobType}>{JOB_TYPES[classified.jobType]}</span>
                </div>

                {/* Title */}
                <h1 className={styles.title}>{classified.title}</h1>

                {/* Meta */}
                <div className={styles.meta}>
                    <span><FiMapPin /> {classified.city}{classified.province ? `, ${classified.province}` : ''}</span>
                    <span><FiBriefcase /> {classified.category}</span>
                    <span><FiCalendar /> Publicado: {formatDate(classified.createdAt)}</span>
                </div>

                {/* Description */}
                <div className={styles.section}>
                    <h2>Descripción</h2>
                    <p className={styles.description}>{classified.description}</p>
                </div>

                {/* Publisher Info */}
                <div className={styles.section}>
                    <h2>Publicado por</h2>
                    <div className={styles.publisher}>
                        <div className={styles.avatar}>
                            {classified.user?.avatar ? (
                                <img src={classified.user.avatar} alt={classified.user.name} />
                            ) : (
                                <FiUser />
                            )}
                        </div>
                        <div className={styles.publisherInfo}>
                            <span className={styles.publisherName}>
                                {classified.user?.name || 'Usuario'}
                            </span>
                            <div className={styles.publisherActions}>
                                {classified.user?.vendor && (
                                    <Link to={`/vendor/${classified.user.vendor.id}`} className={styles.vendorLink}>
                                        Ver tienda
                                    </Link>
                                )}
                                {!isOwnClassified && (
                                    <button onClick={handleStartChat} className={styles.chatBtn}>
                                        <FiMessageCircle /> Enviar mensaje
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CV Attachment */}
                {classified.attachResume && classified.user?.id && (
                    <div className={styles.section}>
                        <h2>CV Adjunto</h2>
                        <Link
                            to={`/resume/${classified.user.id}`}
                            className={styles.cvLink}
                            target="_blank"
                        >
                            <FiFileText /> Ver CV de {classified.user?.name || 'Usuario'}
                        </Link>
                    </div>
                )}

                {/* Contact */}
                <div className={styles.contactSection}>
                    {isOwnClassified ? (
                        <p className={styles.noContact}>
                            Este es tu clasificado
                        </p>
                    ) : (
                        <div className={styles.contactButtons}>
                            {whatsappUrl && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.whatsappBtn}
                                >
                                    <FaWhatsapp /> WhatsApp
                                </a>
                            )}
                            <button onClick={handleStartChat} className={styles.chatBtnLarge}>
                                <FiMessageCircle /> Enviar mensaje
                            </button>
                        </div>
                    )}
                </div>

                {/* Expiry */}
                <div className={styles.footer}>
                    <span className={styles.expiry}>
                        <FiClock /> Expira en {daysUntilExpiry(classified.expiresAt)} días
                    </span>
                </div>
            </article>
        </div>
    );
}

export default ClassifiedDetail;
