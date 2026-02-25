const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const dashboardController = require("../../controllers/admin/dashboardControllers");

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Récupérer les statistiques du tableau de bord d'administration
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       403:
 *         description: Accès refusé
 */
//Cards dashboard
router.get(
    "/dashboard",
    verifierToken,
    autoriserRoles("ADMIN"),
    dashboardController.dashboardCards
);

/**
 * @swagger
 * /api/admin/trajets/recents:
 *   get:
 *     summary: Récupérer les 5 trajets les plus récents
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trajets récents
 *       403:
 *         description: Accès refusé
 */
//5 Trajets Recents
router.get(
    "/trajets/recents",
    verifierToken, autoriserRoles("ADMIN"),
    dashboardController.trajetsRecents
);

module.exports = router;
