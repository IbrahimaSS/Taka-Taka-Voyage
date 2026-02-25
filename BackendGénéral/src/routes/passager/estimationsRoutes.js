const express = require("express");
const router = express.Router();

const estimationController = require("../../controllers/passager/estimationsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const { validerEstimation } = require("../../validators/estimationValidator");

/**
 * @swagger
 * tags:
 *   name: Estimations
 *   description: API gérant les estimations de trajets
 */

/**
 * @swagger
 * /api/estimations/estimer-trajet:
 *   post:
 *     summary: Estimer le coût d'un trajet
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               depart:
 *                 type: string
 *               destination:
 *                 type: string
 *               distanceKm:
 *                 type: number
 *               dureeMin:
 *                 type: number
 *               typeVehicule:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estimation réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:
 *                   type: boolean
 *                 estimation:
 *                   type: number
 *       400:
 *         description: Erreur lors de l'estimation
 */
// 🔹 Estimation trajet (Accueil Passager)
router.post(
    "/estimer-trajet",
    verifierToken,
    verifierStatutActif,
    validerEstimation,
    estimationController.estimerTrajet
);

module.exports = router;
