import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classifiedAPI, resumeAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiBriefcase, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiClock, FiMapPin, FiFileText } from 'react-icons/fi';
import { countries, getProvincesByCountry, getCitiesByProvince } from '../../data/locations';
import styles from './MyClassifieds.module.css';

const JOB_CATEGORIES = [
    'Gastronomía', 'Limpieza', 'Ventas', 'Construcción',
    'Cuidado de personas', 'Transporte', 'Administración',
    'Tecnología', 'Educación', 'Salud', 'Belleza', 'Otros'
];

const JOB_TYPES = [
    { value: 'TEMPORARY', label: 'Temporal' },
    { value: 'PERMANENT', label: 'Permanente' },
    { value: 'TRIAL', label: 'A prueba' }
];

const CLASSIFIED_TYPES = [
    { value: 'SEEKING', label: '🔍 Busco Trabajo', desc: 'Quiero ofrecer mis servicios' },
    { value: 'OFFERING', label: '💼 Ofrezco Trabajo', desc: 'Necesito contratar a alguien' }
];

function MyClassifieds() {
    const { user } = useAuth();
    const [classifieds, setClassifieds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [remaining, setRemaining] = useState(5);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [hasPublicResume, setHasPublicResume] = useState(false);

    // Default to user's location if available
    const defaultCountry = user?.vendor?.country || 'AR';
    const defaultProvince = user?.vendor?.province || '';
    const defaultCity = user?.vendor?.city || '';

    const [formData, setFormData] = useState({
        type: 'SEEKING',
        title: '',
        description: '',
        category: 'Otros',
        jobType: 'TEMPORARY',
        country: defaultCountry,
        province: defaultProvince,
        city: defaultCity,
        contact: '',
        attachResume: false
    });

    useEffect(() => {
        loadMyClassifieds();
        checkResume();
    }, []);

    const checkResume = async () => {
        try {
            const response = await resumeAPI.getMy();
            if (response.data && response.data.isPublic) {
                setHasPublicResume(true);
            }
        } catch (error) {
            // No resume
        }
    };

    const loadMyClassifieds = async () => {
        try {
            setLoading(true);
            const response = await classifiedAPI.getMy();
            setClassifieds(response.data.classifieds);
            setCount(response.data.count);
            setRemaining(response.data.remaining);
        } catch (error) {
            toast.error('Error cargando clasificados');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.city) {
            toast.error('Completa todos los campos requeridos');
            return;
        }

        try {
            if (editing) {
                await classifiedAPI.update(editing.id, formData);
                toast.success('Clasificado actualizado');
            } else {
                await classifiedAPI.create(formData);
                toast.success('Clasificado publicado');
            }
            resetForm();
            loadMyClassifieds();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este clasificado?')) return;

        try {
            await classifiedAPI.delete(id);
            toast.success('Clasificado eliminado');
            loadMyClassifieds();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const startEdit = (item) => {
        setEditing(item);
        setFormData({
            type: item.type,
            title: item.title,
            description: item.description,
            category: item.category,
            jobType: item.jobType,
            country: item.country || 'AR',
            province: item.province || '',
            city: item.city,
            contact: item.contact || '',
            attachResume: item.attachResume || false
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditing(null);
        setFormData({
            type: 'SEEKING',
            title: '',
            description: '',
            category: 'Otros',
            jobType: 'TEMPORARY',
            country: defaultCountry,
            province: defaultProvince,
            city: defaultCity,
            contact: '',
            attachResume: false
        });
        setShowForm(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const daysUntilExpiry = (expiresAt) => {
        const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/classifieds" className={styles.backBtn}>
                    <FiArrowLeft /> Volver a Clasificados
                </Link>
                <h1><FiBriefcase /> Mis Clasificados</h1>
                <p className={styles.counter}>
                    {count} de 5 clasificados usados • {remaining} disponibles
                </p>
            </div>

            {/* Create Button or Form */}
            {!showForm ? (
                <div className={styles.actions}>
                    {remaining > 0 ? (
                        <button className={styles.createBtn} onClick={() => setShowForm(true)}>
                            <FiPlus /> Nuevo Clasificado
                        </button>
                    ) : (
                        <p className={styles.limitMsg}>
                            Has alcanzado el límite de 5 clasificados.
                            Elimina uno para crear otro.
                        </p>
                    )}
                </div>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h2>{editing ? 'Editar Clasificado' : 'Nuevo Clasificado'}</h2>

                    {/* Type Selection */}
                    <div className={styles.typeSelection}>
                        {CLASSIFIED_TYPES.map(t => (
                            <label
                                key={t.value}
                                className={`${styles.typeOption} ${formData.type === t.value ? styles.active : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value={t.value}
                                    checked={formData.type === t.value}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                />
                                <span className={styles.typeLabel}>{t.label}</span>
                                <span className={styles.typeDesc}>{t.desc}</span>
                            </label>
                        ))}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Título *</label>
                        <input
                            type="text"
                            placeholder="Ej: Busco trabajo de mozo / Necesito vendedor part-time"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Descripción *</label>
                        <textarea
                            placeholder="Describe el trabajo, requisitos, horarios, etc."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            maxLength={1000}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Categoría</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {JOB_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tipo de empleo</label>
                            <select
                                value={formData.jobType}
                                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                            >
                                {JOB_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>País *</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value, province: '', city: '' })}
                            >
                                {countries.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Provincia *</label>
                            <select
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value, city: '' })}
                            >
                                <option value="">Seleccionar...</option>
                                {getProvincesByCountry(formData.country).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Ciudad *</label>
                            <select
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                disabled={!formData.province}
                            >
                                <option value="">Seleccionar...</option>
                                {getCitiesByProvince(formData.province).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>WhatsApp (opcional)</label>
                            <input
                                type="text"
                                placeholder="Ej: 2984123456"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* CV Attachment */}
                    {hasPublicResume && formData.type === 'SEEKING' && (
                        <div className={styles.cvAttachment}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.attachResume}
                                    onChange={(e) => setFormData({ ...formData, attachResume: e.target.checked })}
                                />
                                <FiFileText />
                                <span>Adjuntar mi CV público</span>
                            </label>
                            <Link to="/my-resume" className={styles.cvLink}>Ver/Editar CV</Link>
                        </div>
                    )}

                    {!hasPublicResume && formData.type === 'SEEKING' && (
                        <div className={styles.cvPromo}>
                            <FiFileText />
                            <span>¿Sabías que podés crear un CV profesional gratis?</span>
                            <Link to="/my-resume">Crear mi CV</Link>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            {editing ? 'Guardar Cambios' : 'Publicar'}
                        </button>
                    </div>
                </form>
            )}

            {/* My Classifieds List */}
            <div className={styles.list}>
                {loading ? (
                    <p className={styles.loading}>Cargando...</p>
                ) : classifieds.length > 0 ? (
                    classifieds.map(item => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={`${styles.badge} ${item.type === 'SEEKING' ? styles.badgeSeeking : styles.badgeOffering}`}>
                                    {item.type === 'SEEKING' ? '🔍 Busco Trabajo' : '💼 Ofrezco Trabajo'}
                                </span>
                                <div className={styles.cardActions}>
                                    <button onClick={() => startEdit(item)} title="Editar">
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} title="Eliminar">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                            <h3>{item.title}</h3>
                            <p className={styles.cardDesc}>{item.description}</p>
                            <div className={styles.cardMeta}>
                                <span><FiMapPin /> {item.city}</span>
                                <span><FiClock /> Expira en {daysUntilExpiry(item.expiresAt)} días</span>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={styles.category}>{item.category}</span>
                                <span className={styles.date}>Publicado: {formatDate(item.createdAt)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <FiBriefcase />
                        <p>No tienes clasificados publicados</p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={styles.info}>
                <h3>ℹ️ Información</h3>
                <ul>
                    <li>Puedes tener hasta <strong>5 clasificados</strong> activos</li>
                    <li>Los clasificados expiran automáticamente en <strong>30 días</strong></li>
                    <li>Editar un clasificado extiende su fecha de expiración</li>
                    <li>Puedes eliminar clasificados para liberar espacio</li>
                </ul>
            </div>
        </div>
    );
}

export default MyClassifieds;
