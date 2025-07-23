// =================================================================
//        Blox Battles Frontend API Service (Corrected for Render)
// =================================================================
//
// This file configures the Axios instance used for all frontend
// API requests. It has been updated to dynamically point to the
// live backend URL provided by the Render environment.
//

import axios from 'axios';

// --- RENDER DEPLOYMENT MODIFICATION ---
//
// Original Logic (Commented Out):
// The base URL was previously hardcoded to a local development server.
// const API_URL = 'http://localhost:10000/api';
//
// Corrected Logic:
// We now use Vite's environment variable `import.meta.env.VITE_API_URL`.
// The `render.yaml` file is configured to set this variable to the
// public URL of your backend service (`https://blox_battles_api.onrender.com`)
// during the build process. This makes the configuration portable
// and deployment-ready.
//
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

console.log(`Frontend API is pointing to: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending session cookies
});

// --- Axios Interceptor ---
// This adds the JWT token (if it exists) to the Authorization header
// of every outgoing request. This is standard practice for authenticating
// API requests from a client-side application.
api.interceptors.request.use(
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

export default api;
