const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const validationController = require("../../controllers/admin/validationControllers");


//===============================VALIDATIONS===========================================

//Démande de Validations
router.get(
    "/demande",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.listeDemandesValidation
);
//Cards des Validations
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.statsValidationChauffeurs
);
//Historiques des Validations
router.get(
    "/historique",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.historiqueValidations
);
//Valider un chauffeur
router.patch(
    "/:id/valider",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.validerChauffeur
);
//Rejeter un chauffeur
router.patch(
    "/:id/rejeter",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.rejeterChauffeur
);
//Détails de la validation d'un chauffeur
router.get(
    "/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.detailsChauffeurValidation
);

module.exports = router;
