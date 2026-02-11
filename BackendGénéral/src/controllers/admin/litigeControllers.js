const mongoose = require("mongoose");
const Litige = require("../../models/Litiges");
const Reservation = require("../../models/Reservations");
const Utilisateurs = require("../../models/Utilisateurs");


// ===================================LITIGES=======================================

// STATS CARDS - LITIGES
exports.statsLitigesCards = async (req, res) => {
    try {
        const data = await Litige.aggregate([
        {
            $group: {
            _id: "$statut",
            total: { $sum: 1 }
            }
        }
        ]);
        // Valeurs par défaut
        let ouverts = 0;
        let enCours = 0;
        let resolus = 0;

        data.forEach(d => {
        if (d._id === "OUVERT") ouverts = d.total;
        if (d._id === "EN_COURS") enCours = d.total;
        if (d._id === "RESOLU") resolus = d.total;
        });
        const totalLitiges = ouverts + enCours + resolus;
        return res.json({
        succes: true,
        cards: {
            ouverts,
            enCours,
            resolus,
            total: totalLitiges
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement statistiques litiges"
        });
    }
};

// LISTE DES LITIGES (TABLE)
exports.listeLitiges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [litiges, total] = await Promise.all([
        Litige.find()
            .populate("passager", "nom prenom")
            .populate({
            path: "reservation",
            populate: {
                path: "chauffeur",
                select: "nom prenom"
            }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Litige.countDocuments()
        ]);
        return res.json({
        succes: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        litiges: litiges.map(l => ({
            identifiant: l.id,
            reference: l.reference || `DIS-${l._id.toString().slice(-6).toUpperCase()}`,
            date: l.createdAt,
            utilisateurs: {
            passager: l.passager
                ? `${l.passager.prenom} ${l.passager.nom}`
                : null,
            chauffeur: l.reservation?.chauffeur
                ? `${l.reservation.chauffeur.prenom} ${l.reservation.chauffeur.nom}`
                : null
            },
            type: l.type,
            statut: l.statut
        }))
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement liste des litiges"
        });
    }
};

// DÉTAILS D’UN LITIGE
exports.detailsLitige = async (req, res) => {
    try {
        const { litigeId } = req.params;
        const litige = await Litige.findById(litigeId)
        .populate("passager", "nom prenom")
        .populate({
            path: "reservation",
            populate: {
            path: "chauffeur",
            select: "nom prenom"
            }
        });
        if (!litige) {
        return res.status(404).json({
            succes: false,
            message: "Litige introuvable"
        });
        }
        return res.json({
        succes: true,
        litige: {
            reference:
            litige.reference ||
            `DIS-${litige._id.toString().slice(-6).toUpperCase()}`,
            type: litige.type,
            statut: litige.statut,
            informationsGenerales: {
            titre:
                litige.type === "PAIEMENT"
                ? "Paiement non reçu"
                : "Litige signalé",
            description: litige.description,
            dateCreation: litige.createdAt,
            message: "===Trajets===",
            Depart: litige.reservation.depart,
            Destination: litige.reservation.destination,
            },
            partiesConcernees: {
            passager: litige.passager
                ? `${litige.passager.prenom} ${litige.passager.nom}`
                : null,
            chauffeur: litige.reservation?.chauffeur
                ? `${litige.reservation.chauffeur.prenom} ${litige.reservation.chauffeur.nom}`
                : null
            },
            historique: [
            {
                auteur: "Support",
                message: "Litige en cours de traitement",
                date: litige.createdAt
            }
            ],
            actions: {
            resoudre: litige.statut !== "RESOLU",
            rejeter: litige.statut !== "RESOLU"
            }
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement détails litige"
        });
    }
};

// RÉSOUDRE UN LITIGE
exports.resoudreLitige = async (req, res) => {
    try {
        const { litigeId } = req.params;
        const litige = await Litige.findById(litigeId);
        if (!litige) {
        return res.status(404).json({
            succes: false,
            message: "Litige introuvable"
        });
        }
        if (litige.statut === "RESOLU") {
        return res.status(400).json({
            succes: false,
            message: "Litige déjà résolu"
        });
        }
        litige.statut = "RESOLU";
        await litige.save();
        return res.json({
        succes: true,
        message: "Litige résolu avec succès"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur lors de la résolution du litige"
        });
    }
};

// REJETER UN LITIGE
exports.rejeterLitige = async (req, res) => {
    try {
        const { litigeId } = req.params;
        const litige = await Litige.findById(litigeId);
        if (!litige) {
        return res.status(404).json({
            succes: false,
            message: "Litige introuvable"
        });
        }
        if (litige.statut === "RESOLU") {
        return res.status(400).json({
            succes: false,
            message: "Litige déjà clôturé"
        });
        }
        litige.statut = "REJETER";
        await litige.save();
        return res.json({
        succes: true,
        message: "Litige rejeté"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur lors du rejet du litige"
        });
    }
};

// RÉPARTITION DES LITIGES PAR TYPE (DONUT)
exports.repartitionLitigesParType = async (req, res) => {
    try {
        const period = req.query.period || "mensuel";
        const now = new Date();
        let startDate;
        if (period === "annuel") {
        startDate = new Date(now.getFullYear(), 0, 1); // 1er janvier
        } else {
        // mensuel (par défaut)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const data = await Litige.aggregate([
        {
            $match: {
            createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
            _id: "$type",
            total: { $sum: 1 }
            }
        },
        {
            $project: {
            _id: 0,
            label: "$_id",
            total: 1
            }
        },
        {
            $sort: { total: -1 }
        }
        ]);
        return res.json({
        succes: true,
        period,
        data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur répartition des litiges par type"
        });
    }
};