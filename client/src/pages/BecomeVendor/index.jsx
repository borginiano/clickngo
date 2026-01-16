import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiMapPin, FiInfo, FiArrowRight, FiHome, FiTruck } from 'react-icons/fi';
import { countries, getProvincesByCountry, getCitiesByProvince } from '../../data/locations';
import { VENDOR_CATEGORIES } from '../../data/categories';
import styles from './BecomeVendor.module.css';

function BecomeVendor() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        category: '',
        locationType: 'CITY',
        country: 'AR',
        province: '',
        city: '',
        address: '',
        latitude: null,
        longitude: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Reset dependent fields when parent changes
        if (name === 'country') {
            setFormData({ ...formData, country: value, province: '', city: '' });
        } else if (name === 'province') {
            setFormData({ ...formData, province: value, city: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    toast.success('Ubicación obtenida');
                },
                () => toast.error('No se pudo obtener la ubicación')
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.businessName || !formData.category) {
            toast.error('Nombre del negocio y categoría son requeridos');
            return;
        }
        if (formData.locationType === 'CITY' && (!formData.province || !formData.city)) {
            toast.error('Selecciona tu provincia y ciudad');
            return;
        }
        if (formData.locationType === 'EXACT' && !formData.address) {
            toast.error('Ingresa la dirección de tu local');
            return;
        }

        setLoading(true);
        try {
            // Build city string with province for context
            const cityString = formData.locationType === 'CITY'
                ? `${formData.city}, ${formData.province}`
                : formData.city;

            await vendorAPI.become({
                ...formData,
                city: cityString
            });
            updateUser({ role: 'VENDOR' });
            toast.success('¡Perfil de vendedor creado!');
            navigate('/my-products');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear perfil');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role === 'VENDOR') {
        return (
            <div className={styles.alreadyVendor}>
                <h2>Ya eres vendedor</h2>
                <button onClick={() => navigate('/my-products')}>Ir a Mis Productos</button>
            </div>
        );
    }

    const availableProvinces = getProvincesByCountry(formData.country);
    const availableCities = getCitiesByProvince(formData.province);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <FiShoppingBag className={styles.headerIcon} />
                    <h1>Convertirte en Vendedor</h1>
                    <p>Muestra tus productos a miles de personas cerca de ti</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nombre del negocio *</label>
                        <input
                            type="text"
                            name="businessName"
                            placeholder="Ej: Empanadas de María"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Categoría *</label>
                        <select name="category" value={formData.category} onChange={handleChange} required>
                            <option value="">Seleccionar categoría</option>
                            {VENDOR_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            placeholder="Cuéntanos sobre tu negocio..."
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    {/* Location Type Selector */}
                    <div className={styles.formGroup}>
                        <label>Tipo de ubicación *</label>
                        <div className={styles.locationTypeGrid}>
                            <button
                                type="button"
                                className={`${styles.locationTypeBtn} ${formData.locationType === 'CITY' ? styles.active : ''}`}
                                onClick={() => setFormData({ ...formData, locationType: 'CITY', address: '', latitude: null, longitude: null })}
                            >
                                <FiTruck />
                                <span>Ambulante / Ferias</span>
                                <small>Solo muestra tu ciudad</small>
                            </button>
                            <button
                                type="button"
                                className={`${styles.locationTypeBtn} ${formData.locationType === 'EXACT' ? styles.active : ''}`}
                                onClick={() => setFormData({ ...formData, locationType: 'EXACT' })}
                            >
                                <FiHome />
                                <span>Tienda Fija</span>
                                <small>Muestra dirección exacta</small>
                            </button>
                        </div>
                    </div>

                    {/* Country Selector */}
                    <div className={styles.formGroup}>
                        <label>País *</label>
                        <select name="country" value={formData.country} onChange={handleChange} required>
                            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Province Selector */}
                    <div className={styles.formGroup}>
                        <label>Provincia / Departamento *</label>
                        <select name="province" value={formData.province} onChange={handleChange} required>
                            <option value="">Seleccionar provincia</option>
                            {availableProvinces.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* City Selector */}
                    {formData.province && (
                        <div className={styles.formGroup}>
                            <label>Ciudad *</label>
                            <select name="city" value={formData.city} onChange={handleChange} required>
                                <option value="">Seleccionar ciudad</option>
                                {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Exact Address (only for fixed stores) */}
                    {formData.locationType === 'EXACT' && (
                        <div className={styles.formGroup}>
                            <label>Dirección del local *</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Ej: Av. Corrientes 1234"
                                value={formData.address}
                                onChange={handleChange}
                            />
                            <button type="button" className={styles.locationBtn} onClick={getLocation}>
                                <FiMapPin /> Obtener ubicación GPS
                            </button>
                            {formData.latitude && <span className={styles.locationSuccess}>✓ Ubicación GPS guardada</span>}
                        </div>
                    )}

                    <div className={styles.infoBox}>
                        <FiInfo />
                        <p>
                            {formData.locationType === 'CITY'
                                ? 'Tu dirección personal NO será visible. Solo se mostrará la ciudad.'
                                : 'La dirección de tu local será visible para que los clientes te encuentren.'
                            }
                        </p>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creando perfil...' : <><span>Comenzar a Vender</span> <FiArrowRight /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BecomeVendor;
