import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { couponAPI } from '../../api';
import { FiPlus, FiTag, FiPercent, FiCalendar, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './MyCoupons.module.css';

function MyCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        description: '',
        minPurchase: '',
        maxUses: '',
        expiresAt: ''
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const { data } = await couponAPI.getMyCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error loading coupons:', error);
            toast.error('Error al cargar cupones');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.discount) {
            toast.error('Código y descuento son requeridos');
            return;
        }

        try {
            await couponAPI.create({
                code: formData.code,
                discount: parseInt(formData.discount),
                description: formData.description || null,
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
                maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                expiresAt: formData.expiresAt || null
            });
            toast.success('¡Cupón creado!');
            setShowForm(false);
            setFormData({ code: '', discount: '', description: '', minPurchase: '', maxUses: '', expiresAt: '' });
            loadCoupons();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear cupón');
        }
    };

    const handleToggle = async (id, active) => {
        try {
            await couponAPI.update(id, { active: !active });
            loadCoupons();
            toast.success(active ? 'Cupón desactivado' : 'Cupón activado');
        } catch (error) {
            toast.error('Error al actualizar cupón');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este cupón?')) return;

        try {
            await couponAPI.delete(id);
            toast.success('Cupón eliminado');
            loadCoupons();
        } catch (error) {
            toast.error('Error al eliminar cupón');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Sin vencimiento';
        return new Date(date).toLocaleDateString('es-AR');
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1><FiTag /> Mis Cupones</h1>
                    <p>Crea descuentos para tus clientes</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
                    {showForm ? <><FiX /> Cancelar</> : <><FiPlus /> Nuevo Cupón</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label>Código *</label>
                            <input
                                type="text"
                                placeholder="VERANO20"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                maxLength={20}
                            />
                            <span className={styles.hint}>Ej: PROMO10, VERANO20</span>
                        </div>
                        <div className={styles.field}>
                            <label>Descuento % *</label>
                            <input
                                type="number"
                                placeholder="10"
                                min="1"
                                max="100"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Descripción</label>
                            <input
                                type="text"
                                placeholder="Descuento de verano"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Compra mínima $</label>
                            <input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={formData.minPurchase}
                                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Usos máximos</label>
                            <input
                                type="number"
                                placeholder="Ilimitado"
                                min="1"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Fecha de expiración</label>
                            <input
                                type="date"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        <FiCheck /> Crear Cupón
                    </button>
                </form>
            )}

            {loading ? (
                <div className={styles.loading}>Cargando cupones...</div>
            ) : coupons.length === 0 ? (
                <div className={styles.empty}>
                    <FiTag size={48} />
                    <h3>No tienes cupones</h3>
                    <p>Crea tu primer cupón para ofrecer descuentos a tus clientes</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {coupons.map((coupon) => (
                        <div key={coupon.id} className={`${styles.couponCard} ${!coupon.active ? styles.inactive : ''}`}>
                            <div className={styles.couponHeader}>
                                <span className={styles.code}>{coupon.code}</span>
                                <span className={styles.discount}>-{coupon.discount}%</span>
                            </div>
                            {coupon.description && (
                                <p className={styles.description}>{coupon.description}</p>
                            )}
                            <div className={styles.couponMeta}>
                                {coupon.minPurchase && (
                                    <span>Min: ${coupon.minPurchase.toLocaleString()}</span>
                                )}
                                <span>Usos: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}</span>
                                <span><FiCalendar /> {formatDate(coupon.expiresAt)}</span>
                            </div>
                            <div className={styles.couponActions}>
                                <button
                                    onClick={() => handleToggle(coupon.id, coupon.active)}
                                    className={coupon.active ? styles.deactivateBtn : styles.activateBtn}
                                >
                                    {coupon.active ? 'Desactivar' : 'Activar'}
                                </button>
                                <button onClick={() => handleDelete(coupon.id)} className={styles.deleteBtn}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCoupons;
