// src/utils/axiosInstance.js
// ─────────────────────────────────────────────────────────────────────────────
// A single pre-configured Axios instance used by every AI feature.
// • baseURL  — reads from VITE_API_URL env var; falls back to localhost:5000
// • withCredentials — ensures session cookies are sent on every request
// • Content-Type   — set to application/json by default (overridden per-call for
//                    multipart uploads)
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const axiosInstance = axios.create({
    baseURL: `${API_BASE}/api/v1`,
    withCredentials: true,           // ← sends HttpOnly cookies (JWT) on every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach JWT token if present
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
