// frontend/src/services/api.js
// Version: 1
//
// This file centralizes all API communication for the frontend application.
// It uses axios for making HTTP requests to the backend server.

import axios from 'axios';

// Create an axios instance with a base URL.
// This is the key change: it now dynamically uses the VITE_API_URL
// environment variable provided by the render.yaml file during the build process.
// If that variable isn't set (e.g., in local development), it defaults
// to a standard local development URL.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // This is important for sending cookies with auth tokens
});

// Interceptor to add the authorization token to every request if it exists.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
