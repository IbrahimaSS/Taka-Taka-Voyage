// ✅ 3) tripService.js — VERSION FINALE (inchangée mais propre)
// - createPlanned utilisé par Passenger.jsx
// - Rien ne casse côté design

import { apiClient } from './apiClient';

export const tripService = {
  list: (params) => apiClient.get('/reservations', { params }),
  details: (id) => apiClient.get(`/reservations/${id}`),

  // immediate
  create: (payload) => apiClient.post('/reservations-immediate/confirmer-immediate', payload),

  // planned
  createPlanned: (payload) => apiClient.post('/reservations-planifiee/creer', payload),

  accept: (id) => apiClient.post(`/reservations/${id}/accept`),
  reject: (id, payload) => apiClient.post(`/reservations/${id}/reject`, payload),
  arrive: (id) => apiClient.post(`/reservations/${id}/arrive`),
  start: (id) => apiClient.post(`/reservations/${id}/start`),
  complete: (id) => apiClient.post(`/reservations/${id}/complete`),
  cancel: (id, payload) => apiClient.post(`/reservations/${id}/cancel`, payload),
  rate: (id, payload) => apiClient.post(`/reservations/${id}/rate`, payload),
};