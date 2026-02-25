const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const validationController = require("../../controllers/admin/validationControllers");


//===============================VALIDATIONS===========================================

/**
 * @swagger
 * /api/admin/validations/demande:
 *   get:
 *     summary: Obtenir la liste des demandes de validation de chauffeurs
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes
 */
//Démande de Validations
router.get(
    "/demande",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.listeDemandesValidation
);

/**
 * @swagger
 * /api/admin/validations/stats:
 *   get:
 *     summary: Obtenir les statistiques des validations
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards des Validations
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.statsValidationChauffeurs
);

/**
 * @swagger
 * /api/admin/validations/historique:
 *   get:
 *     summary: Obtenir l'historique des validations effectuées
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des validations
 */
//Historiques des Validations
router.get(
    "/historique",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.historiqueValidations
);

/**
 * @swagger
 * /api/admin/validations/{id}/valider:
 *   patch:
 *     summary: Valider l'inscription/les documents d'un chauffeur
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
 *         description: Chauffeur validé
 */
//Valider un chauffeur
router.patch(
    "/:id/valider",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.validerChauffeur
);

/**
 * @swagger
 * /api/admin/validations/{id}/rejeter:
 *   patch:
 *     summary: Rejeter la demande d'un chauffeur
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
 *         description: Demande rejetée
 */
//Rejeter un chauffeur
router.patch(
    "/:id/rejeter",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.rejeterChauffeur
);

/**
 * @swagger
 * /api/admin/validations/{id}:
 *   get:
 *     summary: Obtenir les détails d'une demande de validation (profil et documents)
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
 *         description: Détails de la validation
 */
//Détails de la validation d'un chauffeur
router.get(
    "/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    validationController.detailsChauffeurValidation
);

module.exports = router;
