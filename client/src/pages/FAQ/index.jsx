import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiHelpCircle, FiArrowLeft } from 'react-icons/fi';
import { FaFacebookMessenger } from 'react-icons/fa';
import styles from './FAQ.module.css';

const FAQ_DATA = [
    {
        category: '🛒 Compradores',
        questions: [
            {
                q: '¿Cómo encuentro vendedores cerca de mi ubicación?',
                a: 'En la página principal, hacé click en "Mi ubicación" para activar la geolocalización. Automáticamente te mostraremos los vendedores más cercanos a vos.'
            },
            {
                q: '¿Cómo contacto a un vendedor?',
                a: 'Podés contactar al vendedor de 3 formas: 1) WhatsApp directo desde el producto, 2) Chat interno de la app, o 3) Visitando su tienda física si tiene dirección.'
            },
            {
                q: '¿Los precios incluyen envío?',
                a: 'Depende de cada vendedor. En la página del producto podés ver si ofrece Delivery, Retiro en local, o ambos. Consultá con el vendedor para costos de envío.'
            },
            {
                q: '¿Puedo guardar productos para verlos después?',
                a: '¡Sí! Hacé click en el corazón ❤️ en cualquier producto para agregarlo a tus Favoritos. Los encontrarás en "Mis Favoritos" desde el menú.'
            },
            {
                q: '¿Cómo dejo una reseña de un producto?',
                a: 'Entrá al detalle del producto y bajá hasta la sección "Reseñas". Ahí podés calificar con estrellas y dejar un comentario opcional.'
            }
        ]
    },
    {
        category: '🏪 Vendedores',
        questions: [
            {
                q: '¿Cómo me registro como vendedor?',
                a: 'Hacé click en "Convertite en Vendedor" desde la página principal o desde Mi Cuenta. Completá los datos de tu negocio y ¡listo! Podés empezar a cargar productos.'
            },
            {
                q: '¿Cuánto cuesta publicar productos?',
                a: 'ClickNGo es GRATIS para empezar. Podés publicar productos sin costo. Los planes Premium ofrecen beneficios extra como mayor visibilidad y más productos.'
            },
            {
                q: '¿Cómo subo fotos de mis productos?',
                a: 'Al crear o editar un producto, hacé click en el área de imagen para subir fotos desde tu dispositivo. Podés subir múltiples imágenes por producto.'
            },
            {
                q: '¿Qué pasa si pongo precio $0?',
                a: 'Podés publicar productos gratuitos o servicios "a consultar" con precio $0. El producto se mostrará como "Gratis" o "Consultar precio".'
            },
            {
                q: '¿Cómo genero más ventas?',
                a: 'Tips: 1) Subí fotos de calidad, 2) Escribí descripciones detalladas, 3) Respondé rápido a consultas, 4) Compartí tus productos en redes sociales, 5) Pedí reseñas a clientes satisfechos.'
            }
        ]
    },
    {
        category: '💳 Pagos y Premium',
        questions: [
            {
                q: '¿Qué beneficios tiene Premium?',
                a: 'Con Premium tenés: Mayor cantidad de productos, Mejor posición en búsquedas, Badge verificado, Estadísticas avanzadas, Cupones de descuento, y Soporte prioritario.'
            },
            {
                q: '¿Cómo pago la suscripción Premium?',
                a: 'Actualmente aceptamos MercadoPago y transferencias bancarias. Entrá a la sección Premium para ver los planes y opciones de pago.'
            },
            {
                q: '¿Puedo cancelar Premium cuando quiera?',
                a: 'Sí, podés cancelar en cualquier momento. Tu cuenta vuelve al plan gratuito al finalizar el período pagado.'
            }
        ]
    },
    {
        category: '🔧 Cuenta y Soporte',
        questions: [
            {
                q: '¿Cómo cambio mi contraseña?',
                a: 'Entrá a Mi Cuenta > Configuración > Cambiar contraseña. Si olvidaste tu contraseña, usá "Olvidé mi contraseña" en el login.'
            },
            {
                q: '¿Cómo elimino mi cuenta?',
                a: 'Contactanos por Messenger de nuestra página de Facebook y procesaremos tu solicitud. Recordá que perderás todos tus datos y publicaciones.'
            },
            {
                q: '¿Cómo reporto un problema o vendedor?',
                a: 'Desde el perfil del vendedor o producto, usá el botón de reportar. También podés contactarnos por Messenger de Facebook.'
            },
            {
                q: '¿Tienen app móvil?',
                a: 'Actualmente ClickNGo está disponible como sitio web optimizado para móviles. Podés acceder desde cualquier navegador en tu celular.'
            }
        ]
    }
];

function FAQ() {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const isOpen = (categoryIndex, questionIndex) => {
        return openItems[`${categoryIndex}-${questionIndex}`];
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link to="/" className={styles.backLink}>
                    <FiArrowLeft /> Volver
                </Link>
            </div>

            <div className={styles.hero}>
                <FiHelpCircle className={styles.heroIcon} />
                <h1>Preguntas Frecuentes</h1>
                <p>Encontrá respuestas a las consultas más comunes</p>
            </div>

            <div className={styles.content}>
                {FAQ_DATA.map((category, catIndex) => (
                    <div key={catIndex} className={styles.category}>
                        <h2 className={styles.categoryTitle}>{category.category}</h2>
                        <div className={styles.questions}>
                            {category.questions.map((item, qIndex) => (
                                <div
                                    key={qIndex}
                                    className={`${styles.questionItem} ${isOpen(catIndex, qIndex) ? styles.open : ''}`}
                                >
                                    <button
                                        className={styles.questionBtn}
                                        onClick={() => toggleItem(catIndex, qIndex)}
                                    >
                                        <span>{item.q}</span>
                                        {isOpen(catIndex, qIndex) ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                    {isOpen(catIndex, qIndex) && (
                                        <div className={styles.answer}>
                                            <p>{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.contactSection}>
                <h3>¿No encontraste lo que buscabas?</h3>
                <p>Escribinos y te respondemos a la brevedad</p>
                <a href="https://m.me/61584957903862" target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
                    <FaFacebookMessenger /> Escribinos por Messenger
                </a>
            </div>
        </div>
    );
}

export default FAQ;
