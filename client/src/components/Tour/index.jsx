import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiX, FiArrowRight, FiArrowLeft, FiCheck, FiHelpCircle } from 'react-icons/fi';
import styles from './Tour.module.css';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: '¡Bienvenido a ClickNGo! 🎉',
        description: 'Te vamos a mostrar las funciones principales del sitio. Este recorrido dura menos de 1 minuto.',
        position: 'center',
        path: '/'
    },
    {
        id: 'home',
        title: '🏠 Página Principal',
        description: 'Aquí encontrarás productos destacados, tiendas cerca de vos y acceso rápido a todas las secciones.',
        position: 'center',
        path: '/'
    },
    {
        id: 'fairs',
        title: '🎪 Ferias y Eventos',
        description: 'Encuentra ferias cerca de ti. Mira los horarios, ubicación y stands disponibles de cada feria.',
        position: 'center',
        path: '/fairs'
    },
    {
        id: 'classifieds',
        title: '📋 Clasificados',
        description: 'Publica o busca anuncios clasificados: empleos, servicios, compra-venta y mucho más.',
        position: 'center',
        path: '/classifieds'
    },
    {
        id: 'faq',
        title: '❓ Preguntas Frecuentes',
        description: 'Si tenés dudas, consultá las preguntas frecuentes. Ahí encontrarás respuestas a las consultas más comunes.',
        position: 'center',
        path: '/faq'
    },
    {
        id: 'become-vendor',
        title: '🚀 ¿Querés vender?',
        description: 'Si tenés productos o servicios para ofrecer, podés convertirte en vendedor y crear tu propia tienda online.',
        position: 'center',
        path: '/become-vendor'
    },
    {
        id: 'premium',
        title: '⭐ Premium',
        description: 'Con Premium obtenés beneficios exclusivos: destacar productos, más visibilidad y monedas extra.',
        position: 'center',
        path: '/premium'
    },
    {
        id: 'finish',
        title: '¡Listo! 🎊',
        description: 'Ya conocés las funciones principales. Podés repetir este recorrido cuando quieras desde el botón "Recorrido" en el footer.',
        position: 'center',
        path: '/'
    }
];

function Tour({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const step = TOUR_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    useEffect(() => {
        // Navigate to the step's path if needed
        if (step.path && location.pathname !== step.path) {
            navigate(step.path);
        }
    }, [currentStep, step.path, location.pathname, navigate]);

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('tourCompleted', 'true');
        setIsVisible(false);
        navigate('/');
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Progress */}
                <div className={styles.progress}>
                    {TOUR_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.progressDot} ${index <= currentStep ? styles.active : ''}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {!isFirstStep && !isLastStep && (
                        <button onClick={handleSkip} className={styles.skipBtn}>
                            Saltar tour
                        </button>
                    )}

                    <div className={styles.navButtons}>
                        {!isFirstStep && (
                            <button onClick={handlePrev} className={styles.prevBtn}>
                                <FiArrowLeft /> Anterior
                            </button>
                        )}
                        <button onClick={handleNext} className={styles.nextBtn}>
                            {isLastStep ? (
                                <>
                                    <FiCheck /> Finalizar
                                </>
                            ) : (
                                <>
                                    {isFirstStep ? 'Comenzar' : 'Siguiente'} <FiArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Step counter */}
                <div className={styles.stepCounter}>
                    {currentStep + 1} / {TOUR_STEPS.length}
                </div>
            </div>
        </div>
    );
}

// Button to restart tour
export function TourButton() {
    const [showTour, setShowTour] = useState(false);

    const handleStartTour = () => {
        localStorage.removeItem('tourCompleted');
        setShowTour(true);
    };

    return (
        <>
            <button onClick={handleStartTour} className={styles.tourButton} title="Recorrido guiado">
                <FiHelpCircle /> Recorrido
            </button>
            {showTour && <Tour onComplete={() => setShowTour(false)} />}
        </>
    );
}

// Hook to check if tour should auto-show
export function useTour() {
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const tourCompleted = localStorage.getItem('tourCompleted');
        if (!tourCompleted) {
            // Small delay to let the page load first
            const timer = setTimeout(() => setShowTour(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    return { showTour, setShowTour };
}

export default Tour;
