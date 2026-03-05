/**
 * 🤖 AI Action Executor — Agent IA Exécuteur Taka-Taka
 * 
 * Ce module gère l'exécution des actions demandées par l'IA.
 * Il valide les conditions métier avant chaque exécution.
 */

const Reservation = require("../models/Reservations");
const Parametres = require("../models/ParametresPlateforme");
const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");

// ═══════════════════════════════════════════════
// CARTE DES ACTIONS SUPPORTÉES
// ═══════════════════════════════════════════════
const ACTION_MAP = {
    demarrer_trajet: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Démarrer le trajet avec le passager"
    },
    terminer_trajet: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: true,
        description: "Terminer le trajet (arrivée à destination)"
    },
    signaler_arrivee: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Signaler l'arrivée au point de récupération"
    },
    rejoindre_course: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Indiquer que vous êtes en route vers le passager"
    },
    demarrer_groupe: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Démarrer le trajet du groupe (taxi partagé)"
    },
    activer_maintenance: {
        roles: ["ADMIN"],
        needsConfirmation: true,
        description: "Activer le mode maintenance"
    },
    desactiver_maintenance: {
        roles: ["ADMIN"],
        needsConfirmation: true,
        description: "Désactiver le mode maintenance"
    },
    changer_langue: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Changer la langue de l'application"
    },
    changer_theme: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Changer le thème (clair/sombre)"
    },
    passer_en_ligne: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Passer en ligne pour recevoir des courses"
    },
    passer_hors_ligne: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Passer hors ligne"
    },
    annuler_reservation: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: true,
        description: "Annuler la réservation actuelle"
    },
    accepter_demande: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Accepter la demande de course la plus récente"
    },
    refuser_demande: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Refuser la demande de course la plus récente"
    },
    deconnexion: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: true,
        description: "Se déconnecter de l'application"
    },
    voir_mon_solde: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: false,
        description: "Consulter ses revenus ou son solde"
    },
    confirmer_paiement: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: true,
        description: "Confirmer la réception du paiement en espèces"
    },
    rechercher_taxi: {
        roles: ["PASSAGER"],
        needsConfirmation: false,
        description: "Ouvrir l'écran de réservation"
    },
    voir_planning: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: false,
        description: "Voir le planning de trajets"
    },
    voir_historique: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: false,
        description: "Voir l'historique des trajets"
    },
    voir_profil: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Voir le profil utilisateur"
    },
    voir_parametres: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Voir les paramètres"
    },
    voir_support: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Ouvrir le support client"
    },
    voir_evaluations: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: false,
        description: "Voir les avis et notes"
    },
    voir_mon_vehicule: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Voir les informations du véhicule"
    },
    bouton_sos: {
        roles: ["CHAUFFEUR", "PASSAGER"],
        needsConfirmation: true,
        description: "DÉCLENCHER UNE ALERTE SOS"
    },
    contacter_chauffeur: {
        roles: ["PASSAGER"],
        needsConfirmation: false,
        description: "Appeler le chauffeur du trajet en cours"
    },
    confirmer_ramassage: {
        roles: ["CHAUFFEUR"],
        needsConfirmation: false,
        description: "Confirmer la récupération d'un passager"
    },
    // --- ACTIONS ADMIN ---
    voir_admin_dashboard: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_utilisateurs: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_chauffeurs: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_trajets: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_paiements: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_validations: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_litiges: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_documents: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_rapports: { roles: ["ADMIN"], needsConfirmation: false },
    voir_admin_commissions: { roles: ["ADMIN"], needsConfirmation: false },

    identite_ia: {
        roles: ["CHAUFFEUR", "PASSAGER", "ADMIN"],
        needsConfirmation: false,
        description: "Identité de l'assistant"
    }
};

// ═══════════════════════════════════════════════
// VALIDATIONS MÉTIER
// ═══════════════════════════════════════════════

