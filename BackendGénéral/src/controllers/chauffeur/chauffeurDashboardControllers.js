const ChauffeurProfile = require("../../models/ChauffeurProfile");
const Reservation = require("../../models/Reservations");
const Trajet = require("../../models/Trajets");


// * GET /chauffeur/dashboard
exports.chauffeurDashboardStats = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        // Récupérer le profil chauffeur
        const chauffeurProfil = await ChauffeurProfile.findOne({
        utilisateur: userId,
        });

        if (!chauffeurProfil) {
        return res.status(404).json({
            succes: false,
            message: "Profil chauffeur introuvable",
        });
        }

        
        //*  Dates utiles (aujourd'hui)
        
        const debutJour = new Date();
        debutJour.setHours(0, 0, 0, 0);

        const finJour = new Date();
        finJour.setHours(23, 59, 59, 999);

        //*  1. Demandes reçues aujourd’hui
        const demandesRecues = await Reservation.countDocuments({
        chauffeur: userId,
        createdAt: { $gte: debutJour, $lte: finJour },
        });

        //*  2. Courses effectuées aujourd’hui
        const coursesEffectuees = await Trajet.countDocuments({
        chauffeur: userId,
        statut: "TERMINEE",
        dateFin: { $gte: debutJour, $lte: finJour },
        });

        //*  3. Revenus journaliers
        const revenusAgg = await Trajet.aggregate([
        {
            $match: {
            chauffeur: userId,
            statut: "TERMINEE",
            dateFin: { $gte: debutJour, $lte: finJour },
            },
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            },
        },
        ]);

        const revenusJournaliers = revenusAgg.length ? revenusAgg[0].total : 0;

        // Calcul de la durée en ligne
        let enLigneDepuis = null;
        let dureeEnLigneMs = 0;

        if (chauffeurProfil.disponibilite === "EN_LIGNE") {
        enLigneDepuis = chauffeurProfil.updatedAt;
        dureeEnLigneMs = Date.now() - new Date(enLigneDepuis).getTime();
        }

        const heures = Math.floor(dureeEnLigneMs / (1000 * 60 * 60));
        const minutes = Math.floor(
        (dureeEnLigneMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        //*  Réponse finale
        return res.status(200).json({
        succes: true,
        data: {
            disponibilite: chauffeurProfil.disponibilite,
            enLigneDepuis,
            dureeEnLigne: `${heures}h ${minutes}min`,
            stats: {
            demandesRecuesAujourdHui: demandesRecues,
            coursesEffectueesAujourdHui: coursesEffectuees,
            revenusJournaliers,
            },
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
