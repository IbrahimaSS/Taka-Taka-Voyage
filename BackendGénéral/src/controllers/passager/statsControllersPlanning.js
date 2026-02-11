const Trajet = require("../../models/Trajets");
const Reservation = require("../../models/Reservations");

exports.statsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur?._id;

        if (!passagerId) {
        return res.status(401).json({
            succes: false,
            message: "Utilisateur non authentifié",
        });
        }

        const [totalTrajets, confirmes, enAttente] = await Promise.all([
        // 🧾 Tous les trajets effectués
        Trajet.countDocuments({ passager: passagerId }),

        // ✅ Réservations planifiées confirmées
        Reservation.countDocuments({
            passager: passagerId,
            typeCourse: "PLANIFIEE",
            statut: "ACCEPTEE",
            datePlanifiee: { $ne: null },
        }),

        // ⏳ Réservations planifiées en attente
        Reservation.countDocuments({
            passager: passagerId,
            typeCourse: "PLANIFIEE",
            statut: "EN_ATTENTE",
            datePlanifiee: { $ne: null },
        }),
        ]);

        return res.status(200).json({
        succes: true,
        stats: {
            totalTrajets,
            confirmes,
            enAttente,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
