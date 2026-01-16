import { Link } from 'react-router-dom';
import { FiMapPin, FiPackage, FiStar } from 'react-icons/fi';
import styles from './VendorCard.module.css';

function VendorCard({ vendor }) {
    const isPremium = vendor.user?.subscription === 'PREMIUM';

    return (
        <Link
            to={`/vendor/${vendor.id}`}
            className={`${styles.card} ${isPremium ? styles.cardPremium : ''}`}
        >
            {isPremium && (
                <div className={styles.premiumBadge}>
                    <FiStar /> Premium
                </div>
            )}

            <div className={styles.header}>
                <div className={styles.avatar}>
                    {vendor.user?.avatar ? (
                        <img src={vendor.user.avatar} alt={vendor.businessName} />
                    ) : (
                        <span>{vendor.businessName.charAt(0)}</span>
                    )}
                </div>
                <div className={styles.info}>
                    <h3>
                        {vendor.businessName}
                        {isPremium && <span className={styles.verifiedCheck}>✓</span>}
                    </h3>
                    <span className={styles.category}>{vendor.category || 'General'}</span>
                </div>
            </div>

            {vendor.description && (
                <p className={styles.description}>{vendor.description}</p>
            )}

            <div className={styles.meta}>
                {vendor.address && (
                    <span className={styles.metaItem}>
                        <FiMapPin /> {vendor.address}
                    </span>
                )}
                <span className={styles.metaItem}>
                    <FiPackage /> {vendor.products?.length || 0} productos
                </span>
            </div>

            {vendor.products?.length > 0 && (
                <div className={styles.productsPreview}>
                    {vendor.products.slice(0, 4).map((product) => (
                        <div key={product.id} className={styles.productThumb}>
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} />
                            ) : (
                                <div className={styles.noImage}>📦</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Link>
    );
}

export default VendorCard;
