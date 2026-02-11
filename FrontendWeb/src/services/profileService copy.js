import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

/**
 * Service pour la gestion du profil utilisateur
 * Gère les opérations CRUD sur le profil selon le rôle
 */
export const profileService = {
    // ===================== PASSAGER =====================
    passager: {
        getProfile: () => apiClient.get(API_ROUTES.passager.profil.get),
        updateProfile: (data) => apiClient.put(API_ROUTES.passager.profil.update, data),
        updatePreferences: (preferences) => apiClient.put(API_ROUTES.passager.profil.preferences, preferences),
        changePassword: (data) => apiClient.put(API_ROUTES.passager.motDePasse, data),
    },

    // ===================== ADMIN =====================
    admin: {
        getProfile: () => apiClient.get(API_ROUTES.admin.profile.get),
        updateProfile: (data) => apiClient.put(API_ROUTES.admin.profile.update, data),
        updateProfileWithPhoto: (formData) => apiClient.put(API_ROUTES.admin.profile.update, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        changePassword: (data) => apiClient.put(API_ROUTES.admin.security.password, data),
    },

    // ===================== CHAUFFEUR =====================
    chauffeur: {
        getProfile: () => apiClient.get(API_ROUTES.chauffeur.profile.get),
        updateProfile: (data) => apiClient.put(API_ROUTES.chauffeur.profile.update, data),
        updateProfileWithPhoto: (formData) => apiClient.put(API_ROUTES.chauffeur.profile.update, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    },

    // ===================== GÉNÉRIQUE (basé sur le rôle) =====================
    /**
     * Récupère le profil selon le rôle de l'utilisateur
     * @param {string} role - PASSAGER, ADMIN, CHAUFFEUR
     */
    getProfileByRole: (role) => {
        const roleUpper = role?.toUpperCase();
        switch (roleUpper) {
            case 'ADMIN':
                return profileService.admin.getProfile();
            case 'CHAUFFEUR':
            case 'DRIVER':
                return profileService.chauffeur.getProfile();
            case 'PASSAGER':
            case 'PASSENGER':
            default:
                return profileService.passager.getProfile();
        }
    },

    /**
     * Met à jour le profil selon le rôle
     * @param {string} role - PASSAGER, ADMIN, CHAUFFEUR
     * @param {object} data - Données du profil à mettre à jour
     */
    updateProfileByRole: (role, data) => {
        const roleUpper = role?.toUpperCase();
        switch (roleUpper) {
            case 'ADMIN':
                return profileService.admin.updateProfile(data);
            case 'CHAUFFEUR':
            case 'DRIVER':
                return profileService.chauffeur.updateProfile(data);
            case 'PASSAGER':
            case 'PASSENGER':
            default:
                return profileService.passager.updateProfile(data);
        }
    },

    /**
     * Change le mot de passe de l'utilisateur
     * @param {object} data - { ancienMotDePasse, nouveauMotDePasse }
     */
    changePassword: (data) => apiClient.put(API_ROUTES.admin.security.password, data),
};
