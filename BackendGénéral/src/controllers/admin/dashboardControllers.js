const mongoose = require("mongoose");
const Utilisateurs = require("../../models/Utilisateurs");
const Reservation = require("../../models/Reservations");

//================================ DASHBOARD ==============================
exports.dashboardCards = async (req, res) => {
    try {
        // Total utilisateurs
        const utilisateursTotal = await Utilisateurs.countDocuments();

        // Chauffeurs actifs
        const chauffeursActifs = await Utilisateurs.countDocuments({
        role: "CHAUFFEUR",
        statut: "ACTIF",
        });

        // Nombre TOTAL de trajets effectués
        const trajetsEffectues = await Reservation.countDocuments();
        // (optionnel plus strict)
        // { statut: "TERMINEE" }

        // Revenus totaux (PAYE)
        const revenusAgg = await Reservation.aggregate([
        { $match: { "paiement.statut": "PAYE" } },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            },
        },
        ]);

        const revenusTotal = revenusAgg?.[0]?.total || 0;

        return res.status(200).json({
        succes: true,
        stats: {
            utilisateursTotal,
            chauffeursActifs,
            trajetsEffectues,
            revenusTotal,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// 5 TRAJETS RÉCENTS
exports.trajetsRecents = async (req, res) => {
    try {
        const trajets = await Reservation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("passager", "nom prenom telephone")
        .populate("chauffeur", "nom prenom")
        .select("depart destination statut prix createdAt");

        return res.status(200).json({
        succes: true,
        total: trajets.length,
        trajets,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
