const express = require("express");
const router = express.Router();
const transactionControllers = require("../../controllers/admin/transactionControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");

// 🏦 Gestion des Transactions Portefeuille (Admin)

// Lister toutes les transactions (avec filtres)
router.get(
    "/transactions",
    verifierToken,
    autoriserRoles("ADMIN"),
    transactionControllers.listeTransactions
);

// Obtenir les stats du portefeuille global
router.get(
    "/transactions/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    transactionControllers.statsTransactions
);

// Valider ou Rejeter une transaction (Retrait)
router.patch(
    "/transactions/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    transactionControllers.modifierStatut
);

module.exports = router;
