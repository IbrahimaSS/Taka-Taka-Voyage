import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

// Wrapper API Admin
export const adminService = {
  dashboard: () => apiClient.get(API_ROUTES.admin.dashboard),
  getDashboardStats: () => apiClient.get(API_ROUTES.admin.dashboard),
  getRecentTrips: () => apiClient.get(API_ROUTES.admin.trajetsRecents),
  getMonthlyRevenue: (params) => apiClient.get(API_ROUTES.admin.paiements.evolution, { params }),
  getRevenueByVehicleType: () => apiClient.get(API_ROUTES.admin.paiements.repartitionType),
  getPaymentStats: () => apiClient.get(API_ROUTES.admin.paiements.stats),
  getPaymentRepartition: () => apiClient.get(API_ROUTES.admin.paiements.repartition),
  getPaymentList: (params) => apiClient.get(API_ROUTES.admin.paiements.list, { params }),
  getPaymentDetails: (id) => apiClient.get(API_ROUTES.admin.paiements.details(id)),

  // Gestion des trajets
  getTrips: (params) => apiClient.get(API_ROUTES.admin.trajets.list, { params }),
  getTripStats: () => apiClient.get(API_ROUTES.admin.trajets.stats),
  getTripMap: () => apiClient.get(API_ROUTES.admin.trajets.map),
  getTripDetails: (id) => apiClient.get(API_ROUTES.admin.trajets.details(id)),

  // Validations
  getValidationStats: () => apiClient.get(API_ROUTES.admin.validations.stats),
  getValidationHistory: (params) => apiClient.get(API_ROUTES.admin.validations.historique, { params }),
  getValidationDetails: (id) => apiClient.get(API_ROUTES.admin.validations.details(id)),
  validations: (params) => apiClient.get(API_ROUTES.admin.validations.demandes, { params }),
  getPendingValidations: (limit = 5) => apiClient.get(API_ROUTES.admin.validations.demandes, { params: { statut: 'EN_ATTENTE', limit } }),
  validateDriver: (id, payload) => apiClient.patch(API_ROUTES.admin.validations.valider(id), payload),
  rejectDriver: (id, payload) => apiClient.patch(API_ROUTES.admin.validations.rejeter(id), payload),

  // Documents
  getDocumentStats: () => apiClient.get(API_ROUTES.admin.documents.stats),
  getDocuments: (params) => apiClient.get(API_ROUTES.admin.documents.list, { params }),
  getChauffeursDocuments: (params) => apiClient.get(API_ROUTES.admin.documents.listChauffeurs, { params }),
  updateDocumentStatus: (id, statut, commentaire) => apiClient.patch(API_ROUTES.admin.documents.statut(id), { statut, commentaire }),
  getDriverDocuments: (id) => apiClient.get(API_ROUTES.admin.documents.chauffeurDocuments(id)),

  // Rapports
  getReportStats: () => apiClient.get(API_ROUTES.admin.rapports.stats),
  getReportActivity: () => apiClient.get(API_ROUTES.admin.rapports.activite),
  getReportRepartition: (params) => apiClient.get(API_ROUTES.admin.rapports.repartition, { params }),
  getReports: (params) => apiClient.get(API_ROUTES.admin.rapports.list, { params }),
  createReport: (data) => apiClient.post(API_ROUTES.admin.rapports.create, data),
  getReportDetails: (id) => apiClient.get(API_ROUTES.admin.rapports.details(id)),
  deleteReport: (id) => apiClient.delete(API_ROUTES.admin.rapports.details(id)),
  incrementReportDownload: (id) => apiClient.patch(API_ROUTES.admin.rapports.download(id)),

  // Gestion des passagers
  getPassengers: (params) => apiClient.get(API_ROUTES.admin.passagers.list, { params }),
  getPassengerStats: () => apiClient.get(API_ROUTES.admin.passagers.stats),
  getPassengerDetails: (id) => apiClient.get(API_ROUTES.admin.passagers.details(id)),
  updatePassengerStatus: (id, status) => apiClient.patch(API_ROUTES.admin.passagers.statut(id), { statut: status }),

  // Gestion des chauffeurs
  getDrivers: (params) => apiClient.get(API_ROUTES.admin.chauffeurs.list, { params }),
  getDriverStats: () => apiClient.get(API_ROUTES.admin.chauffeurs.stats),
  getDriverDetails: (id) => apiClient.get(API_ROUTES.admin.chauffeurs.details(id)),
  updateDriverStatus: (id, status) => apiClient.put(API_ROUTES.admin.chauffeurs.statut(id), { statut: status }),
  getDriverTripHistory: (id, params) => apiClient.get(API_ROUTES.admin.trajets.list, { params: { ...params, chauffeur: id } }),

  // Commissions
  getCommissionStats: () => apiClient.get(API_ROUTES.admin.commissions.stats),
  getCommissionEvolution: (params) => apiClient.get(API_ROUTES.admin.commissions.evolution, { params }),
  getCommissionRepartition: () => apiClient.get(API_ROUTES.admin.commissions.repartition),
  getCommissionList: (params) => apiClient.get(API_ROUTES.admin.commissions.chauffeurs, { params }),
  processCommissionPayment: (id, commentaire) => apiClient.patch(API_ROUTES.admin.commissions.traiterPaiement(id), { commentaire }),
  getCommissionDetails: (id) => apiClient.get(API_ROUTES.admin.commissions.detailsPaiement(id)),
  editCommissionPayment: (id, data) => apiClient.patch(API_ROUTES.admin.commissions.modifierPaiement(id), data),

  // Gestion du personnel
  getPersonnels: () => apiClient.get(API_ROUTES.admin.personnels.list),
  createPersonnel: (data) => apiClient.post(API_ROUTES.admin.personnels.create, data),
  getPersonnelDetails: (id) => apiClient.get(API_ROUTES.admin.personnels.details(id)),
  updatePersonnel: (id, data) => apiClient.put(API_ROUTES.admin.personnels.update(id), data),
  deletePersonnel: (id) => apiClient.delete(API_ROUTES.admin.personnels.delete(id)),
  togglePersonnelStatus: (id) => apiClient.put(API_ROUTES.admin.personnels.toggleStatus(id)),

  // Paramètres de la plateforme
  getParametres: () => apiClient.get(API_ROUTES.admin.parametres),
  updateParametres: (data) => apiClient.patch(API_ROUTES.admin.parametres, data),
};
