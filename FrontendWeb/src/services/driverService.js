import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Chauffeurs
export const driverService = {
  list: (params) => apiClient.get(API_ROUTES.drivers.list, { params }),
  nearby: (params) => apiClient.get(API_ROUTES.drivers.nearby, { params }),
  details: (id) => apiClient.get(API_ROUTES.drivers.details(id)),
  uploadDocuments: (id, payload) => apiClient.post(API_ROUTES.drivers.documents(id), payload),
  updateAvailability: (id, payload) => apiClient.post(API_ROUTES.drivers.availability(id), payload),
  updateLocation: (id, payload) => apiClient.post(API_ROUTES.drivers.location(id), payload),
};
