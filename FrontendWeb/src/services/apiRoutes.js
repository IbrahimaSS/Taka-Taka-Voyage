// Carte centralisee des routes API (alignées sur le backend)

export const API_ROUTES = {
  // ===================== AUTH =====================
  auth: {
    initInscription: "/auth/init-inscription",
    verifyOtp: "/auth/verifier-otp",
    finaliserInscription: "/auth/finaliser-inscription",
    login: "/auth/connexion",
    me: "/auth/me",
    logout: "/auth/logout"
  },

  // ===================== PASSAGER =====================
  passager: {
    estimationTrajet: "/estimations/estimer-trajet",
    reservationImmediate: "/reservations-immediate/confirmer-immediate",
    paiementInitier: "/paiements/payer",
    reservationsPlanifiees: {
      planifier: "/passager/reservations-planifiees/planifier",
      planning: "/passager/reservations-planifiees/planning",
      planningDetail: (id) => `/passager/reservations-planifiees/planning/${id}`,
      modifier: (id) => `/passager/reservations-planifiees/planning/${id}`,
      annuler: (id) => `/passager/reservations-planifiees/planning/${id}`,
    },
    trajets: {
      list: "/passager/trajets",
      details: (id) => `/passager/trajets/${id}`,
    },
    paiements: {
      stats: "/passager/paiements/stats",
      list: "/passager/paiements/paiements",
      details: (id) => `/passager/paiements/${id}`,
    },
    profil: {
      get: "/passager/profile/profil",
      update: "/passager/profile/profil",
      preferences: "/passager/profile/preferences",
    },
    motDePasse: "/passager/mot-de-passe",
    notifications: "/passager/notifications",
  },

  // ===================== ADMIN =====================
  admin: {
    dashboard: "/admin/dashboard",
    trajetsRecents: "/admin/trajets/recents",

    passagers: {
      list: "/admin/utilisateurs",
      stats: "/admin/utilisateurs/stats",
      details: (id) => `/admin/utilisateurs/${id}`,
      statut: (id) => `/admin/utilisateurs/${id}/statut`,
    },
    chauffeurs: {
      stats: "/admin/chauffeurs/stats",
      list: "/admin/chauffeurs",
      details: (id) => `/admin/chauffeurs/${id}`,
      statut: (id) => `/admin/chauffeurs/${id}/statut`,
    },
    validations: {
      demandes: "/admin/chauffeurs/validation/demande",
      stats: "/admin/chauffeurs/validation/stats",
      historique: "/admin/chauffeurs/validations/historique",
      valider: (id) => `/admin/chauffeurs/validation/${id}/valider`,
      rejeter: (id) => `/admin/chauffeurs/validation/${id}/rejeter`,
      details: (id) => `/admin/chauffeurs/validation/${id}`,
    },
    documents: {
      stats: "/admin/documents/stats",
      list: "/admin/documents",
      statut: (id) => `/admin/documents/${id}/statut`,
      chauffeurDocuments: (id) => `/admin/chauffeurs/${id}/documents/`,
    },
    trajets: {
      stats: "/admin/trajets/stats",
      map: "/admin/trajets/map",
      list: "/admin/trajets",
      details: (id) => `/admin/trajets/${id}`,
    },
    paiements: {
      stats: "/admin/paiements/stats",
      evolution: "/admin/paiements/evolution",
      repartition: "/admin/paiements/repartition",
      repartitionType: "/admin/paiements/repartition-type",
      list: "/admin/paiements",
      details: (id) => `/admin/paiements/${id}`,
    },
    commissions: {
      stats: "/admin/commissions/stats",
      evolution: "/admin/commissions/evolution",
      repartition: "/admin/commissions/repartition",
      chauffeurs: "/admin/commissions/chauffeurs",
      traiterPaiement: (id) => `/admin/paiements/${id}/traiter`,
      detailsPaiement: (id) => `/admin/paiements/${id}/details`,
      modifierPaiement: (id) => `/admin/paiements/${id}/modifier`,
      statsMois: "/admin/stats/commission-mois",
      statsChauffeursPayes: "/admin/stats/chauffeurs-payes",
    },
    litiges: {
      stats: "/admin/litiges/stats",
      list: "/admin/litiges",
      details: (id) => `/admin/litiges/${id}`,
      resoudre: (id) => `/admin/litiges/${id}/resoudre`,
      rejeter: (id) => `/admin/litiges/${id}/rejeter`,
      repartitionTypes: "/admin/litiges/repartition/types",
    },
    rapports: {
      stats: "/admin/stats/rapports",
      activite: "/admin/rapports/stats/activite",
      repartition: "/admin/analyses/repartition/",
      list: "/admin/rapports",
      create: "/admin/rapports",
      details: (id) => `/admin/rapports/${id}`,
    },
    profile: {
      get: "/admin/profile",
      update: "/admin/profile",
      activites: "/admin/profile/activites",
      stats: "/admin/profile/stats",
    },
    security: {
      password: "/admin/security/password",
    },
  },

  // ===================== CHAUFFEUR =====================
  chauffeur: {
    documents: "/chauffeur/documents",
    vehicule: "/chauffeur/vehicule",
    profile: {
      get: "/chauffeur/profile",
      update: "/chauffeur/profile",
      motDePasse: "/chauffeur/mot-de-passe",
    },
  },

  // ===================== UPLOADS =====================
  uploads: {
    base: "/uploads",
  },
};

