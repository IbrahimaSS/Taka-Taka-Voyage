const express = require("express");
const router = express.Router();

const paiementController = require("../../controllers/passager/paiementsControllers");
const auth = require("../../middlewares/authMiddlewares");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const {verifierStatutActif} = require("../../middlewares/statutMiddlewares");

// 🔹 INITIER PAIEMENT
router.post(
    "/payer",
    verifierToken,
    verifierStatutActif,
    paiementController.initierPaiement
);


module.exports = router;
