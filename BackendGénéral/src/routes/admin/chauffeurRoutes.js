const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

const chauffeurController = require("../../controllers/admin/chauffeurControllers");

/**
 * @swagger
 * /api/admin/chauffeurs/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des chauffeurs
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//=======================================CHAUFFEURS==================================
//Cards
router.get(
    "/chauffeurs/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.statsChauffeurs
);

/**
 * @swagger
 * /api/admin/chauffeurs:
 *   get:
 *     summary: Obtenir la liste des chauffeurs (avec filtres et pagination)
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des chauffeurs
 */
//Listes des Users
router.get(
    "/chauffeurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.listeChauffeurs
);

/**
 * @swagger
 * /api/admin/chauffeurs/{id}:
 *   get:
 *     summary: Obtenir les détails d'un chauffeur spécifique
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
 *         description: Détails du chauffeur
 */
//Détails d'un Users
router.get(
    "/chauffeurs/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.detailChauffeur
);

/**
 * @swagger
 * /api/admin/chauffeurs/{id}/statut:
 *   put:
 *     summary: Changer le statut (Actif/Inactif/Suspendu) d'un chauffeur
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nouveauStatut:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
//Statut d'un Chauffeur
router.put(
    "/chauffeurs/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    chauffeurController.changerStatutChauffeur
);

module.exports = router;