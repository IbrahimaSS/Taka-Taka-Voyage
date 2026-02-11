import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Notifications
export const notificationService = {
  list: (params) => apiClient.get(API_ROUTES.notifications.list, { params }),
  markRead: (id) => apiClient.post(API_ROUTES.notifications.markRead(id)),
};
