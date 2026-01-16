import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './StarRating.module.css';

function StarRating({
    rating = 0,
    maxStars = 5,
    size = 'md',
    interactive = false,
    onChange = () => { },
    showCount = false,
    count = 0
}) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (star) => {
        if (interactive) {
            onChange(star);
        }
    };

    const handleMouseEnter = (star) => {
        if (interactive) {
            setHoverRating(star);
        }
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`${styles.container} ${styles[size]}`}>
            <div className={styles.stars}>
                {[...Array(maxStars)].map((_, index) => {
                    const star = index + 1;
                    const isFilled = star <= displayRating;
                    const isHalf = !isFilled && star - 0.5 <= displayRating;

                    return (
                        <button
                            key={star}
                            type="button"
                            className={`${styles.star} ${isFilled ? styles.filled : ''} ${isHalf ? styles.half : ''} ${interactive ? styles.interactive : ''}`}
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => handleMouseEnter(star)}
                            onMouseLeave={handleMouseLeave}
                            disabled={!interactive}
                        >
                            <FiStar />
                        </button>
                    );
                })}
            </div>
            {rating > 0 && (
                <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
            )}
            {showCount && count > 0 && (
                <span className={styles.count}>({count})</span>
            )}
        </div>
    );
}

export default StarRating;
