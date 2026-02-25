const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const paiementController = require("../../controllers/admin/paiementControllers");


// ===========================PAIEMENTS=========================================

/**
 * @swagger
 * /api/admin/paiements/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des paiements
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards Paiements
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.statsPaiements
);

/**
 * @swagger
 * /api/admin/paiements/evolution:
 *   get:
 *     summary: Obtenir l'évolution temporelle des paiements
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Évolution des paiements
 */
//Cards Paiements
router.get(
    "/evolution",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.evolutionPaiements
);

/**
 * @swagger
 * /api/admin/paiements/repartition:
 *   get:
 *     summary: Obtenir la répartition des paiements par type/statut
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Répartition des paiements
 */
//Répartition Paiements
router.get(
    "/repartition",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.repartitionPaiements
);

/**
 * @swagger
 * /api/admin/paiements:
 *   get:
 *     summary: Obtenir la liste de tous les paiements
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
//Listes des Paiements
router.get(
    "/",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.listePaiements
);

/**
 * @swagger
 * /api/admin/paiements/{id}:
 *   get:
 *     summary: Obtenir les détails d'un paiement spécifique
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
 *         description: Détails du paiement
 */
//Détails d'un Paiement
router.get(
    "/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    paiementController.detailsPaiement
);

module.exports = router;
