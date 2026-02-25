const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const litigeController = require("../../controllers/admin/litigeControllers");


//=========================================LITIGES===================================

/**
 * @swagger
 * /api/admin/litiges/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des litiges
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards des Litiges
router.get(
    "/litiges/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.statsLitigesCards
);

/**
 * @swagger
 * /api/admin/litiges:
 *   get:
 *     summary: Obtenir la liste filtrée et paginée des litiges
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des litiges
 */
//Listes des Litiges
router.get(
    "/litiges",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.listeLitiges
);

/**
 * @swagger
 * /api/admin/litiges/{litigeId}:
 *   get:
 *     summary: Détailler un litige précis
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du litige
 */
//Détails d'un Litige
router.get(
    "/litiges/:litigeId",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.detailsLitige
);

/**
 * @swagger
 * /api/admin/litiges/{litigeId}/resoudre:
 *   patch:
 *     summary: Marquer un litige comme résolu
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Litige résolu avec succès
 */
//Résoudre un Litige
router.patch(
    "/litiges/:litigeId/resoudre",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.resoudreLitige
);

/**
 * @swagger
 * /api/admin/litiges/{litigeId}/rejeter:
 *   patch:
 *     summary: Rejeter un litige
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: litigeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Litige rejeté avec succès
 */
//Réjéter un Litige
router.patch(
    "/litiges/:litigeId/rejeter",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.rejeterLitige
);

/**
 * @swagger
 * /api/admin/litiges/repartition/types:
 *   get:
 *     summary: Obtenir la répartition graphique des litiges par type
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Graphique des types de litiges
 */
//Répartition par Type de Litiges
router.get(
    "/litiges/repartition/types",
    verifierToken,
    autoriserRoles("ADMIN"),
    litigeController.repartitionLitigesParType
);

module.exports = router;
