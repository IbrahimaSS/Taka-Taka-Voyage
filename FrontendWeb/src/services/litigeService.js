import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

export const litigeService = {
    // Créer un litige
    creerLitige: (data) => apiClient.post(API_ROUTES.litiges.creer, data),

    // Méthodes admin déjà existantes via adminService mais on peut les centraliser ici si besoin
    admin: {
        getStats: () => apiClient.get(API_ROUTES.admin.litiges.stats),
        getList: (params) => apiClient.get(API_ROUTES.admin.litiges.list, { params }),
        getDetails: (id) => apiClient.get(API_ROUTES.admin.litiges.details(id)),
        resoudre: (id) => apiClient.patch(API_ROUTES.admin.litiges.resoudre(id)),
        rejeter: (id) => apiClient.patch(API_ROUTES.admin.litiges.rejeter(id)),
    }
};
