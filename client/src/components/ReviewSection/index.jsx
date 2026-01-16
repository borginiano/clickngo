import { useState, useEffect } from 'react';
import { FiMessageSquare, FiTrash2, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../api';
import StarRating from '../StarRating';
import toast from 'react-hot-toast';
import styles from './ReviewSection.module.css';

function ReviewSection({ vendorId, vendorUserId }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userReview, setUserReview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isOwnVendor = user?.id === vendorUserId;

    useEffect(() => {
        loadReviews();
    }, [vendorId]);

    const loadReviews = async () => {
        try {
            const { data } = await reviewAPI.getVendorReviews(vendorId);
            setReviews(data.reviews);
            if (data.userReview) {
                setUserReview(data.userReview);
                setRating(data.userReview.rating);
                setComment(data.userReview.comment || '');
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Selecciona una calificación');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await reviewAPI.createReview(vendorId, { rating, comment });
            toast.success(userReview ? 'Reseña actualizada' : '¡Gracias por tu reseña!');
            setUserReview(data.review);
            setShowForm(false);
            loadReviews();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al guardar reseña');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('¿Eliminar esta reseña?')) return;

        try {
            await reviewAPI.deleteReview(reviewId);
            toast.success('Reseña eliminada');
            setUserReview(null);
            setRating(0);
            setComment('');
            loadReviews();
        } catch (error) {
            toast.error('Error al eliminar reseña');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className={styles.loading}>Cargando reseñas...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3><FiMessageSquare /> Reseñas</h3>
                {reviews.length > 0 && (
                    <span className={styles.count}>{reviews.length} reseña(s)</span>
                )}
            </div>

            {/* Add/Edit Review Button */}
            {user && !isOwnVendor && !showForm && (
                <button
                    className={styles.addReviewBtn}
                    onClick={() => setShowForm(true)}
                >
                    {userReview ? '✏️ Editar mi reseña' : '⭐ Escribir reseña'}
                </button>
            )}

            {/* Review Form */}
            {showForm && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formRating}>
                        <label>Tu calificación:</label>
                        <StarRating
                            rating={rating}
                            interactive
                            onChange={setRating}
                            size="lg"
                        />
                    </div>
                    <textarea
                        className={styles.textarea}
                        placeholder="Escribe tu experiencia (opcional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                    />
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => setShowForm(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={submitting || rating === 0}
                        >
                            {submitting ? 'Guardando...' : userReview ? 'Actualizar' : 'Publicar'}
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <p className={styles.empty}>Sin reseñas aún. ¡Sé el primero!</p>
            ) : (
                <div className={styles.list}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.review}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewUser}>
                                    {review.user.avatar ? (
                                        <img src={review.user.avatar} alt={review.user.name} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <FiUser />
                                        </div>
                                    )}
                                    <div>
                                        <span className={styles.userName}>{review.user.name}</span>
                                        <span className={styles.date}>{formatDate(review.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={styles.reviewRating}>
                                    <StarRating rating={review.rating} size="sm" />
                                    {(review.userId === user?.id || user?.role === 'ADMIN') && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(review.id)}
                                            title="Eliminar"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {review.comment && (
                                <p className={styles.reviewComment}>{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewSection;
