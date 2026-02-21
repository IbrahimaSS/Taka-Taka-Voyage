const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const trajetController = require("../../controllers/admin/trajetControllers");


// ================================== TRAJETS ===================================
//Cards Trajets
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.statsTrajets
);
//Map (Carte)
router.get(
    "/map",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.trajetsCarte
);
//Listes des trajets
router.get(
    "/",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.tousLesTrajets
);
//Detail d'un trajet (👁️)
router.get(
    "/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.detailTrajet
);

module.exports = router;