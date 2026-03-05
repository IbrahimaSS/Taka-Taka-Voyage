const express = require("express");
const router = express.Router();
const Reservation = require("../../models/Reservations");
const { verifierToken } = require("../../middlewares/authMiddlewares");

/**
 * @swagger
 * /api/passager/reservations/active:
 *   get:
 *     summary: Récupérer la réservation active du passager (pour restauration d'état)
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 */
router.get("/active", verifierToken, async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        // On cherche une réservation qui n'est pas encore terminée ou annulée
        const reservation = await Reservation.findOne({
            passager: userId,
            statut: { $in: ["EN_ATTENTE", "ACCEPTEE", "ASSIGNEE", "EN_COURS_DE_RECUPERATION", "ARRIVEE", "EN_COURS", "REJOINT", "EN_ROUTE"] }
        })
            .populate("chauffeur")
            .populate("groupeTaxiPartage")
            .sort({ updatedAt: -1 });

        if (!reservation) {
            return res.json({ succes: true, success: true, reservation: null });
        }

        return res.json({ succes: true, success: true, reservation });
    } catch (error) {
        return res.status(500).json({ succes: false, success: false, message: error.message });
    }
});

module.exports = router;
