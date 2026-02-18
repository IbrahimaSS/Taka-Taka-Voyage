import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

/**
 * Service pour la gestion des réservations planifiées (Planning)
 */
export const planningService = {
    /**
     * Lister les réservations planifiées avec filtres et pagination
     */
    getPlanning: async (params = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.passager.reservationsPlanifiees.planning, { params });
            return response.data;
        } catch (error) {
            console.error('Erreur service planning (list):', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Détails d'une réservation spécifique
     */
    getPlanningDetail: async (id) => {
        try {
            const response = await apiClient.get(API_ROUTES.passager.reservationsPlanifiees.planningDetail(id));
            return response.data;
        } catch (error) {
            console.error('Erreur service planning (detail):', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Annuler une réservation planifiée
     */
    cancelPlanning: async (id) => {
        try {
            const response = await apiClient.delete(API_ROUTES.passager.reservationsPlanifiees.annuler(id));
            return response.data;
        } catch (error) {
            console.error('Erreur service planning (cancel):', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Créer une réservation planifiée
     */
    createPlanning: async (data) => {
        try {
            const response = await apiClient.post(API_ROUTES.passager.reservationsPlanifiees.planifier, data);
            return response.data;
        } catch (error) {
            console.error('Erreur service planning (create):', error);
            throw error.response?.data || error.message;
        }
    }
};

export default planningService;
