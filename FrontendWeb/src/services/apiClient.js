import axios from 'axios';

// Configuration de base API
// TODO: definir VITE_API_URL vers votre backend (ex: https://api.takataka.com/api)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT || 15000);

export const apiClient = axios.create({
  baseURL,
  timeout,
  withCredentials: true, // cookies pour les sessions d'auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// OPTIONNEL: joindre un token CSRF depuis le cookie si votre backend l'utilise
// TODO: ajuster le nom du cookie / header selon votre backend (ex: XSRF-TOKEN)
apiClient.interceptors.request.use((config) => {
  const csrfCookieName = 'XSRF-TOKEN';
  const match = document.cookie.match(new RegExp(`(?:^|; )${csrfCookieName}=([^;]*)`));
  if (match && match[1]) {
    config.headers['X-CSRF-Token'] = decodeURIComponent(match[1]);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: gerer globalement les 401 (refresh token / redirection login)
    return Promise.reject(error);
  }
);
