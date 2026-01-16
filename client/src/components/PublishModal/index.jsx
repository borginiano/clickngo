import { useState } from 'react';
import { FiX, FiSend, FiTruck, FiMapPin, FiPackage, FiZap, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { publishAPI, BASE_URL } from '../../api';
import toast from 'react-hot-toast';
import styles from './PublishModal.module.css';

// Templates de texto promocional (fallback sin API)
const promoTemplates = [
    (name, price, category) => `🔥 ¡${name} a solo $${price}! 🔥\n\n✅ ${category} de calidad\n📦 Envíos a todo el país\n\n¡No te lo pierdas! 💪`,
    (name, price, category) => `⭐ NUEVO: ${name} ⭐\n\n💰 Precio especial: $${price}\n📍 ${category}\n\n¡Consultá sin compromiso! 📲`,
    (name, price, category) => `🛍️ ${name}\n\n💵 $${price}\n🏷️ ${category}\n\n✨ ¡Hacé tu pedido ahora!\n📬 Retiro o envío disponible`,
    (name, price, category) => `¡Hola! 👋\n\nTenemos ${name} por $${price}\n\n🎯 ${category}\n🚚 Delivery disponible\n\n¡Escribinos! 💬`,
    (name, price, category) => `🌟 OFERTA 🌟\n\n${name}\n💲 ${price}\n\n${category} • Calidad garantizada\n\n¡Contactanos! 📱`,
    (name, price, category) => `📢 DISPONIBLE AHORA 📢\n\n${name}\nPrecio: $${price}\n\n🏪 ${category}\n🛵 Envío y retiro\n\n¡Pedí el tuyo! ✅`,
];

function PublishModal({ product, onClose, onComplete }) {
    const [promoText, setPromoText] = useState('');
    const [deliveryType, setDeliveryType] = useState('BOTH');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('casual');

    // Available AI styles
    const aiStyles = [
        { id: 'casual', label: '😊 Casual', desc: 'Amigable' },
        { id: 'urgent', label: '⚡ Urgente', desc: 'Oferta' },
        { id: 'professional', label: '💼 Pro', desc: 'Elegante' },
        { id: 'funny', label: '😄 Gracioso', desc: 'Humor' },
        { id: 'emotional', label: '❤️ Emotivo', desc: 'Conexión' }
    ];

    const getImageUrl = () => {
        if (!product.images?.length) return null;
        const url = product.images[0];
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    // Generate using template (no API, instant)
    const generateFromTemplate = () => {
        const template = promoTemplates[Math.floor(Math.random() * promoTemplates.length)];
        return template(
            product.name,
            product.price?.toLocaleString(),
            product.category || 'Producto'
        );
    };

    // Handle template generation
    const handleGenerateTemplate = () => {
        const text = generateFromTemplate();
        setPromoText(text);
        toast.success('¡Texto generado!');
    };

    // Handle AI generation with fallback to template
    const handleGenerateAI = async (style = selectedStyle) => {
        setGenerating(true);
        try {
            const { data } = await publishAPI.generateText({
                productName: product.name,
                productDescription: product.description,
                productPrice: product.price,
                productCategory: product.category,
                style: style
            });
            setPromoText(data.text);
            toast.success(`¡Texto ${style} generado con IA!`);
        } catch (error) {
            // Fallback to template if AI fails (quota exhausted, etc)
            console.log('AI failed, falling back to template:', error.response?.data?.error);
            const text = generateFromTemplate();
            setPromoText(text);
            toast('IA no disponible, usamos plantilla', { icon: '📝' });
        } finally {
            setGenerating(false);
        }
    };

    // Share on Facebook (copy text and open FB page)
    const handleShareFacebook = async () => {
        if (!promoText.trim()) {
            toast.error('Primero genera un texto');
            return;
        }

        // Save delivery options first
        try {
            await publishAPI.updateDelivery(product.id, {
                deliveryType,
                deliveryNote
            });
        } catch (error) {
            console.log('Could not save delivery options');
        }

        // Build full post content with image URL
        const imageUrl = getImageUrl();
        const fullPost = `${promoText}\n\n${imageUrl ? '📸 ' + imageUrl : ''}`;

        // Copy to clipboard
        try {
            await navigator.clipboard.writeText(fullPost);
            toast.success('¡Texto e imagen copiados! Pégalo en Facebook');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = fullPost;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            toast.success('¡Texto copiado! Pégalo en Facebook');
        }

        // Open Facebook page to create post
        window.open('https://www.facebook.com/61584957903862', '_blank');

        // Close modal after opening
        onComplete?.();
        onClose();
    };

    const handleSkip = async () => {
        try {
            await publishAPI.updateDelivery(product.id, {
                deliveryType,
                deliveryNote
            });
            toast.success('Opciones guardadas');
            onComplete?.();
            onClose();
        } catch (error) {
            onClose();
        }
    };

    // Share on WhatsApp (opens WhatsApp with pre-filled text)
    const handleShareWhatsApp = async () => {
        if (!promoText.trim()) {
            toast.error('Primero genera un texto');
            return;
        }

        // Save delivery options first
        try {
            await publishAPI.updateDelivery(product.id, {
                deliveryType,
                deliveryNote
            });
        } catch (error) {
            console.log('Could not save delivery options');
        }

        // Build message with text and image link
        const imageUrl = getImageUrl();
        let message = promoText;
        if (imageUrl) {
            message += `\n\n📸 Ver imagen: ${imageUrl}`;
        }

        // Open WhatsApp with message - user can choose to send to ClickNGo group or elsewhere
        // ClickNGo Group: https://chat.whatsapp.com/GpRPJaPAsKX5qvLL78Mw7m
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        toast.success('Abriendo WhatsApp...');

        // Also copy group link to clipboard for easy access
        navigator.clipboard?.writeText('https://chat.whatsapp.com/GpRPJaPAsKX5qvLL78Mw7m');

        // Close modal after opening share
        onComplete?.();
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2><FiSend /> Publicar Producto</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Product Preview */}
                    <div className={styles.productPreview}>
                        {getImageUrl() && (
                            <img src={getImageUrl()} alt={product.name} className={styles.productImage} />
                        )}
                        <div className={styles.productInfo}>
                            <h3>{product.name}</h3>
                            <p>{product.category}</p>
                            <span className={styles.productPrice}>${product.price?.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Text Generation Options */}
                    <div className={styles.section}>
                        <label>Texto promocional</label>

                        {/* Style Selector */}
                        <div className={styles.styleSelector}>
                            {aiStyles.map(s => (
                                <button
                                    key={s.id}
                                    className={`${styles.stylePill} ${selectedStyle === s.id ? styles.activeStyle : ''}`}
                                    onClick={() => setSelectedStyle(s.id)}
                                    title={s.desc}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.buttonRow}>
                            <button
                                className={styles.aiButton}
                                onClick={() => handleGenerateAI(selectedStyle)}
                                disabled={generating}
                                title="Genera texto con inteligencia artificial"
                            >
                                <FiZap />
                                {generating ? 'Generando...' : 'Generar con IA ✨'}
                            </button>
                            <button
                                className={styles.templateButton}
                                onClick={handleGenerateTemplate}
                                title="Usa una plantilla prediseñada"
                            >
                                <FiFileText />
                                Plantilla
                            </button>
                            {promoText && (
                                <button
                                    className={styles.refreshButton}
                                    onClick={handleGenerateTemplate}
                                    title="Generar otra variante"
                                >
                                    <FiRefreshCw />
                                </button>
                            )}
                        </div>
                        <textarea
                            className={styles.textArea}
                            placeholder="Escribe tu texto promocional o usa los botones para generarlo..."
                            value={promoText}
                            onChange={(e) => setPromoText(e.target.value)}
                            maxLength={500}
                        />
                        <span className={styles.charCount}>{promoText.length}/500</span>
                    </div>

                    {/* Delivery Options */}
                    <div className={styles.section}>
                        <label>Opciones de entrega</label>
                        <div className={styles.deliveryGrid}>
                            <button
                                className={`${styles.deliveryOption} ${deliveryType === 'DELIVERY' ? styles.active : ''}`}
                                onClick={() => setDeliveryType('DELIVERY')}
                            >
                                <FiTruck />
                                <span>Delivery</span>
                            </button>
                            <button
                                className={`${styles.deliveryOption} ${deliveryType === 'PICKUP' ? styles.active : ''}`}
                                onClick={() => setDeliveryType('PICKUP')}
                            >
                                <FiMapPin />
                                <span>Retiro</span>
                            </button>
                            <button
                                className={`${styles.deliveryOption} ${deliveryType === 'BOTH' ? styles.active : ''}`}
                                onClick={() => setDeliveryType('BOTH')}
                            >
                                <FiPackage />
                                <span>Ambos</span>
                            </button>
                        </div>
                        <input
                            type="text"
                            className={styles.noteInput}
                            placeholder="Nota adicional (ej: 'Envío gratis mayor a $5000')"
                            value={deliveryNote}
                            onChange={(e) => setDeliveryNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.skipBtn} onClick={handleSkip}>
                        ✅ Publicar en ClickNGo
                    </button>
                    <button
                        className={styles.whatsappBtn}
                        onClick={handleShareWhatsApp}
                        disabled={!promoText.trim()}
                    >
                        <FaWhatsapp />
                        WhatsApp
                    </button>
                    <button
                        className={styles.publishBtn}
                        onClick={handleShareFacebook}
                        disabled={!promoText.trim()}
                    >
                        <FaFacebookF />
                        Facebook
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PublishModal;
