import axios from 'axios';
import { getApiBaseURL } from '../utils/urlHelper';

// -----------------------------------------------------------------------------
// 1️⃣  Base configuration
// -----------------------------------------------------------------------------
const baseURL = getApiBaseURL();
const timeout = Number(import.meta.env.VITE_API_TIMEOUT || 15000);

export const apiClient = axios.create({
  baseURL,
  timeout,
  // Keep cookies for session‑based auth (if your backend uses them)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------------------------
// 2️⃣  Request interceptor – attach auth token (JWT) & CSRF token if needed
// -----------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  // ---- JWT handling -------------------------------------------------------
  // Try to read a JWT stored by your login flow (e.g. localStorage)
  const jwt = localStorage.getItem('authToken');
  if (jwt) {
    config.headers['Authorization'] = `Bearer ${jwt}`;
  }

  // ---- CSRF handling (existing logic) -----------------------------------
  // If the request body is a FormData, let the browser set the correct
  // multipart header (including boundary).
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Optional: read a CSRF token from a cookie (default name XSRF‑TOKEN)
  const csrfCookieName = 'XSRF-TOKEN';
  const match = document.cookie.match(new RegExp(`(?:^|; )${csrfCookieName}=([^;]*)`));
  if (match && match[1]) {
    config.headers['X-CSRF-Token'] = decodeURIComponent(match[1]);
  }

  return config;
});

// -----------------------------------------------------------------------------
// 3️⃣  Response interceptor – global 401 handling
// -----------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend says the token is invalid/expired, clear it and redirect.
    if (error.response && error.response.status === 401) {
      // Si on est déjà sur la page de login, on ne redirige pas (évite les boucles)
      const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/connexion';

      if (!isLoginPage) {
        console.warn('🔐 401 – unauthorized, clearing auth token and redirecting');
        localStorage.removeItem('authToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// 4️⃣  Export (nothing else to change)
// -----------------------------------------------------------------------------
export default apiClient;
