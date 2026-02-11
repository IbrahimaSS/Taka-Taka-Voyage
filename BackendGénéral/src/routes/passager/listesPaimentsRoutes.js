const express = require("express");
const router = express.Router();

const {
    listerPaiementsPassager,
    detailPaiementPassager,
    statsPaiementsPassager,
} = require("../../controllers/passager/listesPaiementsControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");


router.get(
    "/stats",
    verifierToken,
    verifierStatutActif,
    statsPaiementsPassager
);

// Historique des paiements passager
router.get(
    "/paiements",
    verifierToken,
    verifierStatutActif,
    listerPaiementsPassager
);

// 🔍 Détail d’un paiement
router.get(
    "/:paiementId",
    verifierToken,
    verifierStatutActif,
    detailPaiementPassager
);



module.exports = router;
