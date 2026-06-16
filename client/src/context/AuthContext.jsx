import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('gd_token'));
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('gd_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token && !user) {
            setLoading(true);
            API.get('/auth/me')
                .then((res) => {
                    setUser(res.data.user);
                    localStorage.setItem('gd_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    logout();
                })
                .finally(() => setLoading(false));
        }
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('gd_token', newToken);
        localStorage.setItem('gd_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('gd_token');
        localStorage.removeItem('gd_user');
        setToken(null);
        setUser(null);
        window.location.href = 'https://www.smartprep.live/login';
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
