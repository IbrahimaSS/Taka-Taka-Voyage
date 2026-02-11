import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Chauffeur (profil + documents)
export const chauffeurService = {
  updateVehicule: (payload) => apiClient.put(API_ROUTES.chauffeur.vehicule, payload),
  uploadDocuments: (formData) =>
    apiClient.post(API_ROUTES.chauffeur.documents, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
