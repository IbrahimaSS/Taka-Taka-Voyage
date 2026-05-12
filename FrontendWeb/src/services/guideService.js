import { apiClient } from './apiClient';

const guideService = {
  // Récupérer tous les guides (public)
  getAll: (categorie) => {
    const params = categorie ? { categorie } : {};
    return apiClient.get('/guides', { params });
  },

  // Créer un guide (admin)
  create: (formData) => {
    return apiClient.post('/guides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Modifier un guide (admin)
  update: (id, formData) => {
    return apiClient.put(`/guides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Supprimer un guide (admin)
  delete: (id) => {
    return apiClient.delete(`/guides/${id}`);
  },
};

export default guideService;
