import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../../api';
import { FiBell, FiCheck, FiTrash2, FiX, FiPackage, FiStar, FiTag, FiInfo } from 'react-icons/fi';
import styles from './NotificationBell.module.css';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const { data } = await notificationAPI.getMy();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.log('Could not load notifications');
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'NEW_PRODUCT': return <FiPackage />;
            case 'NEW_REVIEW': return <FiStar />;
            case 'COUPON': return <FiTag />;
            default: return <FiInfo />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'NEW_PRODUCT': return '#00d9ff';
            case 'NEW_REVIEW': return '#fbbf24';
            case 'COUPON': return '#10b981';
            default: return '#9945ff';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const d = new Date(date);
        const diff = Math.floor((now - d) / 1000);

        if (diff < 60) return 'Ahora';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
                                <FiCheck /> Marcar todas
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className={styles.empty}>
                            <FiBell />
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {notifications.slice(0, 10).map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${!notif.read ? styles.unread : ''}`}
                                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                                >
                                    <div
                                        className={styles.icon}
                                        style={{ color: getIconColor(notif.type) }}
                                    >
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className={styles.content}>
                                        <strong>{notif.title}</strong>
                                        <p>{notif.message}</p>
                                        <span className={styles.time}>{formatTime(notif.createdAt)}</span>
                                    </div>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notif.id);
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
