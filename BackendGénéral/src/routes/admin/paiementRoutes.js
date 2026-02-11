const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const paiementController = require("../../controllers/admin/paiementControllers");


// ===========================PAIEMENTS=========================================

//Cards Paiements
router.get(
    "/paiements/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.statsPaiements
);
//Cards Paiements
router.get(
    "/paiements/evolution",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.evolutionPaiements
);
//Répartition Paiements
router.get(
    "/paiements/repartition",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.repartitionPaiements
);
//Répartition Paiements par Type
router.get(
    "/paiements/repartition-type",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.repartitionRevenusParType
);
//Listes des Paiements
router.get(
    "/paiements",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.listePaiements
);
//Détails d'un Paiement
router.get(
    "/paiements/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.detailsPaiement
);

module.exports = router;