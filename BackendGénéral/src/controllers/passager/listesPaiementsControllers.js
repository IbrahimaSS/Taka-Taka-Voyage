const Paiement = require("../../models/Paiements");


// HISTORIQUE DES PAIEMENTS POUR LE PASSAGER (pagination + filtre)
exports.listerPaiementsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filtre = {
        passager: passagerId,
        };

        // filtres optionnels
        if (req.query.type) {
        filtre.type = req.query.type;
        }

        if (req.query.statut) {
        filtre.statut = req.query.statut;
        }

        const total = await Paiement.countDocuments(filtre);
        const paiements = await Paiement.find(filtre)
        .populate({
            path: "reservation",
            select: "depart destination",
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
        paiements,
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// DETAILS D'UN PAIEMENTS
exports.detailPaiementPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur?._id;
        const { paiementId } = req.params;

        if (!passagerId) {
        return res.status(401).json({
            succes: false,
            message: "Utilisateur non authentifié",
        });
        }

        const paiement = await Paiement.findById(paiementId)
        .populate({
            path: "reservation",
            select: "depart destination",
        });

        if (!paiement) {
        return res.status(404).json({
            succes: false,
            message: "Paiement introuvable",
        });
        }
        // Sécurité : le paiement doit appartenir au passager
        if (
        paiement.reservation &&
        paiement.reservation.passager?.toString() !== passagerId.toString()
        ) {
        return res.status(403).json({
            succes: false,
            message: "Accès refusé",
        });
        }

        return res.status(200).json({
        succes: true,
        paiement: {
            id: paiement._id,
            reference: paiement.reference,
            montant: paiement.montantTotal,
            type: "PAIEMENT_TRAJET",
            statut: paiement.statut,
            methode: paiement.methode,
            date: paiement.createdAt,
            trajet: paiement.reservation
            ? {
                depart: paiement.reservation.depart,
                destination: paiement.reservation.destination,
                }
            : null,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// STATS PAIEMENTS PASSAGER (cards dashboard)
exports.statsPaiementsPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;

        const stats = await Paiement.aggregate([
        {
            $lookup: {
            from: "reservations",
            localField: "reservation",
            foreignField: "_id",
            as: "reservation",
            },
        },
        { $unwind: "$reservation" },

        // sécurité : uniquement les paiements du passager connecté
        {
            $match: {
            "reservation.passager": passagerId,
            },
        },
        {
            $group: {
            _id: null,
            totalTransactions: { $sum: 1 },

            totalRevenus: {
                $sum: {
                $cond: [
                    { $eq: ["$statut", "PAYE"] },
                    "$montantTotal",
                    0,
                ],
                },
            },

            totalEnAttente: {
                $sum: {
                $cond: [
                    { $eq: ["$statut", "EN_ATTENTE"] },
                    1,
                    0,
                ],
                },
            },

            soldeNet: {
                $sum: {
                $cond: [
                    { $eq: ["$statut", "PAYE"] },
                    "$montantChauffeur",
                    0,
                ],
                },
            },
            },
        },
        ]);

        const resultat = stats[0] || {
        totalTransactions: 0,
        totalRevenus: 0,
        totalEnAttente: 0,
        soldeNet: 0,
        };

        return res.status(200).json({
        succes: true,
        stats: {
            transactions: resultat.totalTransactions,
            revenus: resultat.totalRevenus,
            enAttente: resultat.totalEnAttente,
            soldeNet: resultat.soldeNet,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

