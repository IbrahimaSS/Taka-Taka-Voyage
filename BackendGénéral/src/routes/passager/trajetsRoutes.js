const express = require("express");
const router = express.Router();

const { listerTrajetsPassager, detailTrajetPassager } = require("../../controllers/passager/trajetsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

// Historique des trajets passager (pagination)
router.get(
    "/trajets",
    verifierToken,
    verifierStatutActif,
    listerTrajetsPassager
);

// Détails d’un trajet
router.get(
    "/trajets/:trajetId",
    verifierToken,
    verifierStatutActif,
    detailTrajetPassager
);

module.exports = router;
