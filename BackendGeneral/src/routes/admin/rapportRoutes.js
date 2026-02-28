const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const rapportController = require("../../controllers/admin/rapportControllers");


//=======================================RAPORTS===================================

/**
 * @swagger
 * /api/admin/stats/rapports:
 *   get:
 *     summary: Obtenir les statistiques globales des rapports et versements
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
router.get(
    "/stats/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.statsRapportsVersements
);

/**
 * @swagger
 * /api/admin/rapports/stats/activite:
 *   get:
 *     summary: Obtenir les données de génération d'activité
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activité de génération
 */
//Génération des Activités
router.get(
    "/rapports/stats/activite",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.activiteGenerationRapports
);

/**
 * @swagger
 * /api/admin/analyses/repartition:
 *   get:
 *     summary: Obtenir la répartition analytique des rapports
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Répartition des rapports
 */
//Répartition des Rapprots
router.get(
    "/analyses/repartition/",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.repartitionAnalyses
);

/**
 * @swagger
 * /api/admin/rapports:
 *   get:
 *     summary: Obtenir la liste des rapports
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rapports
 */
//Listes des Rapports
router.get(
    "/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.listeRapports
);

/**
 * @swagger
 * /api/admin/rapports:
 *   post:
 *     summary: Créer un nouveau rapport ou une note
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               contenu:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rapport créé
 */
//Créer un Rapport
router.post(
    "/rapports",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.creerRapport
);

/**
 * @swagger
 * /api/admin/rapports/{rapportId}:
 *   get:
 *     summary: Obtenir les détails d'un rapport
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rapportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du rapport
 */
router.get(
    "/rapports/:rapportId",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.detailsRapport
);

/**
 * @swagger
 * /api/admin/rapports/{rapportId}:
 *   delete:
 *     summary: Supprimer un rapport
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rapportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rapport supprimé
 */
router.delete(
    "/rapports/:rapportId",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.supprimerRapport
);

router.patch(
    "/rapports/:rapportId/download",
    verifierToken,
    autoriserRoles("ADMIN"),
    rapportController.incrementerTelechargement
);

module.exports = router;