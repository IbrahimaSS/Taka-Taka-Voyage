const mongoose = require("mongoose");
const Utilisateurs = require("../../models/Utilisateurs");
const Reservation = require("../../models/Reservations");

//================================ DASHBOARD ==============================
exports.dashboardCards = async (req, res) => {
    try {
        // Total utilisateurs (Tous confondus)
        const utilisateursTotal = await Utilisateurs.countDocuments();

        // Total Passagers uniquement
        const passagersTotal = await Utilisateurs.countDocuments({ role: "PASSAGER" });

        // Chauffeurs actifs (Validés et statut actif)
        const chauffeursActifs = await Utilisateurs.countDocuments({
            role: "CHAUFFEUR",
            statut: "ACTIF",
        });

        // Nombre TOTAL de trajets effectués (Toutes réservations non annulées)
        const trajetsEffectues = await Reservation.countDocuments({
            statut: { $nin: ["ANNULEE", "ANNULEE_AVEC_FRAIS"] }
        });

        // Revenus totaux (Basé sur les paiements PAYE)
        // On regarde directement dans Reservation.paiement.statut = "PAYE"
        // Ou mieux, on pourrait regarder la collection "Paiements" si elle est utilisée comme source de vérité
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
                passagersTotal,
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
            .populate("passager", "nom prenom telephone photoUrl email createdAt")
            .populate("chauffeur", "nom prenom telephone photoUrl vehicule")
            .select("depart destination statut prix createdAt dureeMin distanceKm typeVehicule paiement");

        // Enrichissement complet des passagers et chauffeurs
        const resultats = await Promise.all(trajets.map(async (trip) => {
            const t = trip.toObject();

            // 1. Infos Passager
            if (t.passager) {
                const nbTrajetsPassager = await Reservation.countDocuments({ passager: t.passager._id });
                t.passager.nombreTrajets = nbTrajetsPassager;
                t.passager.inscritLe = t.passager.createdAt;
            }

            // 2. Infos Chauffeur
            if (t.chauffeur) {
                const profile = await require("../../models/ChauffeurProfile").findOne({ utilisateur: t.chauffeur._id });
                const nbTrajetsChauffeur = await Reservation.countDocuments({ chauffeur: t.chauffeur._id });

                if (profile) {
                    if (!t.chauffeur.vehicule) t.chauffeur.vehicule = {};
                    t.chauffeur.vehicule.marque = profile.marqueVehicule || "";
                    t.chauffeur.vehicule.modele = profile.modeleVehicule || "";
                    t.chauffeur.vehicule.immatriculation = profile.plaque || "";
                    t.chauffeur.vehicule.couleur = profile.couleurVehicule || "";
                    t.chauffeur.vehicule.places = profile.capaciteVehicule || 1;

                    t.chauffeur.noteMoyenne = profile.noteMoyenne || 5;
                    t.chauffeur.nombreTrajets = nbTrajetsChauffeur;
                    t.chauffeur.valideLe = profile.valideLe || profile.createdAt;
                } else {
                    t.chauffeur.noteMoyenne = 5;
                    t.chauffeur.nombreTrajets = nbTrajetsChauffeur;
                }
            }
            return t;
        }));

        return res.status(200).json({
            succes: true,
            total: trajets.length,
            trajets: resultats,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
