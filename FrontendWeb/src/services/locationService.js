import { apiClient } from './apiClient';

/**
 * Service pour la gestion de la flotte de location Baraka Trans
 */
export const locationService = {
  // --- ADMIN : Gestion de la flotte ---

  /**
   * Lister tous les véhicules (avec filtres optionnels)
   */
  getVehicules: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/locations/vehicules', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Ajouter un nouveau véhicule
   */
  ajouterVehicule: async (donnees) => {
    try {
      const response = await apiClient.post('/admin/locations/vehicules', donnees);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Modifier un véhicule existant
   */
  modifierVehicule: async (id, donnees) => {
    try {
      const response = await apiClient.put(`/admin/locations/vehicules/${id}`, donnees);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer un véhicule
   */
  supprimerVehicule: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/locations/vehicules/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtenir un véhicule par son ID
   */
  getVehiculeById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/locations/vehicules/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- PUBLIC : Consultation pour les clients ---

  /**
   * Lister les véhicules disponibles pour le public
   */
  getVehiculesPublics: async (params = {}) => {
    try {
      const response = await apiClient.get('/public/locations/vehicules', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- PASSAGER : Réservations ---

  /**
   * Créer une demande de réservation de location
   * @param {Object} data { vehiculeId, date_debut, date_fin, type_usage }
   */
  reserverVehicule: async (data) => {
    try {
      const response = await apiClient.post('/public/locations/reserver', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtenir les réservations du passager connecté
   */
  getMesReservations: async () => {
    try {
      const response = await apiClient.get('/public/locations/mes-reservations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Signaler le retour d'un véhicule (Passager)
   */
  signalerRetour: async (id) => {
    try {
      const response = await apiClient.post(`/public/locations/${id}/signaler-retour`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- ADMIN : Gestion des réservations ---

  /**
   * Lister toutes les réservations (Admin)
   */
  getReservations: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/locations/reservations', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Approuver une réservation (Admin)
   */
  approuverReservation: async (id) => {
    try {
      const response = await apiClient.put(`/admin/locations/reservations/${id}/approuver`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Refuser une réservation et rembourser la caution (Admin)
   */
  refuserReservation: async (id, motif = '') => {
    try {
      const response = await apiClient.put(`/admin/locations/reservations/${id}/refuser`, { motif });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Démarrer une location (Admin)
   */
  demarrerLocation: async (id) => {
    try {
      const response = await apiClient.put(`/admin/locations/reservations/${id}/demarrer`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Confirmer le retour d'un véhicule (Admin)
   */
  confirmerRetour: async (id) => {
    try {
      const response = await apiClient.put(`/admin/locations/reservations/${id}/confirmer-retour`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer une réservation (Admin)
   */
  supprimerReservation: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/locations/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
