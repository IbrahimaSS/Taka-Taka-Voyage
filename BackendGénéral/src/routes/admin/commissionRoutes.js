const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const commissionController = require("../../controllers/admin/commissionControllers");


// ================================COMMISSIONS========================================
//Cards Commissions
router.get(
    "/commissions/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.statsCommissions
);
//Evolutions des Commissions
router.get(
    "/commissions/evolution",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.evolutionCommissions
);
//Répartition par Services
router.get(
    "/commissions/repartition",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.repartitionCommissions
);
//Listes des Commissions
router.get(
    "/commissions/chauffeurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.listeChauffeursAPayer
);
//Traiter un Paiement lié à une Commission
router.patch(
    "/paiements/:paiementId/traiter",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.traiterPaiement
);
//Détails d'un Paiement lié à une Commission
router.get(
    "/paiements/:paiementId/details",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.detailsPaiementAdmin
);
//Modifier un Paiement
router.patch(
    "/paiements/:paiementId/modifier",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.modifierPaiement
);
//Total des Commissions ce mois
router.get(
    "/stats/commission-mois",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.commissionTotaleCeMois
);
//Total des Chauffeurs Payés
router.get(
    "/stats/chauffeurs-payes",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.chauffeursPayesCeMois
);

module.exports = router;
