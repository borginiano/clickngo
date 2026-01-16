import { useState, useEffect } from 'react';
import { fairAPI } from '../../api';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink } from 'react-icons/fi';
import styles from './Fairs.module.css';

function Fairs() {
    const [fairs, setFairs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadFairs(); }, []);

    const loadFairs = async () => {
        try {
            const { data } = await fairAPI.getAll({ upcoming: 'true' });
            setFairs(data);
        } catch (error) {
            console.error('Error loading fairs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    if (loading) return <div className="loading-page">Cargando ferias...</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <FiCalendar className={styles.headerIcon} />
                <h1>Calendario de Ferias</h1>
                <p>Encuentra ferias y eventos cerca de ti</p>
            </div>

            {fairs.length > 0 ? (
                <div className={styles.list}>
                    {fairs.map((fair) => (
                        <div key={fair.id} className={styles.card}>
                            {fair.image && <div className={styles.cardImage}><img src={fair.image} alt={fair.name} /></div>}
                            <div className={styles.cardContent}>
                                <h2>{fair.name}</h2>
                                {fair.description && <p className={styles.cardDescription}>{fair.description}</p>}
                                <div className={styles.cardMeta}>
                                    <span className={styles.cardDate}><FiCalendar /> {formatDate(fair.startDate)}</span>
                                    {fair.openTime && <span><FiClock /> {fair.openTime} - {fair.closeTime}</span>}
                                    <span><FiMapPin /> {fair.city || fair.address}</span>
                                    {fair.mapsUrl && (
                                        <a
                                            href={fair.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.mapLink}
                                        >
                                            <FiExternalLink /> Ver Mapa
                                        </a>
                                    )}
                                </div>
                                {fair.recurring && <span className={styles.recurringBadge}>🔄 {fair.recurring === 'weekly' ? 'Semanal' : fair.recurring === 'monthly' ? 'Mensual' : 'Permanente'}</span>}
                                {fair.openDays?.length > 0 && <span className={styles.daysBadge}>📅 {fair.openDays.join(', ')}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}><FiCalendar /><p>No hay ferias programadas próximamente</p><span>Vuelve pronto para ver nuevos eventos</span></div>
            )}
        </div>
    );
}

export default Fairs;
