const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

const chauffeurController = require("../../controllers/admin/chauffeurControllers");

//=======================================CHAUFFEURS==================================
//Cards
router.get(
    "/chauffeurs/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.statsChauffeurs
);
//Listes des Users
router.get(
    "/chauffeurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.listeChauffeurs
);
//Détails d'un Users
router.get(
    "/chauffeurs/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.detailChauffeur
);
//Statut d'un Chauffeur
router.put(
    "/chauffeurs/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.changerStatutChauffeur
);

module.exports = router;