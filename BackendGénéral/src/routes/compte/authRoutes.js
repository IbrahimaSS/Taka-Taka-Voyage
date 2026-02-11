const express = require("express");
const router = express.Router();

const authController = require("../../controllers/compte/authControllers");
const { validerConnexion } = require("../../validators/connexionValidators");
const { validerInscription } = require("../../validators/inscriptionValidators");

// Initialisation inscription + génération OTP
router.post("/init-inscription", validerInscription, authController.initInscription);

// Vérification OTP
router.post("/verifier-otp", authController.verifierOtp);

// Finalisation inscription (création utilisateur)
router.post(
    "/finaliser-inscription",
    validerInscription,
    authController.finaliserInscription
);

// Connexion
router.post("/connexion", validerConnexion, authController.connexion);

// Récupérer l'utilisateur connecté
const { verifierToken } = require("../../middlewares/authMiddlewares");
router.get("/me", verifierToken, authController.getMe);

// Déconnexion (suppression du cookie)
router.post("/logout", authController.logout);

module.exports = router;
