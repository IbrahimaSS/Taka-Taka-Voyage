const express = require("express");
const router = express.Router();

// Middlewares
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

// Controller PASSAGER uniquement
const passagerController = require("../../controllers/admin/passagerControllers");

//=====================================PASSAGER=====================================

//Listes des Users
router.get(
    "/utilisateurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.listeUtilisateurs
);
//Cards (Stats)
router.get(
    "/utilisateurs/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.statsUtilisateurs
);
//Détails d'un Passager
router.get(
    "/utilisateurs/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.detailUtilisateur
);
//Activer - Désactiver - Suspendre un Compte
router.patch(
    "/utilisateurs/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.changerStatutUtilisateur
);

module.exports = router;