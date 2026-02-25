const express = require("express");
const router = express.Router();

const {
    listerPaiementsPassager,
    detailPaiementPassager,
    statsPaiementsPassager,
} = require("../../controllers/passager/listesPaiementsControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/passager/paiements/stats:
 *   get:
 *     summary: Obtenir les statistiques des dépenses du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de paiement
 *       401:
 *         description: Non autorisé
 */
router.get(
    "/stats",
    verifierToken,
    verifierStatutActif,
    statsPaiementsPassager
);

/**
 * @swagger
 * /api/passager/paiements/paiements:
 *   get:
 *     summary: Historique des paiements du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page (défaut 1)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Nombre de résultats par page (défaut 10)
 *     responses:
 *       200:
 *         description: Liste des paiements
 *       401:
 *         description: Non autorisé
 */
// Historique des paiements passager
router.get(
    "/paiements",
    verifierToken,
    verifierStatutActif,
    listerPaiementsPassager
);

/**
 * @swagger
 * /api/passager/paiements/{paiementId}:
 *   get:
 *     summary: Détail d'un paiement spécifique
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID du paiement à récupérer
 *     responses:
 *       200:
 *         description: Détails du paiement
 *       404:
 *         description: Paiement non trouvé
 *       401:
 *         description: Non autorisé
 */
// 🔍 Détail d’un paiement
router.get(
    "/:paiementId",
    verifierToken,
    verifierStatutActif,
    detailPaiementPassager
);

module.exports = router;
