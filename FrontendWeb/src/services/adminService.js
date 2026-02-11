import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Admin
export const adminService = {
  dashboard: () => apiClient.get(API_ROUTES.admin.dashboard),
  getDashboardStats: () => apiClient.get(API_ROUTES.admin.dashboard),
  getRecentTrips: () => apiClient.get(API_ROUTES.admin.trajetsRecents),
  getMonthlyRevenue: (params) => apiClient.get(API_ROUTES.admin.paiements.evolution, { params }),
  getRevenueByVehicleType: () => apiClient.get(API_ROUTES.admin.paiements.repartitionType),
  validations: (params) => apiClient.get(API_ROUTES.admin.validations.demandes, { params }),
  getPendingValidations: (limit = 5) => apiClient.get(API_ROUTES.admin.validations.demandes, { params: { statut: 'EN_ATTENTE', limit } }),
  validateDriver: (id, payload) => apiClient.patch(API_ROUTES.admin.validations.valider(id), payload),
  reports: (params) => apiClient.get(API_ROUTES.admin.reports.list, { params }),

  // Gestion des passagers
  getPassengers: (params) => apiClient.get(API_ROUTES.admin.passagers.list, { params }),
  getPassengerStats: () => apiClient.get(API_ROUTES.admin.passagers.stats),
  getPassengerDetails: (id) => apiClient.get(API_ROUTES.admin.passagers.details(id)),
  updatePassengerStatus: (id, status) => apiClient.patch(API_ROUTES.admin.passagers.statut(id), { statut: status }),

  // Gestion des chauffeurs
  getDrivers: (params) => apiClient.get(API_ROUTES.admin.chauffeurs.list, { params }),
  getDriverStats: () => apiClient.get(API_ROUTES.admin.chauffeurs.stats),
  getDriverDetails: (id) => apiClient.get(API_ROUTES.admin.chauffeurs.details(id)),
  updateDriverStatus: (id, status) => apiClient.put(API_ROUTES.admin.chauffeurs.statut(id), { statut: status }),
};
