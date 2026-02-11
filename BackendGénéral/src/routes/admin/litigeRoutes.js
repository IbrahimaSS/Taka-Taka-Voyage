const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const litigeController = require("../../controllers/admin/litigeControllers");


//=========================================LITIGES===================================

//Cards des Litiges
router.get(
    "/litiges/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.statsLitigesCards
);
//Listes des Litiges
router.get(
    "/litiges",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.listeLitiges
);
//Détails d'un Litige
router.get(
    "/litiges/:litigeId",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.detailsLitige
);
//Résoudre un Litige
router.patch(
    "/litiges/:litigeId/resoudre",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.resoudreLitige
);
//Réjéter un Litige
router.patch(
    "/litiges/:litigeId/rejeter",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.rejeterLitige
);
//Répartition par Type de Litiges
router.get(
    "/litiges/repartition/types",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.repartitionLitigesParType
);

module.exports = router;
