import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Passagers
export const passengerService = {
  list: (params) => apiClient.get(API_ROUTES.passengers.list, { params }),
  details: (id) => apiClient.get(API_ROUTES.passengers.details(id)),
};
