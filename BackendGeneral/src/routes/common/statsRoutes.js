const express = require("express");
const router = express.Router();
const statsController = require("../../controllers/common/publicStatsControllers");

/**
 * @swagger
 * /api/common/stats:
 *   get:
 *     summary: Récupérer les statistiques publiques de la plateforme
 *     tags: [0 - Common]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 */
router.get("/stats", statsController.getPublicStats);

module.exports = router;
