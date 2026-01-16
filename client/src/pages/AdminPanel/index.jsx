import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiFileText, FiTrendingUp, FiTrash2, FiCheck, FiX, FiSearch, FiShield, FiCalendar, FiPlus, FiEdit2, FiMapPin, FiExternalLink, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, fairAPI, vendorAPI } from '../../api';
import { countries, provinces, cities } from '../../data/locations';
import toast from 'react-hot-toast';
import styles from './AdminPanel.module.css';

function AdminPanel() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);

    // Dashboard stats
    const [stats, setStats] = useState(null);

    // Users
    const [users, setUsers] = useState([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState('');

    // Vendors
    const [vendors, setVendors] = useState([]);
    const [vendorsTotal, setVendorsTotal] = useState(0);
    const [vendorsPage, setVendorsPage] = useState(1);

    // Products
    const [products, setProducts] = useState([]);
    const [productsTotal, setProductsTotal] = useState(0);
    const [productsPage, setProductsPage] = useState(1);

    // Classifieds
    const [classifieds, setClassifieds] = useState([]);
    const [classifiedsTotal, setClassifiedsTotal] = useState(0);
    const [classifiedsPage, setClassifiedsPage] = useState(1);

    // Fairs
    const [fairs, setFairs] = useState([]);
    const [selectedFair, setSelectedFair] = useState(null);
    const [showFairModal, setShowFairModal] = useState(false);
    const [fairForm, setFairForm] = useState({
        name: '', description: '', address: '', country: 'AR', province: '', city: '',
        mapsUrl: '', startDate: '', endDate: '',
        openDays: [], openTime: '09:00', closeTime: '18:00',
        recurring: '', image: '', capacity: '', contactPhone: '', contactEmail: ''
    });
    const [showStandModal, setShowStandModal] = useState(false);
    const [standForm, setStandForm] = useState({ standNumber: '', vendorId: '', category: '', description: '', price: '' });
    const [selectedStandVendor, setSelectedStandVendor] = useState(null);
    const [allVendors, setAllVendors] = useState([]);

    const WEEKDAYS = [
        { key: 'MON', label: 'Lun' },
        { key: 'TUE', label: 'Mar' },
        { key: 'WED', label: 'Mié' },
        { key: 'THU', label: 'Jue' },
        { key: 'FRI', label: 'Vie' },
        { key: 'SAT', label: 'Sáb' },
        { key: 'SUN', label: 'Dom' }
    ];



    const loadTabData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'dashboard': {
                    const { data: statsData } = await adminAPI.getStats();
                    setStats(statsData);
                    break;
                }
                case 'users': {
                    const { data: usersData } = await adminAPI.getUsers({ page: usersPage, search: usersSearch });
                    setUsers(usersData.users);
                    setUsersTotal(usersData.total);
                    break;
                }
                case 'vendors': {
                    const { data: vendorsData } = await adminAPI.getVendors({ page: vendorsPage });
                    setVendors(vendorsData.vendors);
                    setVendorsTotal(vendorsData.total);
                    break;
                }
                case 'products': {
                    const { data: productsData } = await adminAPI.getProducts({ page: productsPage });
                    setProducts(productsData.products);
                    setProductsTotal(productsData.total);
                    break;
                }
                case 'classifieds': {
                    const { data: classifiedsData } = await adminAPI.getClassifieds({ page: classifiedsPage });
                    setClassifieds(classifiedsData.classifieds);
                    setClassifiedsTotal(classifiedsData.total);
                    break;
                }
                case 'fairs': {
                    const { data: fairsData } = await fairAPI.getAll({ all: 'true' });
                    setFairs(fairsData);
                    const { data: vendorsData2 } = await vendorAPI.getAll();
                    setAllVendors(vendorsData2);
                    break;
                }
            }
        } catch (error) {
            toast.error('Error al cargar datos');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadTabData();
        }
    }, [activeTab, usersPage, vendorsPage, productsPage, classifiedsPage, user]);

    const handleSearchUsers = (e) => {
        e.preventDefault();
        setUsersPage(1);
        loadTabData();
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            await adminAPI.updateUser(userId, { role: newRole });
            toast.success('Rol actualizado');
            loadTabData();
        } catch (error) {
            toast.error('Error al actualizar rol');
        }
    };

    const handleUpdateUserSubscription = async (userId, subscription) => {
        try {
            await adminAPI.updateUser(userId, { subscription });
            toast.success('Suscripción actualizada');
            loadTabData();
        } catch (error) {
            toast.error('Error al actualizar suscripción');
        }
    };

    const handleToggleVerify = async (vendorId) => {
        try {
            await adminAPI.toggleVerify(vendorId);
            toast.success('Verificación actualizada');
            loadTabData();
        } catch (error) {
            toast.error('Error al verificar');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await adminAPI.deleteProduct(productId);
            toast.success('Producto eliminado');
            loadTabData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleDeleteClassified = async (classifiedId) => {
        if (!confirm('¿Eliminar este clasificado?')) return;
        try {
            await adminAPI.deleteClassified(classifiedId);
            toast.success('Clasificado eliminado');
            loadTabData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // Fair handlers
    const handleOpenFairModal = (fair = null) => {
        if (fair) {
            setFairForm({
                name: fair.name || '', description: fair.description || '',
                address: fair.address || '', country: fair.country || 'AR',
                province: fair.province || '', city: fair.city || '',
                mapsUrl: fair.mapsUrl || '',
                startDate: fair.startDate ? new Date(fair.startDate).toISOString().slice(0, 10) : '',
                endDate: fair.endDate ? new Date(fair.endDate).toISOString().slice(0, 10) : '',
                openDays: fair.openDays || [], openTime: fair.openTime || '09:00',
                closeTime: fair.closeTime || '18:00', recurring: fair.recurring || '',
                image: fair.image || '', capacity: fair.capacity || '',
                contactPhone: fair.contactPhone || '', contactEmail: fair.contactEmail || ''
            });
            setSelectedFair(fair);
        } else {
            setFairForm({
                name: '', description: '', address: '', country: 'AR', province: '', city: '',
                mapsUrl: '', startDate: '', endDate: '',
                openDays: [], openTime: '09:00', closeTime: '18:00',
                recurring: '', image: '', capacity: '', contactPhone: '', contactEmail: ''
            });
            setSelectedFair(null);
        }
        setShowFairModal(true);
    };

    const toggleOpenDay = (day) => {
        const current = fairForm.openDays || [];
        if (current.includes(day)) {
            setFairForm({ ...fairForm, openDays: current.filter(d => d !== day) });
        } else {
            setFairForm({ ...fairForm, openDays: [...current, day] });
        }
    };

    const openGoogleMapsSelector = () => {
        const searchQuery = encodeURIComponent(`${fairForm.address}, ${fairForm.city}, ${fairForm.province}`);
        window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
    };

    const handleSaveFair = async () => {
        try {
            if (selectedFair) {
                await fairAPI.update(selectedFair.id, fairForm);
                toast.success('Feria actualizada');
            } else {
                await fairAPI.create(fairForm);
                toast.success('Feria creada');
            }
            setShowFairModal(false);
            loadTabData();
        } catch (error) {
            toast.error('Error al guardar feria');
        }
    };

    const handleDeleteFair = async (fairId) => {
        if (!confirm('¿Eliminar esta feria y todos sus stands?')) return;
        try {
            await fairAPI.delete(fairId);
            toast.success('Feria eliminada');
            loadTabData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleToggleFairActive = async (fair) => {
        try {
            await fairAPI.update(fair.id, { active: !fair.active });
            toast.success(fair.active ? 'Feria desactivada' : 'Feria activada');
            loadTabData();
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleOpenStandModal = (fair) => {
        setSelectedFair(fair);
        setStandForm({ standNumber: '', vendorId: '', category: '', description: '', price: '' });
        setSelectedStandVendor(null);
        setShowStandModal(true);
    };

    const handleSelectStandVendor = (vendorId) => {
        if (vendorId) {
            const vendor = allVendors.find(v => v.id === vendorId);
            if (vendor) {
                setSelectedStandVendor(vendor);
                setStandForm(prev => ({
                    ...prev,
                    vendorId,
                    category: vendor.category || ''
                }));
            }
        } else {
            setSelectedStandVendor(null);
            setStandForm(prev => ({ ...prev, vendorId: '', category: '' }));
        }
    };

    const handleCreateStand = async () => {
        try {
            await fairAPI.createStand(selectedFair.id, standForm);
            toast.success('Stand creado');
            setShowStandModal(false);
            loadTabData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear stand');
        }
    };

    const handleAssignVendor = async (fairId, standId, vendorId) => {
        try {
            await fairAPI.assignVendor(fairId, standId, vendorId || null);
            toast.success(vendorId ? 'Vendedor asignado' : 'Stand liberado');
            loadTabData();
        } catch (error) {
            toast.error('Error al asignar vendedor');
        }
    };

    const handleDeleteStand = async (fairId, standId) => {
        if (!confirm('¿Eliminar este stand?')) return;
        try {
            await fairAPI.deleteStand(fairId, standId);
            toast.success('Stand eliminado');
            loadTabData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: FiTrendingUp },
        { id: 'users', label: 'Usuarios', icon: FiUsers },
        { id: 'vendors', label: 'Vendedores', icon: FiShield },
        { id: 'products', label: 'Productos', icon: FiShoppingBag },
        { id: 'classifieds', label: 'Clasificados', icon: FiFileText },
        { id: 'fairs', label: 'Ferias', icon: FiCalendar }
    ];

    // Check admin access
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>🛡️ Panel de Administración</h1>
            </div>

            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Cargando...</div>
                ) : (
                    <>
                        {/* Dashboard */}
                        {activeTab === 'dashboard' && stats && (
                            <div className={styles.dashboard}>
                                <div className={styles.statCard}>
                                    <FiUsers className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalUsers}</span>
                                        <span className={styles.statLabel}>Total Usuarios</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <FiShield className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalVendors}</span>
                                        <span className={styles.statLabel}>Vendedores</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <FiShoppingBag className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalProducts}</span>
                                        <span className={styles.statLabel}>Productos</span>
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <FiFileText className={styles.statIcon} />
                                    <div className={styles.statInfo}>
                                        <span className={styles.statValue}>{stats.totalClassifieds}</span>
                                        <span className={styles.statLabel}>Clasificados</span>
                                    </div>
                                </div>
                                <div className={styles.statCard + ' ' + styles.premium}>
                                    <span className={styles.statValue}>{stats.premiumUsers}</span>
                                    <span className={styles.statLabel}>Usuarios Premium</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>{stats.newUsersThisWeek}</span>
                                    <span className={styles.statLabel}>Nuevos esta semana</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>{stats.verifiedVendors}</span>
                                    <span className={styles.statLabel}>Vendedores verificados</span>
                                </div>
                            </div>
                        )}

                        {/* Users */}
                        {activeTab === 'users' && (
                            <div className={styles.section}>
                                <form onSubmit={handleSearchUsers} className={styles.searchForm}>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o email..."
                                        value={usersSearch}
                                        onChange={(e) => setUsersSearch(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                    <button type="submit" className={styles.searchBtn}>
                                        <FiSearch />
                                    </button>
                                </form>
                                <p className={styles.total}>{usersTotal} usuarios</p>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Suscripción</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        {u.avatar ? (
                                                            <img src={u.avatar} alt={u.name} className={styles.avatar} />
                                                        ) : (
                                                            <div className={styles.avatarPlaceholder}>{u.name[0]}</div>
                                                        )}
                                                        {u.name}
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                                        className={styles.select}
                                                    >
                                                        <option value="USER">Usuario</option>
                                                        <option value="VENDOR">Vendedor</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        value={u.subscription}
                                                        onChange={(e) => handleUpdateUserSubscription(u.id, e.target.value)}
                                                        className={styles.select}
                                                    >
                                                        <option value="FREE">Free</option>
                                                        <option value="PREMIUM">Premium</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {u.vendor && (
                                                        <span className={styles.badge}>Tienda: {u.vendor.businessName}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Vendors */}
                        {activeTab === 'vendors' && (
                            <div className={styles.section}>
                                <p className={styles.total}>{vendorsTotal} vendedores</p>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Tienda</th>
                                            <th>Propietario</th>
                                            <th>Productos</th>
                                            <th>Rating</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendors.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.businessName}</td>
                                                <td>{v.user?.name}</td>
                                                <td>{v._count?.products || 0}</td>
                                                <td>⭐ {v.avgRating?.toFixed(1) || '-'}</td>
                                                <td>
                                                    {v.verified ? (
                                                        <span className={styles.verified}>✓ Verificado</span>
                                                    ) : (
                                                        <span className={styles.unverified}>No verificado</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleToggleVerify(v.id)}
                                                        className={v.verified ? styles.btnDanger : styles.btnSuccess}
                                                    >
                                                        {v.verified ? <FiX /> : <FiCheck />}
                                                        {v.verified ? 'Quitar' : 'Verificar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Products */}
                        {activeTab === 'products' && (
                            <div className={styles.section}>
                                <p className={styles.total}>{productsTotal} productos</p>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Vendedor</th>
                                            <th>Categoría</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div className={styles.productCell}>
                                                        {p.images?.[0] && (
                                                            <img src={p.images[0]} alt={p.name} className={styles.productImg} />
                                                        )}
                                                        {p.name}
                                                    </div>
                                                </td>
                                                <td>${p.price?.toLocaleString()}</td>
                                                <td>{p.vendor?.businessName}</td>
                                                <td>{p.category}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className={styles.btnDanger}
                                                    >
                                                        <FiTrash2 /> Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Classifieds */}
                        {activeTab === 'classifieds' && (
                            <div className={styles.section}>
                                <p className={styles.total}>{classifiedsTotal} clasificados</p>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Tipo</th>
                                            <th>Usuario</th>
                                            <th>Ciudad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classifieds.map(c => (
                                            <tr key={c.id}>
                                                <td>{c.title}</td>
                                                <td>
                                                    <span className={c.type === 'SEEKING' ? styles.badgeSeeking : styles.badgeOffering}>
                                                        {c.type === 'SEEKING' ? 'Busca' : 'Ofrece'}
                                                    </span>
                                                </td>
                                                <td>{c.user?.name}</td>
                                                <td>{c.city}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteClassified(c.id)}
                                                        className={styles.btnDanger}
                                                    >
                                                        <FiTrash2 /> Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Fairs */}
                        {activeTab === 'fairs' && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <p className={styles.total}>{fairs.length} ferias</p>
                                    <button onClick={() => handleOpenFairModal()} className={styles.btnSuccess}>
                                        <FiPlus /> Nueva Feria
                                    </button>
                                </div>

                                <div className={styles.fairsList}>
                                    {fairs.map(fair => (
                                        <div key={fair.id} className={`${styles.fairCard} ${!fair.active ? styles.inactive : ''}`}>
                                            <div className={styles.fairHeader}>
                                                {fair.image && <img src={fair.image} alt={fair.name} className={styles.fairImage} />}
                                                <div className={styles.fairInfo}>
                                                    <h3>{fair.name}</h3>
                                                    <p>
                                                        <FiMapPin /> {fair.address}
                                                        {fair.mapsUrl && (
                                                            <a
                                                                href={fair.mapsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.mapLink}
                                                                title="Abrir en Google Maps"
                                                            >
                                                                <FiExternalLink /> Ver Mapa
                                                            </a>
                                                        )}
                                                    </p>
                                                    <p><FiCalendar /> {new Date(fair.startDate).toLocaleDateString('es-AR')} - {new Date(fair.endDate).toLocaleDateString('es-AR')}</p>
                                                    {fair.openTime && <p><FiClock /> {fair.openTime} - {fair.closeTime}</p>}
                                                    <div className={styles.fairStats}>
                                                        <span>📍 {fair.standsOccupied || 0}/{fair.standsTotal || 0} stands ocupados</span>
                                                        {fair.recurring && <span className={styles.badge}>🔄 {fair.recurring === 'weekly' ? 'Semanal' : fair.recurring === 'monthly' ? 'Mensual' : 'Permanente'}</span>}
                                                        {fair.openDays?.length > 0 && <span className={styles.badge}>📅 {fair.openDays.join(', ')}</span>}
                                                        {!fair.active && <span className={styles.badgeDanger}>Inactiva</span>}
                                                    </div>
                                                </div>
                                                <div className={styles.fairActions}>
                                                    <button onClick={() => handleOpenFairModal(fair)} className={styles.btnSmall}><FiEdit2 /></button>
                                                    <button onClick={() => handleToggleFairActive(fair)} className={fair.active ? styles.btnSmallDanger : styles.btnSmallSuccess}>
                                                        {fair.active ? <FiX /> : <FiCheck />}
                                                    </button>
                                                    <button onClick={() => handleDeleteFair(fair.id)} className={styles.btnSmallDanger}><FiTrash2 /></button>
                                                </div>
                                            </div>

                                            {/* Stands */}
                                            <div className={styles.standsSection}>
                                                <div className={styles.standsHeader}>
                                                    <h4>Stands ({fair.stands?.length || 0})</h4>
                                                    <button onClick={() => handleOpenStandModal(fair)} className={styles.btnSmall}><FiPlus /> Agregar</button>
                                                </div>
                                                {fair.stands && fair.stands.length > 0 ? (
                                                    <div className={styles.standsGrid}>
                                                        {fair.stands.map(stand => (
                                                            <div key={stand.id} className={`${styles.standCard} ${styles['stand' + stand.status]}`}>
                                                                <div className={styles.standNumber}>{stand.standNumber}</div>
                                                                <div className={styles.standInfo}>
                                                                    {stand.category && <span className={styles.standCategory}>{stand.category}</span>}
                                                                    {stand.vendor && (
                                                                        <div className={styles.assignedVendor}>
                                                                            🏪 {stand.vendor.businessName}
                                                                        </div>
                                                                    )}
                                                                    <select
                                                                        value={stand.vendorId || ''}
                                                                        onChange={(e) => handleAssignVendor(fair.id, stand.id, e.target.value)}
                                                                        className={styles.vendorSelect}
                                                                    >
                                                                        <option value="">Asignar tienda...</option>
                                                                        {allVendors.map(v => (
                                                                            <option key={v.id} value={v.id}>{v.businessName}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <button onClick={() => handleDeleteStand(fair.id, stand.id)} className={styles.standDelete}><FiTrash2 /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className={styles.noStands}>No hay stands configurados</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Fair Modal */}
            {showFairModal && (
                <div className={styles.modalOverlay} onClick={() => setShowFairModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>{selectedFair ? 'Editar Feria' : 'Nueva Feria'}</h2>
                        <div className={styles.modalForm}>
                            <input placeholder="Nombre *" value={fairForm.name} onChange={e => setFairForm({ ...fairForm, name: e.target.value })} />
                            <textarea placeholder="Descripción" value={fairForm.description} onChange={e => setFairForm({ ...fairForm, description: e.target.value })} />

                            {/* Location Selectors */}
                            <div className={styles.formRow}>
                                <div>
                                    <label>País</label>
                                    <select value={fairForm.country} onChange={e => setFairForm({ ...fairForm, country: e.target.value, province: '', city: '' })}>
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label>Provincia</label>
                                    <select value={fairForm.province} onChange={e => setFairForm({ ...fairForm, province: e.target.value, city: '' })}>
                                        <option value="">Seleccionar...</option>
                                        {provinces[fairForm.country]?.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div>
                                    <label>Ciudad</label>
                                    <select value={fairForm.city} onChange={e => setFairForm({ ...fairForm, city: e.target.value })}>
                                        <option value="">Seleccionar...</option>
                                        {cities[fairForm.province]?.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <input placeholder="Dirección/Calle *" value={fairForm.address} onChange={e => setFairForm({ ...fairForm, address: e.target.value })} />
                            </div>

                            {/* Google Maps Link */}
                            <div>
                                <label>📍 Link de Google Maps (Opcional)</label>
                                <input
                                    placeholder="https://maps.app.goo.gl/..."
                                    value={fairForm.mapsUrl}
                                    onChange={e => setFairForm({ ...fairForm, mapsUrl: e.target.value })}
                                />
                                <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                    Abrí Google Maps, buscá la ubicación y copiá el link con "Compartir"
                                </small>
                            </div>

                            {/* Date Range */}
                            <div className={styles.formRow}>
                                <div>
                                    <label>Fecha Inicio</label>
                                    <input type="date" value={fairForm.startDate} onChange={e => setFairForm({ ...fairForm, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label>Fecha Fin</label>
                                    <input type="date" value={fairForm.endDate} onChange={e => setFairForm({ ...fairForm, endDate: e.target.value })} />
                                </div>
                            </div>

                            {/* Open Days */}
                            <div>
                                <label>Días que abre</label>
                                <div className={styles.daysContainer}>
                                    {WEEKDAYS.map(day => (
                                        <button
                                            key={day.key}
                                            type="button"
                                            className={`${styles.dayBtn} ${fairForm.openDays?.includes(day.key) ? styles.dayActive : ''}`}
                                            onClick={() => toggleOpenDay(day.key)}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hours */}
                            <div className={styles.formRow}>
                                <div>
                                    <label><FiClock /> Horario Apertura</label>
                                    <input type="time" value={fairForm.openTime} onChange={e => setFairForm({ ...fairForm, openTime: e.target.value })} />
                                </div>
                                <div>
                                    <label><FiClock /> Horario Cierre</label>
                                    <input type="time" value={fairForm.closeTime} onChange={e => setFairForm({ ...fairForm, closeTime: e.target.value })} />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <select value={fairForm.recurring} onChange={e => setFairForm({ ...fairForm, recurring: e.target.value })}>
                                    <option value="">Sin recurrencia</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                    <option value="permanent">Permanente</option>
                                </select>
                                <input type="number" placeholder="Capacidad (stands)" value={fairForm.capacity} onChange={e => setFairForm({ ...fairForm, capacity: e.target.value })} />
                            </div>
                            <input placeholder="URL Imagen" value={fairForm.image} onChange={e => setFairForm({ ...fairForm, image: e.target.value })} />
                            <div className={styles.formRow}>
                                <input placeholder="Teléfono contacto" value={fairForm.contactPhone} onChange={e => setFairForm({ ...fairForm, contactPhone: e.target.value })} />
                                <input placeholder="Email contacto" value={fairForm.contactEmail} onChange={e => setFairForm({ ...fairForm, contactEmail: e.target.value })} />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowFairModal(false)} className={styles.btnSecondary}>Cancelar</button>
                            <button onClick={handleSaveFair} className={styles.btnSuccess}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stand Modal */}
            {showStandModal && (
                <div className={styles.modalOverlay} onClick={() => setShowStandModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Nuevo Stand - {selectedFair?.name}</h2>
                        <div className={styles.modalForm}>
                            {/* Vendor Selection */}
                            <div>
                                <label>🏪 Seleccionar Tienda</label>
                                <select
                                    value={standForm.vendorId}
                                    onChange={e => handleSelectStandVendor(e.target.value)}
                                >
                                    <option value="">Seleccionar vendedor...</option>
                                    {allVendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.businessName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Vendor Preview */}
                            {selectedStandVendor && (
                                <div className={styles.vendorPreview}>
                                    <div className={styles.vendorPreviewInfo}>
                                        {selectedStandVendor.user?.avatar && (
                                            <img
                                                src={selectedStandVendor.user.avatar}
                                                alt={selectedStandVendor.businessName}
                                                className={styles.vendorPreviewAvatar}
                                            />
                                        )}
                                        <div>
                                            <strong>{selectedStandVendor.businessName}</strong>
                                            <p>{selectedStandVendor.category}</p>
                                            {selectedStandVendor.description && (
                                                <small>{selectedStandVendor.description.substring(0, 80)}...</small>
                                            )}
                                        </div>
                                    </div>
                                    <a
                                        href={`/vendor/${selectedStandVendor.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.vendorPreviewLink}
                                    >
                                        Ver Tienda →
                                    </a>
                                </div>
                            )}

                            <input
                                placeholder="Número de Stand (ej: A1) *"
                                value={standForm.standNumber}
                                onChange={e => setStandForm({ ...standForm, standNumber: e.target.value })}
                            />
                            <input
                                placeholder="Categoría"
                                value={standForm.category}
                                onChange={e => setStandForm({ ...standForm, category: e.target.value })}
                                disabled={!!selectedStandVendor}
                                style={{ opacity: selectedStandVendor ? 0.7 : 1 }}
                            />
                            <input
                                placeholder="Descripción (opcional)"
                                value={standForm.description}
                                onChange={e => setStandForm({ ...standForm, description: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Precio alquiler (opcional)"
                                value={standForm.price}
                                onChange={e => setStandForm({ ...standForm, price: e.target.value })}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowStandModal(false)} className={styles.btnSecondary}>Cancelar</button>
                            <button onClick={handleCreateStand} className={styles.btnSuccess}>Crear Stand</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
