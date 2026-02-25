const express = require("express");
const router = express.Router();

// ✅ DESTRUCTURATION CORRECTE
const {
    creerReservationPlanifiee,
    listerPlanningPassager,
    detailPlanningPassager,
    modifierReservationPlanifiee,
    annulerReservationPlanifiee,
} = require("../../controllers/passager/reservationsPlanifieeControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/passagers/planifier:
 *   post:
 *     summary: Créer une réservation planifiée
 *     description: Permet à un passager de planifier une course pour le futur.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Réservation planifiée avec succès.
 */
router.post(
    "/planifier",
    verifierToken,
    verifierStatutActif,
    creerReservationPlanifiee
);

/**
 * @swagger
 * /api/passagers/planning:
 *   get:
 *     summary: Lister le planning des réservations
 *     description: Récupérer toutes les réservations planifiées du passager.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée.
 */
router.get(
    "/planning",
    verifierToken,
    verifierStatutActif,
    listerPlanningPassager
);

/**
 * @swagger
 * /api/passagers/planning/{reservationId}:
 *   get:
 *     summary: Détail d'une réservation planifiée
 *     description: Récupérer les détails d'une réservation planifiée spécifique.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails récupérés.
 */
router.get(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    detailPlanningPassager
);

/**
 * @swagger
 * /api/passagers/planning/{reservationId}:
 *   put:
 *     summary: Modifier une réservation planifiée
 *     description: Modifier les informations d'une réservation planifiée (optionnel).
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
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
 *         description: Réservation modifiée avec succès.
 */
router.put(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    modifierReservationPlanifiee
);

/**
 * @swagger
 * /api/passagers/planning/{reservationId}:
 *   delete:
 *     summary: Annuler une réservation planifiée
 *     description: Annuler une réservation planifiée existante (optionnel).
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation annulée avec succès.
 */
router.delete(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    annulerReservationPlanifiee
);
module.exports = router;
