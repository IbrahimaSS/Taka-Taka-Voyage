const Reservation = require("../../models/Reservations");
const ChauffeurProfile = require("../../models/ChauffeurProfile");

// * GET /chauffeur/trajets/historique
exports.historiqueTrajetsChauffeur = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        // Profil chauffeur
        const chauffeurProfil = await ChauffeurProfile.findOne({
        utilisateur: userId,
        });

        if (!chauffeurProfil) {
        return res.status(404).json({
            succes: false,
            message: "Profil chauffeur introuvable",
        });
        }

        // Réservations TERMINÉES du chauffeur
        const reservations = await Reservation.find({
        chauffeur: userId,
        statut: "TERMINEE",
        })
        .sort({ dateFin: -1 })
        .populate("chauffeur", "nom prenom")
        .select(
            "depart destination distanceKm dureeMin prix dateFin createdAt"
        );

        const historique = reservations.map((resv) => ({
        chauffeur: {
            nom: resv.chauffeur?.nom,
            prenom: resv.chauffeur?.prenom,
            noteMoyenne: chauffeurProfil.noteMoyenne,
        },
        depart: resv.depart,
        destination: resv.destination,
        distanceKm: resv.distanceKm,
        dureeMin: resv.dureeMin,
        prix: resv.prix,
        date: resv.dateFin || resv.createdAt,
        }));

        return res.status(200).json({
        succes: true,
        total: historique.length,
        data: historique,
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
