const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const documentController = require("../../controllers/admin/documentControllers");


//=====================================DOCUMENTS====================================

/**
 * @swagger
 * /api/admin/documents/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des documents
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards des documents
router.get(
    "/documents/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.statsDocuments
);

/**
 * @swagger
 * /api/admin/documents/chauffeurs:
 *   get:
 *     summary: Liste des chauffeurs avec leurs documents
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des chauffeurs et documents
 */
//Listes des documents par chauffeurs
router.get(
    "/documents/chauffeurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.listeChauffeursAvecDocuments
);

/**
 * @swagger
 * /api/admin/documents:
 *   get:
 *     summary: Obtenir la liste des documents
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des documents
 */
//Listes des documents
router.get(
    "/documents",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.listeDocuments
);

/**
 * @swagger
 * /api/admin/documents/{id}/statut:
 *   patch:
 *     summary: Mettre à jour le statut d'un document (Valider/Refuser)
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
//Valider et Refuser un Document
router.patch(
    "/documents/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.changerStatutDocument
);

/**
 * @swagger
 * /api/admin/chauffeurs/{id}/documents:
 *   get:
 *     summary: Voir les documents d'un chauffeur spécifique
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
 *         description: Documents du chauffeur
 */
//Voir un Document
router.get(
    "/chauffeurs/:id/documents/",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.voirDocumentsChauffeur
);

module.exports = router;