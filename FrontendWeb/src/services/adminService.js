import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Admin
export const adminService = {
  dashboard: () => apiClient.get(API_ROUTES.admin.dashboard),
  validations: (params) => apiClient.get(API_ROUTES.admin.validations, { params }),
  validateDriver: (id, payload) => apiClient.post(API_ROUTES.admin.validateDriver(id), payload),
  reports: (params) => apiClient.get(API_ROUTES.admin.reports, { params }),
};
