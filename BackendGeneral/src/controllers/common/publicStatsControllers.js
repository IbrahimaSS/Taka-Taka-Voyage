const Utilisateurs = require("../../models/Utilisateurs");
const Reservation = require("../../models/Reservations");

exports.getPublicStats = async (req, res) => {
    try {
        // Total utilisateurs (Tous confondus)
        const utilisateursTotal = await Utilisateurs.countDocuments();

        // Chauffeurs actifs (Validés et statut actif)
        const chauffeursActifs = await Utilisateurs.countDocuments({
            role: "CHAUFFEUR",
            statut: "ACTIF",
        });

        // Nombre TOTAL de trajets effectués (Toutes réservations non annulées)
        const trajetsEffectues = await Reservation.countDocuments({
            statut: { $ne: "ANNULEE" }
        });

        return res.status(200).json({
            succes: true,
            stats: {
                utilisateurs: utilisateursTotal,
                chauffeurs: chauffeursActifs,
                trajets: trajetsEffectues,
            },
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};
