import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPackage, FiStar } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from '../../api';
import styles from './VendorsMap.module.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vendor marker
const vendorIcon = new L.DivIcon({
    className: 'vendor-marker',
    html: `<div style="
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #00d9ff 0%, #00ff88 100%);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <span style="font-size: 18px;">📍</span>
  </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

// Premium vendor marker
const premiumIcon = new L.DivIcon({
    className: 'vendor-marker-premium',
    html: `<div style="
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(255,215,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <span style="font-size: 20px;">⭐</span>
  </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Custom cluster icon
const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size = 'small';
    if (count > 10) size = 'medium';
    if (count > 25) size = 'large';

    const sizes = {
        small: { size: 40, fontSize: '14px' },
        medium: { size: 50, fontSize: '16px' },
        large: { size: 60, fontSize: '18px' }
    };

    const s = sizes[size];

    return new L.DivIcon({
        html: `<div style="
            width: ${s.size}px;
            height: ${s.size}px;
            background: linear-gradient(135deg, #00d9ff 0%, #9945ff 100%);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0,217,255,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${s.fontSize};
        ">${count}</div>`,
        className: 'cluster-icon',
        iconSize: [s.size, s.size],
    });
};

// Component to recenter map when user location changes
function RecenterMap({ center }) {
    const map = useMap();
    if (center) {
        map.setView(center, 14);
    }
    return null;
}

function VendorsMap({ vendors, userLocation, nearbyRadius = 5 }) {
    // Filter vendors with valid coordinates
    const vendorsWithLocation = vendors.filter(v => v.latitude && v.longitude);

    // Default center (Buenos Aires) or user location
    const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [-34.6037, -58.3816];

    const getAvatarUrl = (vendor) => {
        if (!vendor.user?.avatar) return null;
        const url = vendor.user.avatar;
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    // Calculate distance between two points in km
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    if (vendorsWithLocation.length === 0 && !userLocation) {
        return (
            <div className={styles.container}>
                <div className={styles.noLocation}>
                    <FiMapPin />
                    <p>No hay vendedores con ubicación registrada</p>
                    <span>Los vendedores aparecerán aquí cuando agreguen su ubicación</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: 'linear-gradient(135deg, #00d9ff, #00ff88)' }}></span>
                    Vendedor
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)' }}></span>
                    Premium
                </div>
                {userLocation && (
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#00d9ff', boxShadow: '0 0 10px #00d9ff' }}></span>
                        Tú
                    </div>
                )}
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={userLocation ? 14 : 12}
                className={styles.mapContainer}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && <RecenterMap center={[userLocation.lat, userLocation.lng]} />}

                {/* User location marker with radius circle */}
                {userLocation && (
                    <>
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={nearbyRadius * 1000}
                            pathOptions={{
                                color: '#00d9ff',
                                fillColor: '#00d9ff',
                                fillOpacity: 0.1,
                                weight: 2,
                                dashArray: '5, 10'
                            }}
                        />
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={new L.DivIcon({
                                className: 'user-marker',
                                html: `<div style="
                                    width: 20px;
                                    height: 20px;
                                    background: #00d9ff;
                                    border-radius: 50%;
                                    border: 4px solid white;
                                    box-shadow: 0 0 20px rgba(0,217,255,0.5);
                                "></div>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                            })}
                        />
                    </>
                )}

                {/* Vendor markers with clustering */}
                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {vendorsWithLocation.map((vendor) => {
                        const isPremium = vendor.user?.subscription === 'PREMIUM';
                        const distance = userLocation
                            ? getDistance(userLocation.lat, userLocation.lng, vendor.latitude, vendor.longitude)
                            : null;

                        return (
                            <Marker
                                key={vendor.id}
                                position={[vendor.latitude, vendor.longitude]}
                                icon={isPremium ? premiumIcon : vendorIcon}
                            >
                                <Popup>
                                    <div className={styles.popup}>
                                        <div className={styles.popupHeader}>
                                            <div className={styles.popupAvatar}>
                                                {getAvatarUrl(vendor) ? (
                                                    <img src={getAvatarUrl(vendor)} alt={vendor.businessName} />
                                                ) : (
                                                    vendor.businessName.charAt(0)
                                                )}
                                            </div>
                                            <div className={styles.popupInfo}>
                                                <h3>
                                                    {vendor.businessName}
                                                    {isPremium && <FiStar style={{ color: '#ffd700', marginLeft: '4px' }} />}
                                                </h3>
                                                <span className={styles.popupCategory}>{vendor.category || 'General'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.popupMeta}>
                                            <span>
                                                <FiPackage style={{ marginRight: '4px' }} />
                                                {vendor.products?.length || 0} productos
                                            </span>
                                            {distance && (
                                                <span className={styles.distance}>
                                                    📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                                                </span>
                                            )}
                                        </div>
                                        {vendor.avgRating > 0 && (
                                            <div className={styles.popupRating}>
                                                ⭐ {vendor.avgRating.toFixed(1)} ({vendor.totalReviews} reseñas)
                                            </div>
                                        )}
                                        <Link to={`/vendor/${vendor.id}`} className={styles.popupLink}>
                                            Ver Perfil
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}

export default VendorsMap;
