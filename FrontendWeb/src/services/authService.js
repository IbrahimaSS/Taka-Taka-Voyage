import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Auth
export const authService = {
  // Inscription - Étape 1: Initialisation + génération OTP
  initInscription: (payload) => apiClient.post(API_ROUTES.auth.initInscription, payload),

  // Inscription - Étape 2: Vérification OTP
  verifyOtp: (payload) => apiClient.post(API_ROUTES.auth.verifyOtp, payload),

  // Inscription - Étape 3: Finalisation avec création compte
  finaliserInscription: (payload) => apiClient.post(API_ROUTES.auth.finaliserInscription, payload),

  // Connexion
  login: (payload) => apiClient.post(API_ROUTES.auth.login, payload),

  // Récupérer l'utilisateur connecté
  me: () => apiClient.get(API_ROUTES.auth.me),

  // Déconnexion
  logout: () => apiClient.post(API_ROUTES.auth.logout)
};
