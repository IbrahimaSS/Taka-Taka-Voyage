const Reservation = require("../../models/Reservations");

exports.initierPaiement = async (req, res) => {
    try {
        const { reservationId, methode, telephone } = req.body;
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
        return res.status(404).json({ succes: false, message: "Réservation introuvable" });
        }

        if (reservation.passager.toString() !== req.utilisateur._id.toString()) {
        return res.status(403).json({ succes: false, message: "Accès refusé" });
        }

        const reference = `MM-${Date.now()}`;

        reservation.paiement = {
        statut: "EN_ATTENTE_CONFIRMATION",
        methode,
        telephone,
        reference,
        };

        await reservation.save();

        res.json({
        succes: true,
        message: "Paiement initié",
        reference,
        });
    } catch (e) {
        res.status(500).json({ succes: false, message: e.message });
    }
    };
    exports.confirmerPaiement = async (req, res) => {
    try {
        const { reservationId, reference } = req.body;

        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
        return res.status(404).json({ succes: false, message: "Réservation introuvable" });
        }

        if (reservation.passager.toString() !== req.utilisateur._id.toString()) {
        return res.status(403).json({ succes: false, message: "Accès refusé" });
        }

        if (
        !reservation.paiement ||
        reservation.paiement.reference !== reference
        ) {
        return res.status(400).json({ succes: false, message: "Détails de paiement invalides" });
        }

        reservation.paiement.statut = "PAYE";
        await reservation.save();

        res.json({
        succes: true,
        message: "Paiement confirmé",
        });
    } catch (e) {
        res.status(500).json({ succes: false, message: e.message });
    }
}