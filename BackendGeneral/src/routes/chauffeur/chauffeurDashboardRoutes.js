const express = require("express");
const router = express.Router();

const {
    chauffeurDashboardStats,
} = require("../../controllers/chauffeur/chauffeurDashboardControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const verifierChauffeurActif = require("../../middlewares/verifierChauffeurActif");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

/**
 * @swagger
 * tags:
 *   name: Chauffeur Dashboard
 *   description: Statistiques et informations pour le tableau de bord du chauffeur
 */

/**
 * @swagger
 * /api/chauffeur/dashboard:
 *   get:
 *     summary: Obtenir les statistiques du tableau de bord du chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (rôle incorrect)
 */
// Dashboard chauffeur
router.get(
    "/dashboard",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    verifierChauffeurActif,
    chauffeurDashboardStats
);

module.exports = router;
