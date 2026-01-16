import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, BASE_URL } from '../../api';
import { FiMessageSquare, FiSend, FiArrowLeft, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './Chat.module.css';

function Chat() {
    const { conversationId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (conversationId) {
            loadMessages(conversationId);
        }
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const { data } = await chatAPI.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (convId) => {
        try {
            const { data } = await chatAPI.getMessages(convId);
            setMessages(data);
            const conv = conversations.find(c => c.id === convId);
            setActiveConversation(conv);
        } catch (error) {
            toast.error('Error al cargar mensajes');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || sending) return;

        setSending(true);
        try {
            const { data: message } = await chatAPI.sendMessage(conversationId, newMessage.trim());
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            loadConversations(); // Refresh to update last message
        } catch (error) {
            toast.error('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Hoy';
        if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
        return d.toLocaleDateString('es-AR');
    };

    const getAvatar = (u) => {
        if (!u?.avatar) return null;
        return u.avatar.startsWith('http') ? u.avatar : `${BASE_URL}${u.avatar}`;
    };

    if (loading) {
        return <div className={styles.loading}>Cargando chats...</div>;
    }

    return (
        <div className={styles.page}>
            {/* Conversations List */}
            <div className={`${styles.sidebar} ${conversationId ? styles.hideMobile : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2><FiMessageSquare /> Mensajes</h2>
                </div>

                {conversations.length === 0 ? (
                    <div className={styles.empty}>
                        <FiMessageSquare size={48} />
                        <p>No tienes conversaciones</p>
                        <span>Visita el perfil de un vendedor para iniciar un chat</span>
                    </div>
                ) : (
                    <div className={styles.convList}>
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/chat/${conv.id}`}
                                className={`${styles.convItem} ${conversationId === conv.id ? styles.active : ''}`}
                            >
                                <div className={styles.convAvatar}>
                                    {getAvatar(conv.otherUser) ? (
                                        <img src={getAvatar(conv.otherUser)} alt="" />
                                    ) : (
                                        <FiUser />
                                    )}
                                </div>
                                <div className={styles.convInfo}>
                                    <strong>
                                        {conv.otherUser?.vendor?.businessName || conv.otherUser?.name || 'Usuario'}
                                    </strong>
                                    <p>{conv.lastMessage || 'Sin mensajes'}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className={styles.badge}>{conv.unreadCount}</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className={`${styles.chatArea} ${!conversationId ? styles.hideMobile : ''}`}>
                {!conversationId ? (
                    <div className={styles.noChat}>
                        <FiMessageSquare size={64} />
                        <p>Selecciona una conversación</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.chatHeader}>
                            <Link to="/chat" className={styles.backBtn}>
                                <FiArrowLeft />
                            </Link>
                            <div className={styles.chatHeaderInfo}>
                                {activeConversation?.otherUser && (
                                    <>
                                        {activeConversation.otherUser.vendor ? (
                                            <Link
                                                to={`/vendor/${activeConversation.otherUser.vendor.id}`}
                                                className={styles.vendorLink}
                                            >
                                                <strong>{activeConversation.otherUser.vendor.businessName}</strong>
                                                <span>Ver perfil</span>
                                            </Link>
                                        ) : (
                                            <strong>{activeConversation.otherUser.name}</strong>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.messages}>
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user.id;
                                const showDate = idx === 0 ||
                                    new Date(msg.createdAt).toDateString() !==
                                    new Date(messages[idx - 1].createdAt).toDateString();

                                return (
                                    <div key={msg.id}>
                                        {showDate && (
                                            <div className={styles.dateDivider}>
                                                {formatDate(msg.createdAt)}
                                            </div>
                                        )}
                                        <div className={`${styles.message} ${isMe ? styles.sent : styles.received}`}>
                                            <p>{msg.content}</p>
                                            <span className={styles.time}>{formatTime(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className={styles.inputArea}>
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                            />
                            <button type="submit" disabled={!newMessage.trim() || sending}>
                                <FiSend />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Chat;
