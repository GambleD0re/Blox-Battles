// frontend/src/context/AuthContext.jsx
// Version: 1
// This version changes the export of AuthContext from 'default' to 'named'
// to match how it is imported throughout the application, fixing a build error.

import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

// CORRECTED: Exporting AuthContext as a named export.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Set the token for API requests
                    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const { data } = await API.get('/profile'); // Example endpoint
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
