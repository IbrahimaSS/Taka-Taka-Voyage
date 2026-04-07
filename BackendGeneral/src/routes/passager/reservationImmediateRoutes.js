const express = require("express");
const router = express.Router();

const {
  confirmerReservationImmediate,
  annulerEtRembourser
} = require("../../controllers/passager/reservationsImmediateControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");

/**
 * @swagger
 * /api/reservations-immediate/confirmer-immediate:
 *   post:
 *     summary: Confirmer une réservation immédiate pour un passager
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
 *               prix:
 *                 type: number
 *               distanceKm:
 *                 type: number
 *               dureeMin:
 *                 type: number
 *               typeVehicule:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation confirmée et WebSocket notifié
 *       400:
 *         description: Erreur lors de la réservation
 */
router.post(
  "/confirmer-immediate",
  verifierToken,
  verifierStatutActif,
  autoriserRoles("PASSAGER"), // ✅ IMPORTANT
  confirmerReservationImmediate
);

// ✅ Route d'annulation automatique et remboursement (ex: Timeout 120s)
router.post(
  "/:id/annuler-rembourser",
  verifierToken,
  verifierStatutActif,
  autoriserRoles("PASSAGER"),
  annulerEtRembourser
);

module.exports = router;