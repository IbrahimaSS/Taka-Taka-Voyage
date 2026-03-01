const Trajet = require("../../models/Trajets");
const ChauffeurProfile = require("../../models/ChauffeurProfile");

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

        const filtre = { passager: passagerId };

        if (req.query.statut) {
            filtre.statut = req.query.statut;
        }

        const total = await Trajet.countDocuments(filtre);

        const trajets = await Trajet.find(filtre)
            .populate("chauffeur", "nom prenom telephone email vehicule noteMoyenne photoUrl")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // ✅ Enrichir chaque trajet avec le véhicule réel depuis ChauffeurProfile
        const chauffeurIds = trajets
            .map(t => t.chauffeur?._id)
            .filter(Boolean);

        const profils = await ChauffeurProfile.find({ utilisateur: { $in: chauffeurIds } })
            .select("utilisateur marqueVehicule modeleVehicule couleurVehicule typeVehicule plaque")
            .lean();

        const profilMap = {};
        profils.forEach(p => { profilMap[String(p.utilisateur)] = p; });

        const trajetsEnrichis = trajets.map(t => {
            if (!t.chauffeur) return t;
            const profil = profilMap[String(t.chauffeur._id)];
            return {
                ...t,
                chauffeur: {
                    ...t.chauffeur,
                    profilVehicule: profil ? {
                        marque: profil.marqueVehicule || null,
                        modele: profil.modeleVehicule || null,
                        couleur: profil.couleurVehicule || null,
                        type: profil.typeVehicule || null,
                        plaque: profil.plaque || null,
                    } : null,
                }
            };
        });

        return res.status(200).json({
            succes: true,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            trajets: trajetsEnrichis,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

//DETAIL D'UN TRAJET POUR LE PASSAGER
exports.detailTrajetPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const { trajetId } = req.params;

        const trajet = await Trajet.findOne({ _id: trajetId, passager: passagerId })
            .populate("chauffeur", "nom prenom telephone email vehicule noteMoyenne photoUrl")
            .populate("reservation", "typeVehicule")
            .lean();

        if (!trajet) {
            return res.status(404).json({ succes: false, message: "Trajet introuvable" });
        }

        // ✅ Récupérer le profil véhicule réel depuis ChauffeurProfile
        let profilVehicule = null;
        if (trajet.chauffeur?._id) {
            const profil = await ChauffeurProfile.findOne({ utilisateur: trajet.chauffeur._id })
                .select("marqueVehicule modeleVehicule couleurVehicule typeVehicule plaque")
                .lean();
            if (profil) {
                profilVehicule = {
                    marque: profil.marqueVehicule || null,
                    modele: profil.modeleVehicule || null,
                    couleur: profil.couleurVehicule || null,
                    type: profil.typeVehicule || null,
                    plaque: profil.plaque || null,
                };
            }
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
                        noteMoyenne: trajet.chauffeur.noteMoyenne,
                        photoUrl: trajet.chauffeur.photoUrl,
                        vehicule: trajet.chauffeur.vehicule || null,
                        profilVehicule,
                    }
                    : null,
                vehicule: trajet.reservation?.typeVehicule || null,
                note: trajet.note || null,
            },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
