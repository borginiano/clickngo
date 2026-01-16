import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { initPushNotifications, unregisterPushToken } from '../services/push';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await authAPI.getMe();
                setUser(data);
                // Init push notifications for returning users
                initPushNotifications().catch(console.error);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        // Init push notifications on login
        initPushNotifications().catch(console.error);
        return data;
    };

    const register = async (userData) => {
        const { data } = await authAPI.register(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        // Init push notifications on register
        initPushNotifications().catch(console.error);
        return data;
    };

    const logout = async () => {
        // Unregister push token before logout
        await unregisterPushToken().catch(console.error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const loginWithToken = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        // Init push notifications
        initPushNotifications().catch(console.error);
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    // Get vendor data from user
    const vendor = user?.vendor || null;

    return (
        <AuthContext.Provider value={{
            user,
            vendor,
            loading,
            login,
            register,
            logout,
            loginWithToken,
            updateUser,
            isAuthenticated: !!user,
            // isVendor: true only if user has a vendor profile (not just the role)
            isVendor: !!user?.vendor,
            isPremium: user?.subscription === 'PREMIUM'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
