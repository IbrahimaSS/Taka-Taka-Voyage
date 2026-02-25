// ✅ 3) tripService.js — VERSION FINALE (inchangée mais propre)
// - createPlanned utilisé par Passenger.jsx
// - Rien ne casse côté design

import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

export const tripService = {
  list: (params) => apiClient.get('/reservations', { params }),
  details: (id) => apiClient.get(`/reservations/${id}`),

  // immediate
  create: (payload) => apiClient.post(API_ROUTES.passager.reservationImmediate, payload),

  // planned
  createPlanned: (payload) => apiClient.post(API_ROUTES.passager.reservationsPlanifiees.planifier, payload),

  accept: (id) => apiClient.post(`/reservations/${id}/accept`),
  reject: (id, payload) => apiClient.post(`/reservations/${id}/reject`, payload),
  arrive: (id) => apiClient.post(`/chauffeur/mes-courses/${id}/signaler-arrivee`),
  start: (id) => apiClient.post(`/chauffeur/mes-courses/${id}/demarrer`),
  complete: (id) => apiClient.post(`/chauffeur/mes-courses/${id}/terminer`),
  cancel: (id, payload) => apiClient.post(API_ROUTES.passager.reservationsPlanifiees.annuler(id), payload),
  rate: (id, payload) => apiClient.post(API_ROUTES.passager.trajets.details(id) + '/rate', payload),

  // Historique
  getPassengerHistory: (params) => apiClient.get('/passager/trajets', { params }),
  getDriverHistory: (params) => apiClient.get('/chauffeur/trajets/historique', { params }),

  // Paiements
  getPayments: (params) => apiClient.get('/passager/paiements/paiements', { params }),
  getPaymentStats: () => apiClient.get('/passager/paiements/stats'),

  // Revenus Chauffeur
  getDriverRevenueStats: () => apiClient.get('/chauffeur/revenus'),
  getDriverRevenueList: () => apiClient.get('/chauffeur/revenus/liste'),

  // Dashboard Chauffeur
  getDriverDashboardStats: () => apiClient.get('/chauffeur/dashboard'),

  // Gestion des courses (Chauffeur)
  getAvailableTrips: () => apiClient.get(API_ROUTES.chauffeur.mesCourses.disponibles),
  getPickupTrips: () => apiClient.get(API_ROUTES.chauffeur.mesCourses.ramassage),
  acceptTrip: (id) => apiClient.post(API_ROUTES.chauffeur.mesCourses.accepter(id)),
  refuseTrip: (id) => apiClient.post(API_ROUTES.chauffeur.mesCourses.refuser(id)),
  getDriverPlannings: () => apiClient.get(API_ROUTES.chauffeur.mesCourses.plannings),
};
