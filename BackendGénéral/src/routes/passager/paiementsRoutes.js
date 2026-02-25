const express = require("express");
const router = express.Router();

const paiementController = require("../../controllers/passager/paiementsControllers");
const auth = require("../../middlewares/authMiddlewares");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/paiements/payer:
 *   post:
 *     summary: Initier un paiement pour un trajet
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
 *               trajetId:
 *                 type: string
 *               methodePaiement:
 *                 type: string
 *                 enum: [especes, orange_money, wave]
 *     responses:
 *       200:
 *         description: Paiement initié avec succès
 */
// 🔹 INITIER PAIEMENT
router.post(
    "/payer",
    verifierToken,
    verifierStatutActif,
    paiementController.initierPaiement
);


module.exports = router;
