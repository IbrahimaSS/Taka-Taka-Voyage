const mongoose = require("mongoose");
const Reservation = require("../../models/Reservations");
const Evaluation = require("../../models/Evaluations");
const ChauffeurProfile = require("../../models/ChauffeurProfile");


//====================================GESTIONS TRAJETS=============================

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
        statut: "ANNULEE",
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

        return res.status(200).json({
        succes: true,
        stats: {
            trajetsAujourdhui,
            trajetsEnCours,
            trajetsAnnules,
            revenusJournaliers,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// TOUS LES TRAJETS (ADMIN + PAGINATION)
exports.tousLesTrajets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Total trajets
        const total = await Reservation.countDocuments();

        // Trajets paginés
        const trajets = await Reservation.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("passager", "nom prenom telephone")
        .populate("chauffeur", "nom prenom")
        .select("depart destination statut prix createdAt");

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
        trajets,
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
            paiement: trajet.paiement?.mode || "ESPECES",
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