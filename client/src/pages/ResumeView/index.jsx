import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { resumeAPI } from '../../api';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiPrinter } from 'react-icons/fi';
import { RESUME_TEMPLATES } from '../../data/resumeTemplates';
import styles from './ResumeView.module.css';

function ResumeView() {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadResume();
    }, [userId]);

    // Auto-print when ?print=true
    useEffect(() => {
        if (resume && searchParams.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [resume, searchParams]);

    const loadResume = async () => {
        try {
            setLoading(true);
            const response = await resumeAPI.getByUserId(userId);
            setResume(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cargar CV');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className={styles.loading}>Cargando CV...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>😕 {error}</h2>
                <Link to="/" className={styles.backBtn}>Volver al inicio</Link>
            </div>
        );
    }

    if (!resume || !resume.data) {
        return (
            <div className={styles.error}>
                <h2>CV no encontrado</h2>
                <Link to="/" className={styles.backBtn}>Volver al inicio</Link>
            </div>
        );
    }

    const { personalInfo, summary, experience, education, skills } = resume.data;
    const templateConfig = RESUME_TEMPLATES[resume.template] || RESUME_TEMPLATES.professional;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/classifieds" className={styles.backLink}>
                    <FiArrowLeft /> Volver a Clasificados
                </Link>
                <button onClick={handlePrint} className={styles.printBtn}>
                    <FiPrinter /> Imprimir / PDF
                </button>
            </div>

            <div className={`${styles.resume} ${styles[resume.template]}`}>
                {/* Personal Info Header */}
                <header className={styles.resumeHeader} style={{ '--template-color': templateConfig.color }}>
                    <div className={styles.nameSection}>
                        <h1>{personalInfo?.fullName || 'Sin nombre'}</h1>
                        {personalInfo?.title && <p className={styles.title}>{personalInfo.title}</p>}
                    </div>
                    <div className={styles.contactInfo}>
                        {personalInfo?.email && (
                            <span><FiMail /> {personalInfo.email}</span>
                        )}
                        {personalInfo?.phone && (
                            <span><FiPhone /> {personalInfo.phone}</span>
                        )}
                        {personalInfo?.location && (
                            <span><FiMapPin /> {personalInfo.location}</span>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {summary && (
                    <section className={styles.section}>
                        <h2>Perfil Profesional</h2>
                        <p className={styles.summary}>{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section className={styles.section}>
                        <h2>Experiencia Laboral</h2>
                        <div className={styles.timeline}>
                            {experience.map((exp, index) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineHeader}>
                                        <strong>{exp.position}</strong>
                                        <span className={styles.period}>{exp.startDate}</span>
                                    </div>
                                    <p className={styles.company}>{exp.company}</p>
                                    {exp.description && (
                                        <p className={styles.description}>{exp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <section className={styles.section}>
                        <h2>Educación</h2>
                        <div className={styles.timeline}>
                            {education.map((edu, index) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineHeader}>
                                        <strong>{edu.degree}</strong>
                                        <span className={styles.period}>{edu.year}</span>
                                    </div>
                                    <p className={styles.company}>{edu.institution}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <section className={styles.section}>
                        <h2>Habilidades</h2>
                        <div className={styles.skillsList}>
                            {skills.map((skill, index) => (
                                <span key={index} className={styles.skillTag}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category Badge */}
                <div className={styles.categoryBadge}>
                    {resume.category}
                </div>
            </div>
        </div>
    );
}

export default ResumeView;