async function validerDemarrerTrajet(userId, params) {
    const reservation = await Reservation.findOne({
        chauffeur: userId,
        statut: { $in: ["ACCEPTEE", "EN_ATTENTE_DE_RECUPERATION", "RECUPERE"] }
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucun trajet actif trouvé. Vous devez d'abord accepter une course." };
    }

    // Vérifier si tous les passagers sont récupérés pour un taxi partagé
    if (reservation.typeCourse === "TAXI_PARTAGE" && reservation.groupeId) {
        const groupe = await GroupeTaxiPartage.findById(reservation.groupeId);
        if (groupe) {
            const nonRecuperes = groupe.passagers?.filter(p => p.statut !== "RECUPERE" && p.statut !== "ANNULE") || [];
            if (nonRecuperes.length > 0) {
                return {
                    ok: false,
                    raison: `Impossible de démarrer. ${nonRecuperes.length} passager(s) n'ont pas encore été récupérés. Vous devez les récupérer d'abord.`
                };
            }
        }
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

async function validerTerminerTrajet(userId) {
    const reservation = await Reservation.findOne({
        chauffeur: userId,
        statut: "EN_COURS"
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucun trajet en cours. Le trajet doit être démarré avant de pouvoir le terminer." };
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

async function validerSignalerArrivee(userId) {
    const reservation = await Reservation.findOne({
        chauffeur: userId,
        statut: { $in: ["ACCEPTEE", "EN_ATTENTE_DE_RECUPERATION"] }
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucune course en approche. Vous devez d'abord être en route vers un passager." };
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

async function validerRejoindre(userId) {
    const reservation = await Reservation.findOne({
        chauffeur: userId,
        statut: { $in: ["ACCEPTEE", "EN_ATTENTE_DE_RECUPERATION"] }
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucune course à rejoindre. Acceptez d'abord une demande de course." };
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

async function validerDemarrerGroupe(userId) {
    const groupe = await GroupeTaxiPartage.findOne({
        chauffeur: userId,
        statut: { $in: ["EN_COURS_DE_RAMASSAGE", "EN_ATTENTE"] }
    }).sort({ updatedAt: -1 });

    if (!groupe) {
        return { ok: false, raison: "Aucun groupe de taxi partagé actif trouvé." };
    }

    const nonRecuperes = groupe.passagers?.filter(p => p.statut !== "RECUPERE" && p.statut !== "ANNULE") || [];
    if (nonRecuperes.length > 0) {
        return {
            ok: false,
            raison: `Impossible de démarrer le trajet. ${nonRecuperes.length} passager(s) ne sont pas encore récupérés.`
        };
    }

    return { ok: true, groupeId: groupe._id.toString() };
}

async function validerAnnulerReservation(userId, userRole) {
    const filter = userRole === "CHAUFFEUR" ? { chauffeur: userId } : { passager: userId };
    const reservation = await Reservation.findOne({
        ...filter,
        statut: { $in: ["EN_ATTENTE", "ACCEPTEE", "EN_ATTENTE_DE_RECUPERATION", "ARRIVE", "EN_COURS_DE_RECUPERATION"] }
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucune réservation active à annuler." };
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

async function validerConfirmerPaiement(userId) {
    const reservation = await Reservation.findOne({
        chauffeur: userId,
        statut: "EN_COURS",
        "paiement.methode": "CASH",
        "paiement.statut": { $ne: "PAYE" }
    }).sort({ updatedAt: -1 });

    if (!reservation) {
        return { ok: false, raison: "Aucun paiement en espèces en attente de confirmation pour le trajet actuel." };
    }

    return { ok: true, reservationId: reservation._id.toString() };
}

// ═══════════════════════════════════════════════
// FONCTION PRINCIPALE DE VALIDATION
// ═══════════════════════════════════════════════

async function validerAction(actionName, userId, userRole, params = {}) {
    const actionConfig = ACTION_MAP[actionName];

    if (!actionConfig) {
        return { ok: false, raison: `Action "${actionName}" non reconnue.` };
    }

    // Vérification du rôle
    if (!actionConfig.roles.includes(userRole)) {
        return { ok: false, raison: `Cette action est réservée aux ${actionConfig.roles.join(", ")}. Votre rôle actuel est ${userRole}.` };
    }

    // Validations métier spécifiques
    switch (actionName) {
        case "demarrer_trajet":
            return await validerDemarrerTrajet(userId, params);
        case "terminer_trajet":
            return await validerTerminerTrajet(userId);
        case "signaler_arrivee":
            return await validerSignalerArrivee(userId);
        case "rejoindre_course":
            return await validerRejoindre(userId);
        case "demarrer_groupe":
            return await validerDemarrerGroupe(userId);
        case "annuler_reservation":
            return await validerAnnulerReservation(userId, userRole);
        case "confirmer_paiement":
            return await validerConfirmerPaiement(userId);
        case "activer_maintenance":
        case "desactiver_maintenance":
        case "passer_en_ligne":
        case "passer_hors_ligne":
        case "accepter_demande":
        case "refuser_demande":
        case "deconnexion":
        case "voir_mon_solde":
        case "rechercher_taxi":
        case "voir_planning":
        case "voir_historique":
        case "voir_profil":
        case "voir_parametres":
        case "voir_support":
        case "voir_evaluations":
        case "voir_mon_vehicule":
        case "bouton_sos":
        case "contacter_chauffeur":
        case "confirmer_ramassage":
        case "voir_admin_dashboard":
        case "voir_admin_utilisateurs":
        case "voir_admin_chauffeurs":
        case "voir_admin_trajets":
        case "voir_admin_paiements":
        case "voir_admin_validations":
        case "voir_admin_litiges":
        case "voir_admin_documents":
        case "voir_admin_rapports":
        case "voir_admin_commissions":
        case "identite_ia":
        case "changer_langue":
        case "changer_theme":
            return { ok: true };
        default:
            return { ok: true };
    }
}

module.exports = {
    ACTION_MAP,
    validerAction
};
