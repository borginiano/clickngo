import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resumeAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { FiFileText, FiSave, FiEye, FiEyeOff, FiTrash2, FiArrowLeft, FiPlus, FiX, FiDownload } from 'react-icons/fi';
import { RESUME_CATEGORIES, RESUME_TEMPLATES, CATEGORY_FIELDS, RESUME_EXAMPLES, RESUME_TIPS, EMPTY_RESUME } from '../../data/resumeTemplates';
import styles from './ResumeBuilder.module.css';

function ResumeBuilder() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasResume, setHasResume] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [resumeId, setResumeId] = useState(null);

    const [template, setTemplate] = useState('professional');
    const [category, setCategory] = useState('Otros');
    const [showTips, setShowTips] = useState(true);
    const [showExamples, setShowExamples] = useState(false);

    const [formData, setFormData] = useState({
        personalInfo: {
            fullName: '',
            title: '',
            phone: '',
            email: '',
            location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        customFields: {}
    });

    useEffect(() => {
        loadResume();
    }, []);

    const loadResume = async () => {
        try {
            setLoading(true);
            const response = await resumeAPI.getMy();
            if (response.data) {
                setHasResume(true);
                setResumeId(response.data.id);
                setTemplate(response.data.template || 'professional');
                setCategory(response.data.category || 'Otros');
                setIsPublic(response.data.isPublic || false);
                setFormData(response.data.data || EMPTY_RESUME);
            }
        } catch (error) {
            // No resume yet, that's ok
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.personalInfo.fullName) {
            toast.error('Ingresa tu nombre completo');
            return;
        }

        try {
            setSaving(true);
            await resumeAPI.save({
                template,
                category,
                data: formData,
                isPublic
            });
            toast.success('CV guardado exitosamente');
            setHasResume(true);
        } catch (error) {
            toast.error('Error al guardar CV');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Eliminar tu CV? Podrás crear uno nuevo.')) return;

        try {
            await resumeAPI.delete();
            toast.success('CV eliminado');
            setHasResume(false);
            setFormData(EMPTY_RESUME);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const toggleVisibility = async () => {
        try {
            await resumeAPI.toggleVisibility(!isPublic);
            setIsPublic(!isPublic);
            toast.success(isPublic ? 'CV ahora es privado' : 'CV ahora es público');
        } catch (error) {
            toast.error('Error al cambiar visibilidad');
        }
    };

    const updatePersonalInfo = (field, value) => {
        setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                position: '',
                company: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }]
        }));
    };

    const updateExperience = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const removeExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, {
                institution: '',
                degree: '',
                year: ''
            }]
        }));
    };

    const updateEducation = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const addSkill = (skill) => {
        if (skill && !formData.skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const categoryConfig = CATEGORY_FIELDS[category] || CATEGORY_FIELDS['Otros'];
    const tips = RESUME_TIPS[category] || RESUME_TIPS['Otros'];
    const examples = RESUME_EXAMPLES[category] || RESUME_EXAMPLES['Otros'];

    if (loading) {
        return <div className={styles.loading}>Cargando CV...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/dashboard" className={styles.backBtn}>
                    <FiArrowLeft /> Volver
                </Link>
                <h1><FiFileText /> Mi Curriculum Vitae</h1>
            </div>

            <div className={styles.layout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sideSection}>
                        <h3>Categoría</h3>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={styles.selectFull}
                        >
                            {RESUME_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.sideSection}>
                        <h3>Plantilla</h3>
                        <div className={styles.templateOptions}>
                            {Object.values(RESUME_TEMPLATES).map(t => (
                                <label
                                    key={t.id}
                                    className={`${styles.templateOption} ${template === t.id ? styles.active : ''}`}
                                    style={{ '--template-color': t.color }}
                                >
                                    <input
                                        type="radio"
                                        name="template"
                                        value={t.id}
                                        checked={template === t.id}
                                        onChange={() => setTemplate(t.id)}
                                    />
                                    <span className={styles.templateDot}></span>
                                    <span>{t.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sideSection}>
                        <h3>Visibilidad</h3>
                        <button
                            className={`${styles.visibilityBtn} ${isPublic ? styles.public : ''}`}
                            onClick={toggleVisibility}
                            disabled={!hasResume}
                        >
                            {isPublic ? <><FiEye /> Público</> : <><FiEyeOff /> Privado</>}
                        </button>
                        {hasResume && isPublic && (
                            <Link
                                to={`/resume/${user?.id}`}
                                className={styles.viewLink}
                                target="_blank"
                            >
                                Ver CV público →
                            </Link>
                        )}
                        {hasResume && isPublic && (
                            <button
                                onClick={() => {
                                    window.open(`/resume/${user?.id}?print=true`, '_blank');
                                }}
                                className={styles.pdfBtn}
                            >
                                <FiDownload /> Exportar PDF
                            </button>
                        )}
                    </div>

                    {/* Tips */}
                    {showTips && tips && (
                        <div className={styles.sideSection}>
                            <h3>💡 Tips para {category}</h3>
                            <ul className={styles.tipsList}>
                                {tips.slice(0, 3).map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className={styles.sideActions}>
                        {hasResume && (
                            <button onClick={handleDelete} className={styles.deleteBtn}>
                                <FiTrash2 /> Eliminar CV
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Form */}
                <main className={styles.mainContent}>
                    {/* Personal Info */}
                    <section className={styles.formSection}>
                        <h2>Datos Personales</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    value={formData.personalInfo.fullName}
                                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                    placeholder="Ej: Juan Carlos Pérez"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Título/Profesión</label>
                                <input
                                    type="text"
                                    value={formData.personalInfo.title}
                                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                                    placeholder="Ej: Cocinero, Electricista, Vendedor"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.personalInfo.phone}
                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    placeholder="Ej: 2984 123456"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.personalInfo.email}
                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    placeholder="Ej: juan@email.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ubicación</label>
                                <input
                                    type="text"
                                    value={formData.personalInfo.location}
                                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                    placeholder="Ej: General Roca, Río Negro"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Summary */}
                    <section className={styles.formSection}>
                        <h2>Perfil Profesional</h2>
                        <div className={styles.formGroup}>
                            <label>Resumen de tu experiencia y objetivos</label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                placeholder="Describe brevemente tu experiencia, habilidades principales y lo que buscas..."
                                rows={4}
                            />
                        </div>

                        {/* Show example button */}
                        <button
                            className={styles.exampleBtn}
                            onClick={() => setShowExamples(!showExamples)}
                        >
                            {showExamples ? 'Ocultar ejemplos' : `Ver ejemplos de ${category}`}
                        </button>

                        {showExamples && examples && (
                            <div className={styles.examplesBox}>
                                {examples.map((ex, i) => (
                                    <div key={i} className={styles.exampleCard}>
                                        <strong>{ex.title}</strong>
                                        <p>{ex.summary}</p>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, summary: ex.summary }))}
                                            className={styles.useBtn}
                                        >
                                            Usar este ejemplo
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Experience */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Experiencia Laboral</h2>
                            <button onClick={addExperience} className={styles.addBtn}>
                                <FiPlus /> Agregar
                            </button>
                        </div>

                        {formData.experience.map((exp, index) => (
                            <div key={index} className={styles.expCard}>
                                <button
                                    className={styles.removeCardBtn}
                                    onClick={() => removeExperience(index)}
                                >
                                    <FiX />
                                </button>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Puesto</label>
                                        <input
                                            type="text"
                                            value={exp.position}
                                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                            placeholder="Ej: Cocinero, Vendedor"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Empresa</label>
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            placeholder="Nombre de la empresa"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Período</label>
                                        <input
                                            type="text"
                                            value={exp.startDate}
                                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                            placeholder="Ej: 2020 - 2023"
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Descripción de tareas</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                        placeholder="Describe tus responsabilidades y logros..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}

                        {formData.experience.length === 0 && (
                            <p className={styles.emptyText}>
                                Agrega tu experiencia laboral para dar más valor a tu CV
                            </p>
                        )}
                    </section>

                    {/* Education */}
                    <section className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Educación</h2>
                            <button onClick={addEducation} className={styles.addBtn}>
                                <FiPlus /> Agregar
                            </button>
                        </div>

                        {formData.education.map((edu, index) => (
                            <div key={index} className={styles.expCard}>
                                <button
                                    className={styles.removeCardBtn}
                                    onClick={() => removeEducation(index)}
                                >
                                    <FiX />
                                </button>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Institución</label>
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                            placeholder="Nombre de la institución"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Título/Curso</label>
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="Ej: Secundario completo, Técnico en..."
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Año</label>
                                        <input
                                            type="text"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                            placeholder="Ej: 2020"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Skills */}
                    <section className={styles.formSection}>
                        <h2>Habilidades</h2>
                        <div className={styles.skillsContainer}>
                            <div className={styles.skillTagsInput}>
                                {formData.skills.map(skill => (
                                    <span key={skill} className={styles.skillTag}>
                                        {skill}
                                        <button onClick={() => removeSkill(skill)}><FiX /></button>
                                    </span>
                                ))}
                            </div>

                            <p className={styles.suggestedLabel}>Sugeridas para {category}:</p>
                            <div className={styles.suggestedSkills}>
                                {categoryConfig.suggestedSkills
                                    .filter(s => !formData.skills.includes(s))
                                    .slice(0, 8)
                                    .map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => addSkill(skill)}
                                            className={styles.suggestedSkill}
                                        >
                                            + {skill}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className={styles.saveSection}>
                        <button
                            onClick={handleSave}
                            className={styles.saveBtn}
                            disabled={saving}
                        >
                            <FiSave /> {saving ? 'Guardando...' : 'Guardar CV'}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ResumeBuilder;
