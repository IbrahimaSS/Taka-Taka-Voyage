const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const rapportController = require("../../controllers/admin/rapportControllers");


//=======================================RAPORTS===================================
router.get(
    "/stats/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.statsRapportsVersements
);
//Génération des Activités
router.get(
    "/rapports/stats/activite",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.activiteGenerationRapports
);
//Répartition des Rapprots
router.get(
    "/analyses/repartition/",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.repartitionAnalyses
);
//Listes des Rapports
router.get(
    "/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.listeRapports
);
//Créer un Rapport
router.post(
    "/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.creerRapport
);
router.get(
    "/rapports/:rapportId",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.detailsRapport
);

module.exports = router;