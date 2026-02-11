import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Paiements (côté passager)
export const paymentService = {
  // Initier un paiement sur une réservation
  initier: (payload) => apiClient.post(API_ROUTES.passager.paiementInitier, payload),
  // Statistiques paiements du passager
  stats: () => apiClient.get(API_ROUTES.passager.paiements.stats),
  // Liste des paiements du passager
  list: (params) => apiClient.get(API_ROUTES.passager.paiements.list, { params }),
  // Détails d'un paiement
  details: (id) => apiClient.get(API_ROUTES.passager.paiements.details(id)),
};
