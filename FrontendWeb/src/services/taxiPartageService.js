// src/services/taxiPartageService.js
// Service API pour le module Taxi Partagé — interface avec le backend
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

class TaxiPartageApiService {
    // ==================== GROUPES ====================

    /**
     * Créer un groupe de taxi partagé (1ère réservation acceptée)
     */
    async creerGroupe(reservationId) {
        return apiClient.post(API_ROUTES.taxiPartage.creerGroupe, { reservationId });
    }

    /**
     * Ajouter un passager à un groupe existant
     */
    async ajouterPassager(groupeId, reservationId) {
        return apiClient.post(API_ROUTES.taxiPartage.ajouterPassager(groupeId), {
            groupeId,
            reservationId,
        });
    }

    /**
     * Obtenir les détails d'un groupe
     */
    async getDetailsGroupe(groupeId) {
        return apiClient.get(API_ROUTES.taxiPartage.detailsGroupe(groupeId));
    }

    /**
     * Obtenir la file de ramassage du chauffeur
     */
    async getFileRamassage() {
        return apiClient.get(API_ROUTES.taxiPartage.fileRamassage);
    }

    /**
     * Obtenir les groupes actifs du chauffeur
     */
    async getGroupesActifs() {
        return apiClient.get(API_ROUTES.taxiPartage.groupesActifs);
    }

    // ==================== VALIDATION ====================

    /**
     * Vérifier si le trajet peut démarrer (BACKEND OBLIGATOIRE)
     */
    async peutDemarrer(groupeId) {
        return apiClient.get(API_ROUTES.taxiPartage.peutDemarrer(groupeId));
    }

    // ==================== ACTIONS PASSAGERS ====================

    /**
     * Passer un passager en "en cours de ramassage"
     */
    async enRoutePassager(reservationId) {
        return apiClient.post(API_ROUTES.taxiPartage.enRoutePassager(reservationId));
    }

    /**
     * Signaler l'arrivée et le ramassage d'un passager
     */
    async arriveePassager(reservationId) {
        return apiClient.post(API_ROUTES.taxiPartage.arriveePassager(reservationId));
    }

    // ==================== TRAJET ====================

    /**
     * Démarrer le trajet pour tout le groupe
     */
    async demarrerTrajet(groupeId) {
        return apiClient.post(API_ROUTES.taxiPartage.demarrerTrajet(groupeId));
    }

    /**
     * Terminer le trajet du groupe
     */
    async terminerTrajet(groupeId) {
        return apiClient.post(API_ROUTES.taxiPartage.terminerTrajet(groupeId));
    }
}

export const taxiPartageApiService = new TaxiPartageApiService();
export default taxiPartageApiService;
