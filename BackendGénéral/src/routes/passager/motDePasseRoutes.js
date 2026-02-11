const express = require("express");
const router = express.Router();

const { changerMotDePasse } = require("../../controllers/passager/motDePasseControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

// 🔐 Changer mot de passe
router.put(
    "/mot-de-passe",
    verifierToken,
    verifierStatutActif,
    changerMotDePasse
);

module.exports = router;
