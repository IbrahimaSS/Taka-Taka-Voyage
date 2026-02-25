const express = require("express");
const router = express.Router();

// Middlewares
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

// Controller PASSAGER uniquement
const passagerController = require("../../controllers/admin/passagerControllers");

//=====================================PASSAGER=====================================

/**
 * @swagger
 * /api/admin/utilisateurs:
 *   get:
 *     summary: Obtenir la liste de tous les passagers
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des passagers
 */
//Listes des Users
router.get(
    "/utilisateurs",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.listeUtilisateurs
);

/**
 * @swagger
 * /api/admin/utilisateurs/stats:
 *   get:
 *     summary: Obtenir les statistiques globales des passagers
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
//Cards (Stats)
router.get(
    "/utilisateurs/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.statsUtilisateurs
);

/**
 * @swagger
 * /api/admin/utilisateurs/{id}:
 *   get:
 *     summary: Obtenir les détails d'un passager spécifique
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
 *         description: Détails du passager
 */
//Détails d'un Passager
router.get(
    "/utilisateurs/:id",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.detailUtilisateur
);

/**
 * @swagger
 * /api/admin/utilisateurs/{id}/statut:
 *   patch:
 *     summary: Modifier le statut d'un passager (Actif, Inactif, Suspendu)
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
//Activer - Désactiver - Suspendre un Compte
router.patch(
    "/utilisateurs/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    passagerController.changerStatutUtilisateur
);

module.exports = router;