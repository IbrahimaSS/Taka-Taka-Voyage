const express = require("express");
const router = express.Router();
const walletControllers = require("../../controllers/common/walletControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

// 🏦 Routes du Portefeuille TakaTaka

// Consulter le solde
router.get("/solde", verifierToken, walletControllers.getSolde);

// Obtenir l'historique complet des transactions
router.get("/historique", verifierToken, walletControllers.getHistorique);

// Effectuer un dépôt (Recharge)
router.post("/depoter", verifierToken, walletControllers.recharger);

// Demander l'envoi d'un code OTP pour retrait
router.post("/envoyer-otp", verifierToken, walletControllers.envoyerCodeRetrait);

// Demander un retrait (Cash-out vers OM/MTN)
router.post("/retirer", verifierToken, walletControllers.demanderRetrait);

// Transférer de l'argent à un ami
router.post("/transferer", verifierToken, walletControllers.transferer);

module.exports = router;
