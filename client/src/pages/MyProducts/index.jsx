import { useState, useEffect } from 'react';
import { productAPI, publishAPI, BASE_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiPackage, FiAlertCircle, FiZap, FiFileText, FiTruck, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard';
import ImageUpload from '../../components/ImageUpload';
import { VENDOR_CATEGORIES } from '../../data/categories';
import styles from './MyProducts.module.css';

// Templates de texto promocional (fallback sin API)
const promoTemplates = [
    (name, price, category) => `🔥 ¡${name} a solo $${price}! 🔥\n\n✅ ${category} de calidad\n📦 Envíos a todo el país\n\n¡No te lo pierdas! 💪`,
    (name, price, category) => `⭐ NUEVO: ${name} ⭐\n\n💰 Precio especial: $${price}\n📍 ${category}\n\n¡Consultá sin compromiso! 📲`,
    (name, price, category) => `🛍️ ${name}\n\n💵 $${price}\n🏷️ ${category}\n\n✨ ¡Hacé tu pedido ahora!\n📬 Retiro o envío disponible`,
    (name, price, category) => `¡Hola! 👋\n\nTenemos ${name} por $${price}\n\n🎯 ${category}\n🚚 Delivery disponible\n\n¡Escribinos! 💬`,
    (name, price, category) => `📢 DISPONIBLE AHORA 📢\n\n${name}\nPrecio: $${price}\n\n🏪 ${category}\n🛵 Envío y retiro\n\n¡Pedí el tuyo! ✅`,
];

function MyProducts() {
    const { isPremium } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productData, setProductData] = useState({});
    const [canAddMore, setCanAddMore] = useState(true);
    const [productLimit, setProductLimit] = useState(5);

    // AI generation states
    const [generating, setGenerating] = useState(false);

    // Delivery and share states (integrated from PublishModal)
    const [deliveryType, setDeliveryType] = useState('BOTH');
    const [savedProduct, setSavedProduct] = useState(null); // for share options after save

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const { data } = await productAPI.getMine();
            setProducts(data.products);
            setCanAddMore(data.canAddMore);
            setProductLimit(data.limit);
        } catch (error) {
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        if (!canAddMore) {
            toast.error(`Has alcanzado el límite de ${productLimit} productos. Actualiza a Premium.`);
            return;
        }
        setEditingProduct(null);
        setProductData({ name: '', description: '', price: '', category: '', images: [] });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setProductData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category,
            images: product.images || []
        });
        setDeliveryType(product.deliveryType || 'BOTH');
        setShowModal(true);
    };

    // Generate from template (instant, no API)
    const generateFromTemplate = () => {
        const template = promoTemplates[Math.floor(Math.random() * promoTemplates.length)];
        return template(
            productData.name || 'Producto',
            productData.price || '0',
            productData.category || 'Producto'
        );
    };

    // Handle AI generation - uses description + image as reference
    const handleGenerateAI = async () => {
        if (!productData.name && !productData.description) {
            toast.error('Primero ingresa un nombre o descripción');
            return;
        }

        setGenerating(true);
        try {
            const { data } = await publishAPI.generateText({
                productName: productData.name,
                productDescription: productData.description,
                productPrice: productData.price,
                productCategory: productData.category,
                productImage: productData.images?.[0], // Reference image
                style: 'casual'
            });
            setProductData({ ...productData, description: data.text });
            toast.success('¡Descripción mejorada con IA! ✨');
        } catch (error) {
            // Fallback to template if AI fails
            console.log('AI failed, using template:', error.response?.data?.error);
            const text = generateFromTemplate();
            setProductData({ ...productData, description: text });
            toast('IA no disponible, usamos plantilla', { icon: '📝' });
        } finally {
            setGenerating(false);
        }
    };

    // Handle template generation
    const handleGenerateTemplate = () => {
        const text = generateFromTemplate();
        setProductData({ ...productData, description: text });
        toast.success('¡Plantilla aplicada!');
    };

    // Get image URL for sharing
    const getImageUrl = (images) => {
        if (!images?.length) return null;
        const url = images[0];
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    // Share on WhatsApp
    const handleShareWhatsApp = () => {
        if (!savedProduct) return;

        const imageUrl = getImageUrl(savedProduct.images);
        let message = savedProduct.description || savedProduct.name;
        if (imageUrl) {
            message += `\n\n📸 Ver imagen: ${imageUrl}`;
        }

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        toast.success('Abriendo WhatsApp...');
        setSavedProduct(null);
    };

    // Share on Facebook
    const handleShareFacebook = async () => {
        if (!savedProduct) return;

        const imageUrl = getImageUrl(savedProduct.images);
        const fullPost = `${savedProduct.description || savedProduct.name}\n\n${imageUrl ? '📸 ' + imageUrl : ''}`;

        try {
            await navigator.clipboard.writeText(fullPost);
            toast.success('¡Texto copiado! Pégalo en Facebook');
        } catch (err) {
            toast.error('No se pudo copiar');
        }

        window.open('https://www.facebook.com/61584957903862', '_blank');
        setSavedProduct(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...productData,
                price: parseFloat(productData.price),
                deliveryType
            };

            if (editingProduct) {
                await productAPI.update(editingProduct.id, dataToSend);
                toast.success('Producto actualizado');
                setShowModal(false);
                loadProducts();
            } else {
                const { data } = await productAPI.create(dataToSend);
                toast.success('¡Producto creado! 🎉');
                // Show share options inline
                setSavedProduct(data);
                setShowModal(false);
                loadProducts();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar');
        }
    };

    const handleDelete = async (product) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await productAPI.delete(product.id);
            toast.success('Producto eliminado');
            loadProducts();
        } catch (error) {
            toast.error('Error al eliminar producto');
        }
    };

    if (loading) return <div className="loading-page">Cargando productos...</div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1><FiPackage /> Mis Productos</h1>
                {!isPremium && (
                    <div className={styles.limitInfo}>
                        <span>{products.length} / {productLimit} productos</span>
                        {!canAddMore && (
                            <a href="/premium" className={styles.upgradeLink}>
                                <FiAlertCircle /> Actualizar a Premium
                            </a>
                        )}
                    </div>
                )}
            </div>

            <button className={styles.addBtn} onClick={openAddModal} disabled={!canAddMore}>
                <FiPlus /> Agregar Producto
            </button>

            {products.length > 0 ? (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            editable
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <FiPackage />
                    <p>Aún no tienes productos</p>
                    <button onClick={openAddModal}>Agregar tu primer producto</button>
                </div>
            )}

            {/* Share Options Panel - appears after creating product */}
            {savedProduct && (
                <div className={styles.sharePanel}>
                    <div className={styles.sharePanelContent}>
                        <h3>✅ ¡Producto creado!</h3>
                        <p>Compartir "{savedProduct.name}" en:</p>
                        <div className={styles.shareButtons}>
                            <button className={styles.whatsappBtn} onClick={handleShareWhatsApp}>
                                <FaWhatsapp /> WhatsApp
                            </button>
                            <button className={styles.facebookBtn} onClick={handleShareFacebook}>
                                <FaFacebookF /> Facebook
                            </button>
                        </div>
                        <button className={styles.closeShareBtn} onClick={() => setSavedProduct(null)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label>Imágenes (hasta 3)</label>
                                <ImageUpload
                                    value={productData.images}
                                    onChange={(images) => setProductData({ ...productData, images })}
                                    maxFiles={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={productData.name}
                                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Categoría *</label>
                                <select
                                    value={productData.category}
                                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    {VENDOR_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Precio *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={productData.price}
                                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Enhanced Description with AI */}
                            <div className={styles.formGroup}>
                                <label>Descripción</label>
                                <div className={styles.descriptionActions}>
                                    <button
                                        type="button"
                                        className={styles.aiBtn}
                                        onClick={handleGenerateAI}
                                        disabled={generating}
                                        title="La IA usa tu texto e imagen como referencia"
                                    >
                                        <FiZap />
                                        {generating ? 'Generando...' : 'Mejorar con IA ✨'}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.templateBtn}
                                        onClick={handleGenerateTemplate}
                                        title="Aplicar plantilla promocional"
                                    >
                                        <FiFileText /> Plantilla
                                    </button>
                                    {productData.description && (
                                        <button
                                            type="button"
                                            className={styles.refreshBtn}
                                            onClick={handleGenerateTemplate}
                                            title="Generar otra variante"
                                        >
                                            <FiRefreshCw />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={productData.description}
                                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                    rows={4}
                                    placeholder="Describe tu producto brevemente, luego usa 'Mejorar con IA' para crear un texto publicitario..."
                                    maxLength={500}
                                />
                                <span className={styles.charCount}>{productData.description?.length || 0}/500</span>
                            </div>

                            {/* Delivery Options */}
                            <div className={styles.formGroup}>
                                <label>Opciones de entrega</label>
                                <div className={styles.deliveryGrid}>
                                    <button
                                        type="button"
                                        className={`${styles.deliveryOption} ${deliveryType === 'DELIVERY' ? styles.active : ''}`}
                                        onClick={() => setDeliveryType('DELIVERY')}
                                    >
                                        <FiTruck /> Delivery
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.deliveryOption} ${deliveryType === 'PICKUP' ? styles.active : ''}`}
                                        onClick={() => setDeliveryType('PICKUP')}
                                    >
                                        <FiMapPin /> Retiro
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.deliveryOption} ${deliveryType === 'BOTH' ? styles.active : ''}`}
                                        onClick={() => setDeliveryType('BOTH')}
                                    >
                                        <FiPackage /> Ambos
                                    </button>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    {editingProduct ? 'Actualizar' : 'Crear y Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyProducts;
