/**
 * Service de gestion hors-ligne pour Taka-Taka.
 * Permet de sauvegarder l'état des trajets localement pour résister aux coupures réseau.
 */

const STORAGE_KEYS = {
    PASSAGER: 'taka_active_trip_passenger',
    CHAUFFEUR: 'taka_active_trip_driver'
};

export const offlineTripService = {
    /**
     * Sauvegarde l'état actuel pour un rôle donné
     */
    saveState: (role, state) => {
        try {
            const key = role === 'PASSAGER' ? STORAGE_KEYS.PASSAGER : STORAGE_KEYS.CHAUFFEUR;
            // On ajoute un timestamp pour savoir si la donnée est trop vieille
            const dataToSave = {
                state,
                updatedAt: new Date().getTime()
            };
            localStorage.setItem(key, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('[OFFLINE] Erreur sauvegarde local:', error);
        }
    },

    /**
     * Récupère l'état sauvegardé
     * @returns {Object|null} L'état ou null si rien n'est trouvé ou trop vieux (> 4h)
     */
    loadState: (role) => {
        try {
            const key = role === 'PASSAGER' ? STORAGE_KEYS.PASSAGER : STORAGE_KEYS.CHAUFFEUR;
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            const now = new Date().getTime();

            // Si la sauvegarde a plus de 4 heures, on considère qu'elle est obsolète
            if (now - parsed.updatedAt > 4 * 60 * 60 * 1000) {
                localStorage.removeItem(key);
                return null;
            }

            return parsed.state;
        } catch (error) {
            console.error('[OFFLINE] Erreur récupération local:', error);
            return null;
        }
    },

    /**
     * Nettoie les données après la fin d'un trajet
     */
    clearState: (role) => {
        const key = role === 'PASSAGER' ? STORAGE_KEYS.PASSAGER : STORAGE_KEYS.CHAUFFEUR;
        localStorage.removeItem(key);
    }
};
