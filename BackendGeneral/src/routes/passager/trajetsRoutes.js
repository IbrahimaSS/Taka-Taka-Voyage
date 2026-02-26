const express = require("express");
const router = express.Router();

const { listerTrajetsPassager, detailTrajetPassager } = require("../../controllers/passager/trajetsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * tags:
 *   name: Trajets Passager
 *   description: Gestion de l'historique et du détail des trajets pour le passager
 */

/**
 * @swagger
 * /api/passager/trajets:
 *   get:
 *     summary: Lister l'historique des trajets passager (pagination)
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page (défaut 1)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Nombre de résultats par page (défaut 10)
 *     responses:
 *       200:
 *         description: Liste des trajets
 *       401:
 *         description: Non autorisé
 */
// Historique des trajets passager (pagination)
router.get(
    "/trajets",
    verifierToken,
    verifierStatutActif,
    listerTrajetsPassager
);

/**
 * @swagger
 * /api/passager/trajets/{trajetId}:
 *   get:
 *     summary: Obtenir les détails d'un trajet spécifique
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trajetId
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID du trajet à récupérer
 *     responses:
 *       200:
 *         description: Détails du trajet
 *       404:
 *         description: Trajet non trouvé
 *       401:
 *         description: Non autorisé
 */
// Détails d’un trajet
router.get(
    "/trajets/:trajetId",
    verifierToken,
    verifierStatutActif,
    detailTrajetPassager
);

module.exports = router;
