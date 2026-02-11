const mongoose = require("mongoose");
const Reservation = require("../../models/Reservations");
const Paiement = require("../../models/Paiements");

// ===================================GESTIONS PAIEMENTS==============================

// CARDS PAEIMENTS
exports.statsPaiements = async (req, res) => {
    try {
        const stats = await Paiement.aggregate([
        {
            $match: { statut: "PAYE" },
        },
        {
            $group: {
            _id: null,
            revenusTotaux: { $sum: "$montantTotal" },
            totalPaiements: { $sum: 1 },
            totalCommissions: { $sum: "$commissionPlateforme" },
            },
        },
        ]);

        const result = stats[0] || {
        revenusTotaux: 0,
        totalPaiements: 0,
        totalCommissions: 0,
        };

        return res.status(200).json({
        succes: true,
        cards: {
            revenusTotaux: result.revenusTotaux,
            totalPaiements: result.totalPaiements,
            totalCommissions: result.totalCommissions,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// EVOLUTIONS PAIEMENTS GRAPHES
exports.evolutionPaiements = async (req, res) => {
    try {
        const periode = parseInt(req.query.periode || 30);
        const mode = req.query.mode || "journalier";

        const dateDebut = new Date();
        dateDebut.setDate(dateDebut.getDate() - periode);

        const groupId =
        mode === "mensuel"
            ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
            : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

        const data = await Paiement.aggregate([
        {
            $match: {
            statut: "PAYE",
            createdAt: { $gte: dateDebut },
            },
        },
        {
            $group: {
            _id: groupId,
            revenus: { $sum: "$montantTotal" },
            commissions: { $sum: "$commissionPlateforme" },
            },
        },
        { $sort: { _id: 1 } },
        ]);

        res.json({
        succes: true,
        evolution: data.map((d) => ({
            label: d._id,
            revenus: d.revenus,
            commissions: d.commissions,
        })),
        });
    } catch (e) {
        res.status(500).json({ succes: false, message: e.message });
    }
};

// REPARTITION PAR METHODE DE PAIE
exports.repartitionPaiements = async (req, res) => {
    try {
        const data = await Paiement.aggregate([
        { $match: { statut: "PAYE" } },
        {
            $group: {
            _id: "$methode",
            totalMontant: { $sum: "$montantTotal" },
            totalPaiements: { $sum: 1 },
            },
        },
        ]);

        const totalGlobal = data.reduce(
        (sum, d) => sum + d.totalMontant,
        0
        );

        const repartition = data.map((d) => ({
        methode: d._id,
        montant: d.totalMontant,
        nombre: d.totalPaiements,
        pourcentage: ((d.totalMontant / totalGlobal) * 100).toFixed(1),
        }));

        res.json({
        succes: true,
        repartition,
        });
    } catch (e) {
        res.status(500).json({ succes: false, message: e.message });
    }
};

// LISTES DES PAIEMENTS
exports.listePaiements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Paiement.countDocuments();

        const paiements = await Paiement.find()
        .populate({
            path: "reservation",
            populate: [
            { path: "passager", select: "nom prenom telephone" },
            { path: "chauffeur", select: "nom prenom telephone" },
            ],
            select: "depart destination",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        res.json({
        succes: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        paiements,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur lors du chargement des paiements",
        });
    }
};

// DETAILS D'UN PAEIEMENT
exports.detailsPaiement = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id).populate({
        path: "reservation",
        select: "depart destination distanceKm dureeMin createdAt updatedAt paiement passager chauffeur",
        populate: [
            { path: "passager", select: "nom prenom telephone email note" },
            { path: "chauffeur", select: "nom prenom telephone" },
        ],
        });

        if (!paiement) {
        return res.status(404).json({ succes: false, message: "Paiement introuvable" });
        }

        const r = paiement.reservation;

        // passerelle (exemple)
        const passerelle = (paiement.methode === "ORANGE_MONEY" || paiement.methode === "MTN_MONEY")
        ? "API"
        : "Direct";

        return res.json({
        succes: true,
        paiement: {
            id: paiement._id,
            statut: paiement.statut,
            methode: paiement.methode,
            reference: r?.paiement?.reference ?? null,
            traiteLe: paiement.updatedAt,

            // Montants
            montantTotal: paiement.montantTotal,
            commissionPlateforme: paiement.commissionPlateforme,
            montantNet: paiement.montantChauffeur,   // net chauffeur

            // Infos trajet (depuis Reservation)
            trajet: {
            reservationId: r?._id,
            depart: r?.depart,
            destination: r?.destination,
            distanceKm: r?.distanceKm,
            dureeMin: r?.dureeMin,
            date: r?.createdAt,
            },

            passager: r?.passager ?? null,
            chauffeur: r?.chauffeur ?? null,

            // Infos techniques
            technique: {
            idTransaction: paiement._id,
            reference: r?.paiement?.reference ?? null,
            passerelle,
            },
        },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};
