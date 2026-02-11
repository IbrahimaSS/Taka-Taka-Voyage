const Trajet = require("../../models/Trajets");

// HISTORIQUE DES TRAJETS DU PASSAGER (pagination + filtre)
exports.listerTrajetsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur?._id;

        if (!passagerId) {
        return res.status(401).json({
            succes: false,
            message: "Utilisateur non authentifié",
        });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
        const skip = (page - 1) * limit;

        // Source = Trajets (historique),
        const filtre = { passager: passagerId };

        // Filtre optionnel: /trajets?statut=TERMINEE (ou ANNULEE)
        if (req.query.statut) {
        filtre.statut = req.query.statut;
        }

        const total = await Trajet.countDocuments(filtre);

        const trajets = await Trajet.find(filtre)
        .populate("chauffeur", "nom prenom vehicule marque modele plaque")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        return res.status(200).json({
        succes: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        trajets,
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

//DETAIL D'UN TRAJET POUR LE PASSAGER
exports.detailTrajetPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const { trajetId } = req.params;

        const trajet = await Trajet.findOne({
        _id: trajetId,
        passager: passagerId,
        })
        .populate("chauffeur", "nom prenom telephone")
        .populate("reservation", "typeVehicule");

        if (!trajet) {
        return res.status(404).json({
            succes: false,
            message: "Trajet introuvable",
        });
        }

        return res.status(200).json({
        succes: true,
        trajet: {
            id: trajet._id,
            date: trajet.createdAt,
            statut: trajet.statut,
            depart: trajet.depart,
            destination: trajet.destination,
            distanceKm: trajet.distanceKm,
            prix: trajet.prix,
            chauffeur: trajet.chauffeur
            ? {
                nom: trajet.chauffeur.nom,
                prenom: trajet.chauffeur.prenom,
                telephone: trajet.chauffeur.telephone,
                }
            : null,
            vehicule: trajet.reservation?.typeVehicule || null,
            note: trajet.note || null,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
