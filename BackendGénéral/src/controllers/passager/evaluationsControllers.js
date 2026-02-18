// src/controllers/passager/evaluationsControllers.js
const Evaluation = require("../../models/Evaluations");
const Reservation = require("../../models/Reservations");
const Utilisateurs = require("../../models/Utilisateurs");

/**
 * LISTER LES EVALUATIONS DU PASSAGER
 */
exports.listerEvaluationsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filtre = { passager: passagerId };

        // filtre optionnel par note
        if (req.query.note) {
            filtre.noteGlobale = Number(req.query.note);
        }

        const total = await Evaluation.countDocuments(filtre);

        const evaluations = await Evaluation.find(filtre)
            .populate({
                path: "chauffeur",
                select: "nom prenom photoUrl noteMoyenne",
            })
            .populate({
                path: "reservation",
                select: "depart destination createdAt",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            evaluations,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

/**
 * DETAIL D'UNE EVALUATION
 */
exports.detailEvaluationPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const { evaluationId } = req.params;

        const evaluation = await Evaluation.findById(evaluationId)
            .populate("chauffeur", "nom prenom photoUrl")
            .populate("reservation", "depart destination");

        if (!evaluation) {
            return res.status(404).json({
                succes: false,
                message: "Évaluation introuvable",
            });
        }

        // 🔐 sécurité : doit appartenir au passager
        if (evaluation.passager.toString() !== passagerId.toString()) {
            return res.status(403).json({
                succes: false,
                message: "Accès refusé",
            });
        }

        return res.status(200).json({
            succes: true,
            evaluation,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

/**
 * STATS (cards)
 */
exports.statsEvaluationsPassager = async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const passagerId = new mongoose.Types.ObjectId(req.utilisateur._id);

        const stats = await Evaluation.aggregate([
            { $match: { passager: passagerId } },
            {
                $group: {
                    _id: "$noteGlobale",
                    total: { $sum: 1 },
                },
            },
            { $sort: { _id: -1 } },
        ]);

        const totalEvaluations = await Evaluation.countDocuments({
            passager: passagerId,
        });

        return res.status(200).json({
            succes: true,
            totalEvaluations,
            repartition: stats,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

/**
 * 🌟 CRÉER UNE ÉVALUATION
 */
exports.creerEvaluation = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const {
            reservationId,
            noteGlobale,
            details,
            ressenti,
            pointsForts,
            commentaire
        } = req.body;

        // 1. Vérifier la réservation
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ succes: false, message: "Réservation introuvable" });
        }

        // Sécurité
        if (reservation.passager.toString() !== passagerId.toString()) {
            return res.status(403).json({ succes: false, message: "Accès non autorisé" });
        }

        // On ne peut noter qu'une course TERMINEE
        if (reservation.statut !== "TERMINEE") {
            return res.status(400).json({ succes: false, message: "La course doit être terminée pour être évaluée" });
        }

        // Vérifier si déjà évaluée
        const existing = await Evaluation.findOne({ reservation: reservationId });
        if (existing) {
            return res.status(400).json({ succes: false, message: "Cette course a déjà été évaluée" });
        }

        // Mappings pour correspondre au modèle Mongoose
        const ressentiMap = {
            'EXCELLENT': 'EXCELLENT',
            'GOOD': 'TRES_BIEN',
            'AVERAGE': 'CORRECT',
            'POOR': 'MEDIOCRE'
        };

        const tagsMap = {
            'Conduite fluide': 'CONDUITE_FLUIDE',
            'Véhicule propre': 'VEHICULE_PROPRE',
            'Très ponctuel': 'TRES_PONCTUEL',
            'Service courtois': 'SERVICE_COURTOIS',
            'Prix juste': 'PRIX_JUSTE'
        };

        const mappedRessenti = ressentiMap[ressenti] || null;
        const mappedTags = (pointsForts || [])
            .map(t => tagsMap[t])
            .filter(t => t !== undefined);

        const mappedDetails = {
            conduite: details?.driving || noteGlobale,
            ponctualite: details?.punctuality || noteGlobale,
            proprete: details?.cleanliness || noteGlobale,
            communication: details?.communication || noteGlobale
        };

        const mongoose = require("mongoose");
        // 2. Créer l'évaluation
        const evaluation = await Evaluation.create({
            reservation: new mongoose.Types.ObjectId(reservationId),
            passager: new mongoose.Types.ObjectId(passagerId),
            chauffeur: new mongoose.Types.ObjectId(reservation.chauffeur),
            noteGlobale: Number(noteGlobale),
            details: mappedDetails,
            ressenti: mappedRessenti,
            pointsForts: mappedTags,
            commentaire
        });

        // 3. Mettre à jour la note du chauffeur
        const chauffeurId = reservation.chauffeur;
        const allEvaluations = await Evaluation.find({ chauffeur: chauffeurId });
        const totalNotes = allEvaluations.length;
        const sommeNotes = allEvaluations.reduce((acc, curr) => acc + curr.noteGlobale, 0);
        const nouvelleMoyenne = parseFloat((sommeNotes / totalNotes).toFixed(1));

        await Utilisateurs.findByIdAndUpdate(chauffeurId, {
            noteMoyenne: nouvelleMoyenne,
            nombreEvaluations: totalNotes
        });

        return res.status(201).json({
            succes: true,
            message: "Évaluation enregistrée avec succès",
            evaluation
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};
