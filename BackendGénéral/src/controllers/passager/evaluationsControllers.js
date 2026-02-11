// src/controllers/evaluations.passager.controller.js
const Evaluation = require("../../models/Evaluations");

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
            select: "nom prenom photo noteMoyenne",
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

// DÉTAIL D'UNE ÉVALUATION
exports.detailEvaluationPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const { evaluationId } = req.params;

        const evaluation = await Evaluation.findById(evaluationId)
        .populate("chauffeur", "nom prenom photo")
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

// REPARTITION PAR ETOILES
exports.statsEvaluationsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;

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
        repartition: stats, // ex: [{ _id: 5, total: 12 }]
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

