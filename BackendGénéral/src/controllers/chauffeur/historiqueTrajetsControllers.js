const Reservation = require("../../models/Reservations");
const Trajet = require("../../models/Trajets"); // Ajout du modèle Trajet
const ChauffeurProfile = require("../../models/ChauffeurProfile");

// * GET /chauffeur/trajets/historique
exports.historiqueTrajetsChauffeur = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        // 1. Récupérer les trajets terminés (depuis le modèle Trajet)
        // C'est la source de vérité pour les succès
        const trajetsTermines = await Trajet.find({
            chauffeur: userId,
            statut: "TERMINEE"
        })
            .populate("passager", "nom prenom noteMoyenne photoUrl")
            .sort({ dateFin: -1 })
            .lean();

        // 2. Récupérer les réservations annulées (depuis le modèle Reservation)
        // C'est la source pour les échecs
        const reservationsAnnulees = await Reservation.find({
            chauffeur: userId,
            statut: "ANNULEE"
        })
            .populate("passager", "nom prenom noteMoyenne photoUrl")
            .sort({ createdAt: -1 })
            .lean();

        // 3. Formater les trajets terminés
        const formattedTermines = trajetsTermines.map(t => ({
            id: t.reservation || t._id, // On utilise l'ID de résa pour le dédoublonnage
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

        // 5. Fusionner et supprimer les doublons (si une résa est dans les deux, on garde la version terminée)
        const mapHistorique = new Map();

        // On traite d'abord les annulées
        formattedAnnulees.forEach(item => {
            mapHistorique.set(item.id.toString(), item);
        });

        // Puis on écrase avec les terminées (elles sont prioritaires)
        formattedTermines.forEach(item => {
            mapHistorique.set(item.id.toString(), item);
        });

        const historique = Array.from(mapHistorique.values());

        // 6. Tri final par date
        historique.sort((a, b) => new Date(b.requestedTime) - new Date(a.requestedTime));

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

