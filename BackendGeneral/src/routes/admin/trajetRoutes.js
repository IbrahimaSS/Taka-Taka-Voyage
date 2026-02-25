const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const trajetController = require("../../controllers/admin/trajetControllers");


// ================================== TRAJETS ===================================

/**
 * @swagger
 * /api/admin/trajets/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des trajets
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards Trajets
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.statsTrajets
);

/**
 * @swagger
 * /api/admin/trajets/map:
 *   get:
 *     summary: Obtenir les données des trajets pour la carte de suivi
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coordonnées et statuts pour la carte
 */
//Map (Carte)
router.get(
    "/map",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.trajetsCarte
);

/**
 * @swagger
 * /api/admin/trajets:
 *   get:
 *     summary: Obtenir la liste complète des trajets avec pagination/filtres
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trajets
 */
//Listes des trajets
router.get(
    "/",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.tousLesTrajets
);

/**
 * @swagger
 * /api/admin/trajets/{id}:
 *   get:
 *     summary: Obtenir les détails d'un trajet spécifique
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du trajet
 */
//Detail d'un trajet (👁️)
router.get(
    "/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    trajetController.detailTrajet
);

module.exports = router;