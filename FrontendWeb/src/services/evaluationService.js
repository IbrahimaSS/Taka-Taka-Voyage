import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

/**
 * Service pour la gestion des évaluations des trajets
 */
const evaluationService = {
    /**
     * Soumet une nouvelle évaluation pour un trajet
     * @param {Object} evaluationData - Les données de l'évaluation
     */
    creerEvaluation: async (evaluationData) => {
        try {
            const response = await apiClient.post(API_ROUTES.passager.evaluations.base, evaluationData);
            return response.data;
        } catch (error) {
            console.error('Erreur service evaluation:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Récupère les stats d'évaluation du passager
     */
    getStats: async () => {
        try {
            const response = await apiClient.get(API_ROUTES.passager.evaluations.stats);
            return response.data;
        } catch (error) {
            console.error('Erreur stats evaluation:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Récupère la liste des évaluations données par le passager
     * @param {Object} params - Filtres (page, limit, note)
     */
    getPassagerEvaluations: async (params = {}) => {
        try {
            const response = await apiClient.get(API_ROUTES.passager.evaluations.passager, { params });
            return response.data;
        } catch (error) {
            console.error('Erreur lister evaluations passager:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default evaluationService;
