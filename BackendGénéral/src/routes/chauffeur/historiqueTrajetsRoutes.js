const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const chauffeurActif = require("../../middlewares/verifierChauffeurActif");

const {
    historiqueTrajetsChauffeur,
} = require("../../controllers/chauffeur/historiqueTrajetsControllers");

/**
 * @swagger
 * /api/chauffeur/trajets/historique:
 *   get:
 *     summary: Obtenir l'historique complet des trajets du chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des trajets retourné
 *       401:
 *         description: Non autorisé
 */
router.get(
    "/trajets/historique",
    verifierToken,
    chauffeurActif,
    historiqueTrajetsChauffeur
);

module.exports = router;
