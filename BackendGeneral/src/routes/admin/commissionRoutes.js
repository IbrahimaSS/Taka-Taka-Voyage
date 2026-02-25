const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const commissionController = require("../../controllers/admin/commissionControllers");


// ================================COMMISSIONS========================================

/**
 * @swagger
 * /api/admin/commissions/stats:
 *   get:
 *     summary: Obtenir les statistiques des commissions
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards Commissions
router.get(
    "/commissions/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.statsCommissions
);

/**
 * @swagger
 * /api/admin/commissions/evolution:
 *   get:
 *     summary: Obtenir l'évolution des commissions
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Évolution des commissions
 */
//Evolutions des Commissions
router.get(
    "/commissions/evolution",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.evolutionCommissions
);

/**
 * @swagger
 * /api/admin/commissions/repartition:
 *   get:
 *     summary: Obtenir la répartition des commissions par service
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Répartition des commissions
 */
//Répartition par Services
router.get(
    "/commissions/repartition",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.repartitionCommissions
);

/**
 * @swagger
 * /api/admin/commissions/chauffeurs:
 *   get:
 *     summary: Obtenir la liste des chauffeurs et les montants dus
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des montants dus aux chauffeurs
 */
//Listes des Commissions
router.get(
    "/commissions/chauffeurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.listeChauffeursAPayer
);

/**
 * @swagger
 * /api/admin/paiements/{paiementId}/traiter:
 *   patch:
 *     summary: Traiter/Valider un paiement lié à une commission
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paiement traité
 */
//Traiter un Paiement lié à une Commission
router.patch(
    "/paiements/:paiementId/traiter",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.traiterPaiement
);

/**
 * @swagger
 * /api/admin/paiements/{paiementId}/details:
 *   get:
 *     summary: Obtenir les détails d'un paiement de commission
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du paiement
 */
//Détails d'un Paiement lié à une Commission
router.get(
    "/paiements/:paiementId/details",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.detailsPaiementAdmin
);

/**
 * @swagger
 * /api/admin/paiements/{paiementId}/modifier:
 *   patch:
 *     summary: Modifier un paiement de commission
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paiementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Paiement modifié
 */
//Modifier un Paiement
router.patch(
    "/paiements/:paiementId/modifier",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.modifierPaiement
);

/**
 * @swagger
 * /api/admin/stats/commission-mois:
 *   get:
 *     summary: Total des commissions générées ce mois-ci
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total des commissions
 */
//Total des Commissions ce mois
router.get(
    "/stats/commission-mois",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.commissionTotaleCeMois
);

/**
 * @swagger
 * /api/admin/stats/chauffeurs-payes:
 *   get:
 *     summary: Nombre de chauffeurs payés ce mois-ci
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chauffeurs payés
 */
//Total des Chauffeurs Payés
router.get(
    "/stats/chauffeurs-payes",
    verifierToken,
    autoriserRoles("ADMIN"),
    commissionController.chauffeursPayesCeMois
);

module.exports = router;
