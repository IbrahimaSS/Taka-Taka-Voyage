const Reservation = require("../../models/Reservations");
const Trajet = require("../../models/Trajets"); // Ajout du modèle Trajet
const ChauffeurProfile = require("../../models/ChauffeurProfile");

// * GET /chauffeur/trajets/historique
exports.historiqueTrajetsChauffeur = async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // 1. Récupérer les trajets terminés (depuis le modèle Trajet)
        // Note: On ne peut pas faire une pagination parfaite sur deux collections fusionnées 
        // facilement ici sans aggregation complexe, donc on va récupérer un certain nombre de chaque
        // pour cette version.
        const trajetsTermines = await Trajet.find({
            chauffeur: userId,
            statut: "TERMINEE"
        })
            .populate("passager", "nom prenom noteMoyenne photoUrl")
            .sort({ dateFin: -1 })
            .limit(100) // On prend les 100 derniers pour le merge
            .lean();

        // 2. Récupérer les réservations annulées (depuis le modèle Reservation)
        const reservationsAnnulees = await Reservation.find({
            chauffeur: userId,
            statut: { $in: ["ANNULEE", "ANNULEE_AVEC_FRAIS"] }
        })
            .populate("passager", "nom prenom noteMoyenne photoUrl")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        // 3. Formater les trajets terminés
        const formattedTermines = trajetsTermines.map(t => ({
            id: t.reservation || t._id,
            passengerName: t.passager ? `${t.passager.prenom} ${t.passager.nom}` : "Inconnu",
            passengerRating: t.passager?.noteMoyenne || 5,
            passengerPhoto: t.passager?.photoUrl || null,
            depart: t.depart,
            destination: t.destination,
            distanceKm: t.distanceKm,
            dureeMin: t.dureeMin,
            estimatedFare: t.prix,
            requestedTime: t.dateFin || t.createdAt,
            status: 'completed'
        }));

        // 4. Formater les réservations annulées
        const formattedAnnulees = reservationsAnnulees.map(r => ({
            id: r._id,
            passengerName: r.passager ? `${r.passager.prenom} ${r.passager.nom}` : "Inconnu",
            passengerRating: r.passager?.noteMoyenne || 5,
            passengerPhoto: r.passager?.photoUrl || null,
            depart: r.depart,
            destination: r.destination,
            distanceKm: r.distanceKm,
            dureeMin: r.dureeMin,
            estimatedFare: r.prix,
            requestedTime: r.createdAt,
            status: 'cancelled'
        }));

        // 5. Fusionner et supprimer les doublons
        const mapHistorique = new Map();
        formattedAnnulees.forEach(item => {
            mapHistorique.set(item.id.toString(), item);
        });
        formattedTermines.forEach(item => {
            mapHistorique.set(item.id.toString(), item);
        });

        const allHistory = Array.from(mapHistorique.values());
        allHistory.sort((a, b) => new Date(b.requestedTime) - new Date(a.requestedTime));

        // 6. Pagination manuelle sur le résultat fusionné
        const total = allHistory.length;
        const data = allHistory.slice(skip, skip + limit);

        return res.status(200).json({
            succes: true,
            total,
            page,
            limit,
            data,
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

