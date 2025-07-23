// frontend/src/context/AuthContext.jsx
// Version: 2
// This version adds and exports a custom `useAuth` hook to provide
// a clean, standard way to consume the context, fixing a build error.

import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

// This is the new custom hook that components will use.
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const { data } = await API.get('/profile');
                    setUser(data);
                } catch (error) {
                    console.error("Session verification failed", error);
                    localStorage.removeItem('token');
                    delete API.defaults.headers.common['Authorization'];
                    setUser(null);
                }
            }
            setLoading(false);
        };
        verifyUser();
    }, []);

    const login = async (credentials) => {
        const { data } = await API.post('/auth/login', credentials);
        localStorage.setItem('token', data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        const profileRes = await API.get('/profile');
        setUser(profileRes.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete API.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
