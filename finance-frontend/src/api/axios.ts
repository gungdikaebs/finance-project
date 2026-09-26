import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Jika diakses dari HP via IP lokal (misal: 192.168.x.x), otomatis arahkan ke backend di IP yang sama
    if (
        typeof window !== 'undefined' &&
        window.location.hostname &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
    ) {
        return `http://${window.location.hostname}:3001`;
    }
    return 'http://localhost:3001';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthAttempt = /^\/auth\/(login|register|google(?:\/link)?)$/.test(error.config?.url || '');
        if (error.response?.status === 401 && !isAuthAttempt) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
