import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// Safeguard: Automatically append '/api' suffix if it is configured as the root domain (e.g. on Render)
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const API = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT Auth Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitsense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle token expiration/invalidity
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fitsense_token');
      // Only redirect if they are not already on public authentication/landing routes
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
