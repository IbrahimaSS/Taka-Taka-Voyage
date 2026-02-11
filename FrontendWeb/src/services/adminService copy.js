import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Admin
export const adminService = {
  dashboard: () => apiClient.get(API_ROUTES.admin.dashboard),
  getDashboardStats: () => apiClient.get(API_ROUTES.admin.dashboard),
  getRecentTrips: () => apiClient.get(API_ROUTES.admin.trajetsRecents),
  validations: (params) => apiClient.get(API_ROUTES.admin.validations.demandes, { params }),
  getPendingValidations: (limit = 5) => apiClient.get(API_ROUTES.admin.validations.demandes, { params: { statut: 'EN_ATTENTE', limit } }),
  validateDriver: (id, payload) => apiClient.patch(API_ROUTES.admin.validations.valider(id), payload),
  reports: (params) => apiClient.get(API_ROUTES.admin.reports.list, { params }),
};
