const express = require("express");
const router = express.Router();

const { statsPassager } = require("../../controllers/passager/statsControllersPlanning");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/passagers/stats:
 *   get:
 *     summary: Récupérer les statistiques globales
 *     description: Renvoie les statistiques du passager (nombre de trajets, prix total, etc.).
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès.
 */
router.get(
    "/stats",
    verifierToken,
    verifierStatutActif,
    statsPassager
);

module.exports = router;
