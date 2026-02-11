import { apiClient } from './apiClient';

/**
 * Service pour la gestion des évaluations des trajets
 */
const evaluationService = {
    /**
     * Soumet une nouvelle évaluation pour un trajet
     * @param {Object} evaluationData - Les données de l'évaluation
     * @param {string} evaluationData.reservationId - ID de la réservation
     * @param {number} evaluationData.noteGlobale - Note de 1 à 5
     * @param {Object} evaluationData.details - Détails optionnels (conduite, ponctualité, etc.)
     * @param {string} evaluationData.ressenti - Ressenti global (EXCELLENT, etc.)
     * @param {Array<string>} evaluationData.pointsForts - Points forts sélectionnés
     * @param {string} evaluationData.commentaire - Commentaire libre
     * @returns {Promise<Object>}
     */
    creerEvaluation: async (evaluationData) => {
        try {
            const response = await apiClient.post('/passager/evaluations', evaluationData);
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
            const response = await apiClient.get('/passager/evaluations/passager/stats');
            return response.data;
        } catch (error) {
            console.error('Erreur stats evaluation:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default evaluationService;
