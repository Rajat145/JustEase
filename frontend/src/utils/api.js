// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'https://justease-oup9.onrender.com/',
//   withCredentials: true,
// });

// // Attach JWT token to every request
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('je_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Handle 401 globally — redirect to login
// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('je_token');
//       localStorage.removeItem('je_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// export default API;
import axios from 'axios';

/**
 * Central Axios instance for the JustEase API.
 *
 * Base URL resolution (in priority order):
 *  1. VITE_API_URL env variable  →  set to https://justease-oup9.onrender.com/api in .env
 *  2. Relative '/api'            →  works via Vite proxy during local development only
 *
 * Production (Vercel → Render):
 *   Frontend: https://just-ease-eight.vercel.app
 *   Backend:  https://justease-oup9.onrender.com/api
 */
import axios from 'axios';

/**
 * JustEase API client
 *
 * Production:  https://justease-oup9.onrender.com/api  (Render backend)
 * Frontend:    https://just-ease-eight.vercel.app       (Vercel)
 *
 * The Render URL is hardcoded as the default so the app never
 * accidentally falls back to localhost in production.
 */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://justease-oup9.onrender.com/api';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,   // no cookies needed — we use Bearer tokens
  timeout: 60000,           // 60 s — Render free tier cold starts take ~30-50 s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('je_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('je_token');
      localStorage.removeItem('je_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
