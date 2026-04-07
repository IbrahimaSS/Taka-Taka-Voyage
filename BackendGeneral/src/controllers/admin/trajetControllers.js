const mongoose = require("mongoose");
const Reservation = require("../../models/Reservations");
const Evaluation = require("../../models/Evaluations");
const ChauffeurProfile = require("../../models/ChauffeurProfile");


//====================================GESTIONS TRAJETS=============================

// CARDS TRAJETS (ADMIN)
// CARDS TRAJETS (ADMIN)
exports.statsTrajets = async (req, res) => {
    try {
        // Début du jour
        const debutJour = new Date();
        debutJour.setHours(0, 0, 0, 0);

        // Trajets aujourd’hui
        const trajetsAujourdhui = await Reservation.countDocuments({
            createdAt: { $gte: debutJour },
        });

        // Trajets en cours
        const trajetsEnCours = await Reservation.countDocuments({
            statut: "EN_COURS",
        });

        // Trajets annulés
        const trajetsAnnules = await Reservation.countDocuments({
            statut: { $in: ["ANNULEE", "ANNULEE_AVEC_FRAIS"] },
        });

        // Revenus journaliers (PAYE aujourd’hui)
        const revenusAgg = await Reservation.aggregate([
            {
                $match: {
                    "paiement.statut": "PAYE",
                    createdAt: { $gte: debutJour },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$prix" },
                },
            },
        ]);

        const revenusJournaliers = revenusAgg?.[0]?.total || 0;

        // Distance Totale (Somme de tout les trajets terminés)
        const distanceAgg = await Reservation.aggregate([
            { $match: { statut: "TERMINEE" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$distanceKm" }
                }
            }
        ]);
        const distanceTotale = distanceAgg?.[0]?.total || 0;


        return res.status(200).json({
            succes: true,
            stats: {
                trajetsAujourdhui,
                trajetsEnCours,
                trajetsAnnules,
                revenusJournaliers,
                distanceTotale
            },
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// TOUS LES TRAJETS (ADMIN + PAGINATION + FILTRES)
exports.tousLesTrajets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { chauffeur, passager } = req.query;

        const filtre = {};
        if (chauffeur) filtre.chauffeur = chauffeur;
        if (passager) filtre.passager = passager;

        // Total trajets
        const total = await Reservation.countDocuments(filtre);

        // Trajets paginés
        const trajets = await Reservation.find(filtre)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("passager", "nom prenom telephone photoUrl email createdAt noteMoyenne")
            .populate("chauffeur", "nom prenom telephone photoUrl vehicule noteMoyenne")
            .select("_id depart destination departCoords destinationCoords statut prix createdAt dureeMin distanceKm typeVehicule reference paiement");

        // Enrichissement complet des chauffeurs et passagers
        const resultats = await Promise.all(trajets.map(async (trip) => {
            const t = trip.toObject();

            // 1. Infos Passager
            if (t.passager) {
                const nbTrajetsPassager = await Reservation.countDocuments({ passager: t.passager._id });
                t.passager.nombreTrajets = nbTrajetsPassager;
                t.passager.inscritLe = t.passager.createdAt;
                // Note moyenne déjà récupérée via populate
            }

            // 2. Infos Chauffeur
            if (t.chauffeur) {
                const profile = await ChauffeurProfile.findOne({ utilisateur: t.chauffeur._id });
                const nbTrajetsChauffeur = await Reservation.countDocuments({ chauffeur: t.chauffeur._id });

                if (profile) {
                    if (!t.chauffeur.vehicule) t.chauffeur.vehicule = {};
                    t.chauffeur.vehicule.marque = profile.marqueVehicule || "";
                    t.chauffeur.vehicule.modele = profile.modeleVehicule || "";
                    t.chauffeur.vehicule.immatriculation = profile.plaque || "";
                    t.chauffeur.vehicule.couleur = profile.couleurVehicule || "";
                    t.chauffeur.vehicule.places = profile.capaciteVehicule || 1;

                    // Priorité à la note du profil, sinon celle de l'utilisateur, sinon 5
                    t.chauffeur.noteMoyenne = profile.noteMoyenne || t.chauffeur.noteMoyenne || 5;
                    t.chauffeur.nombreTrajets = nbTrajetsChauffeur;
                    t.chauffeur.valideLe = profile.valideLe || profile.createdAt;
                } else {
                    t.chauffeur.noteMoyenne = t.chauffeur.noteMoyenne || 5;
                    t.chauffeur.nombreTrajets = nbTrajetsChauffeur;
                }
            }
            return t;
        }));

        return res.status(200).json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                from: total === 0 ? 0 : skip + 1,
                to: skip + trajets.length,
            },
            trajets: resultats,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// RECHERCHER UN TRAJET=======
exports.trajetsCarte = async (req, res) => {
    try {
        const { depart, destination } = req.query;

        const filter = {
            statut: { $in: ["EN_COURS", "EN_ATTENTE", "ACCEPTEE"] },
        };

        if (depart) {
            filter.depart = { $regex: depart, $options: "i" };
        }

        if (destination) {
            filter.destination = { $regex: destination, $options: "i" };
        }

        const trajets = await Reservation.find(filter).select(
            "_id depart destination latitudeDepart longitudeDepart latitudeArrivee longitudeArrivee"
        );

        return res.status(200).json({
            succes: true,
            trajets,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// DETAIL D'UN TRAJET (ADMIN)
exports.detailTrajet = async (req, res) => {
    try {
        const { id } = req.params;

        const trajet = await Reservation.findById(id)
            .populate("passager", "nom prenom email telephone")
            .populate("chauffeur", "nom prenom telephone");

        if (!trajet) {
            return res.status(404).json({
                succes: false,
                message: "Trajet introuvable",
            });
        }

        // 🔹 Profil chauffeur (véhicule)
        let vehicule = null;
        if (trajet.chauffeur) {
            const profil = await ChauffeurProfile.findOne({
                utilisateur: trajet.chauffeur._id,
            });

            if (profil) {
                vehicule = {
                    modele: profil.marqueVehicule,
                    plaque: profil.plaque,
                    couleur: profil.couleur,
                    annee: profil.annee,
                    capacite: profil.capacite,
                    carburant: profil.carburant,
                };
            }
        }

        // NOTE DU CHAUFFEUR POUR CE TRAJET
        const evaluation = await Evaluation.findOne({
            reservation: trajet._id,
        });

        const noteChauffeur = evaluation
            ? {
                noteGlobale: evaluation.noteGlobale,
                details: evaluation.details,
                ressenti: evaluation.ressenti,
                pointsForts: evaluation.pointsForts,
                commentaire: evaluation.commentaire,
            }
            : null;

        // Finances
        const totalPassager = trajet.prix || 0;
        const commission = Math.round(totalPassager * 0.15);
        const fraisPlateforme = Math.round(totalPassager * 0.05);
        const gainChauffeur = totalPassager - commission - fraisPlateforme;

        return res.status(200).json({
            succes: true,
            trajet: {
                reference: trajet.reference || `TR-${trajet._id.toString().slice(-6)}`,
                statut: trajet.statut,
                paiement: trajet.paiement?.methode || "CASH",
                date: trajet.createdAt,

                depart: trajet.depart,
                destination: trajet.destination,

                distanceKm: trajet.distanceKm,
                dureeMin: trajet.dureeMin,

                passager: trajet.passager,
                chauffeur: trajet.chauffeur,
                vehicule,
                noteChauffeur,

                finances: {
                    totalPassager,
                    commission,
                    fraisPlateforme,
                    gainChauffeur,
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