import { apiClient } from './apiClient';

/**
 * Service public pour récupérer les services de la plateforme
 * configurés par l'admin (tarifs, services activés/désactivés)
 */
export const platformService = {
    /**
     * Récupère tous les services configurés par l'admin.
     * Les services désactivés sont inclus avec enabled: false
     * pour permettre au frontend de les griser.
     */
    getServicesActifs: () => apiClient.get('/services-actifs'),
};
