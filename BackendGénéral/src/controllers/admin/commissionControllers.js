const mongoose = require("mongoose");
const Paiement = require("../../models/Paiements");


//=================================COMMISSIONS========================================

// STATS COMMISSIONS
exports.statsCommissions = async (req, res) => {
    try {
        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);

        const finMois = new Date();
        finMois.setMonth(finMois.getMonth() + 1);
        finMois.setDate(0);
        finMois.setHours(23, 59, 59, 999);

        const [
        commissionsCeMoisAgg,
        aVerserAgg,
        chauffeursPayes
        ] = await Promise.all([
        // TOUTES les commissions du mois
        Paiement.aggregate([
            {
            $match: {
                statut: "PAYE",
                createdAt: { $gte: debutMois, $lte: finMois }
            }
            },
            {
            $group: {
                _id: null,
                total: { $sum: "$commissionPlateforme" }
            }
            }
        ]),

        // À verser
        Paiement.aggregate([
            {
            $match: { statut: "PAYE" }
            },
            {
            $group: {
                _id: null,
                total: { $sum: "$montantChauffeur" }
            }
            }
        ]),

        // Chauffeurs payés
        Paiement.distinct("chauffeur", { statut: "PAYE" })
        ]);

        return res.json({
        succes: true,
        Cards: {
            ceMois: commissionsCeMoisAgg[0]?.total || 0,
            aVerser: aVerserAgg[0]?.total || 0,
            chauffeursPayes: chauffeursPayes.length
        }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur stats commissions"
        });
    }
};

// EVOLUTIONS COMMISSIONS
exports.evolutionCommissions = async (req, res) => {
    try {
        const mode = req.query.mode || "mensuel";

        const groupId =
        mode === "annuel"
            ? { annee: { $year: "$createdAt" } }
            : {
                annee: { $year: "$createdAt" },
                mois: { $month: "$createdAt" },
            };

        const data = await Paiement.aggregate([
        { $match: { statut: "PAYE" } },
        {
            $group: {
            _id: groupId,
            total: { $sum: "$commissionPlateforme" },
            },
        },
        { $sort: { "_id.annee": 1, "_id.mois": 1 } },
        ]);

        const formatted = data.map((d) => ({
        label:
            mode === "annuel"
            ? `${d._id.annee}`
            : `${d._id.mois}/${d._id.annee}`,
        total: d.total,
        }));

        res.json({ succes: true, data: formatted });
    } catch (e) {
        console.error(e);
        res.status(500).json({ succes: false, message: "Erreur évolution commissions" });
    }
};

//REPARTITION COMMISSIONS PAR SERVICE
exports.repartitionCommissions = async (req, res) => {
    try {
        const data = await Paiement.aggregate([
        { $match: { statut: "PAYE" } },

        {
            $lookup: {
            from: "reservations",
            localField: "reservation",
            foreignField: "_id",
            as: "reservation"
            }
        },
        { $unwind: "$reservation" },

        {
            $group: {
            _id: "$reservation.typeVehicule",
            total: { $sum: "$commissionPlateforme" }
            }
        }
        ]);

        const totalGlobal = data.reduce((s, d) => s + d.total, 0);

        const repartition = data.map(d => ({
        service: d._id,
        montant: d.total,
        pourcentage: totalGlobal
            ? Math.round((d.total / totalGlobal) * 100)
            : 0
        }));

        res.json({ succes: true, repartition });
    } catch (e) {
        console.error(e);
        res.status(500).json({ succes: false, message: "Erreur répartition" });
    }
};

// LISTE DES CHAUFFEURS À PAYER (ADMIN)
exports.listeChauffeursAPayer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const data = await Paiement.aggregate([
        // CONDITION CLÉ
        {
            $match: {
            statut: "PAYE",
            verse: false
            }
        },
        // Reservation
        {
            $lookup: {
            from: "reservations",
            localField: "reservation",
            foreignField: "_id",
            as: "reservation"
            }
        },
        { $unwind: "$reservation" },
        // Chauffeur = UTILISATEUR DIRECT
        {
            $lookup: {
            from: "utilisateurs",
            localField: "reservation.chauffeur",
            foreignField: "_id",
            as: "chauffeur"
            }
        },
        { $unwind: "$chauffeur" },
        // Groupement par chauffeur
        {
            $group: {
            _id: "$chauffeur._id",
            nom: { $first: "$chauffeur.nom" },
            prenom: { $first: "$chauffeur.prenom" },
            telephone: { $first: "$chauffeur.telephone" },
            service: { $first: "$reservation.typeVehicule" },
            montantBrut: { $sum: "$montantTotal" },
            commission: { $sum: "$commissionPlateforme" },
            montantNet: { $sum: "$montantChauffeur" }
            }
        },

        { $sort: { montantNet: -1 } },
        { $skip: skip },
        { $limit: limit }
        ]);

        return res.json({
        succes: true,
        pagination: {
            page,
            limit,
            total: data.length
        },
        chauffeurs: data.map(d => ({
            chauffeur: {
            nom: `${d.prenom} ${d.nom}`,
            telephone: d.telephone
            },
            service: d.service,
            montantBrut: d.montantBrut,
            commission: d.commission,
            montantNet: d.montantNet,
            statut: "A_PAYER"
        }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur liste chauffeurs à payer"
        });
    }
};

// TRAITER (MARQUER COMME PAYÉ) UN PAIEMENT
exports.traiterPaiement = async (req, res) => {
    try {
        const { paiementId } = req.params;
        const { commentaire } = req.body;

        const paiement = await Paiement.findById(paiementId);

        if (!paiement) {
        return res.status(404).json({
            succes: false,
            message: "Paiement introuvable"
        });
        }
        if (paiement.verse) {
        return res.json({
            succes: false,
            message: "Paiement déjà traité"
        });
        }
        paiement.verse = true;
        paiement.verseLe = new Date();
        paiement.versePar = req.utilisateur._id;
        paiement.commentaireVersement = commentaire?.trim() || null;

        await paiement.save();

        return res.json({
        succes: true,
        message: "Paiement traité avec succès"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur lors du traitement du paiement"
        });
    }
};

// DETAILS D'UN PAIEMENT (ADMIN)
exports.detailsPaiementAdmin = async (req, res) => {
    try {
        const { paiementId } = req.params;
        const paiement = await Paiement.findById(paiementId)
        // Reservation + Chauffeur (UTILISATEUR DIRECT)
        .populate({
            path: "reservation",
            populate: {
            path: "chauffeur",
            model: "Utilisateurs",
            select: "nom prenom email telephone adresse"
            }
        })
        // Admin qui a traité le paiement
        .populate({
            path: "versePar",
            select: "nom prenom"
        });

        if (!paiement) {
        return res.status(404).json({
            succes: false,
            message: "Paiement introuvable"
        });
        }

        const chauffeurUser = paiement.reservation?.chauffeur || null;

        return res.json({
        succes: true,
        paiement: {
            id: paiement._id,
            reference: paiement.reference,
            statut: paiement.verse ? "PAYE" : "A_PAYER",
            methode: paiement.methode,
            service: paiement.reservation?.typeVehicule || null,
            echeance: paiement.echeance || null,

            // ================= CHAUFFEUR =================
            chauffeur: chauffeurUser
            ? {
                nom: `${chauffeurUser.prenom} ${chauffeurUser.nom}`,
                email: chauffeurUser.email,
                telephone: chauffeurUser.telephone,
                }
            : null,

            // ================= FINANCES =================
            finances: {
            trajets: paiement.nombreTrajets || 0,
            brut: paiement.montantTotal,
            commission: paiement.commissionPlateforme,
            aVerser: paiement.montantChauffeur
            },

            // ================= PAIEMENT =================
            paiementInfo: {
            compte: paiement.compte || null,
            banque: paiement.banque || null
            },

            // ================= META =================
            meta: {
            creeLe: paiement.createdAt,
            verseLe: paiement.verseLe || null,
            versePar: paiement.versePar
                ? `${paiement.versePar.prenom} ${paiement.versePar.nom}`
                : null
            },

            // ================= NOTES =================
            notes: [
            {
                type: "systeme",
                message: "Paiement généré automatiquement"
            },
            paiement.commentaireVersement
                ? {
                    type: "admin",
                    message: paiement.commentaireVersement
                }
                : null
            ].filter(Boolean)
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement détails paiement"
        });
    }
};

// MODIFIER UN PAIEMENT (ADMIN) - VERSION FINALE
exports.modifierPaiement = async (req, res) => {
    try {
        const { paiementId } = req.params;
        const { methode, compte, commentaire } = req.body;
        const paiement = await Paiement.findById(paiementId)
        .populate({
            path: "reservation",
            populate: {
            path: "chauffeur",
            model: "Utilisateurs",
            select: "nom prenom email telephone adresse"
            }
        });
        if (!paiement) {
        return res.status(404).json({
            succes: false,
            message: "Paiement introuvable"
        });
        }
        // Sécurité : paiement déjà versé
        if (paiement.verse) {
        return res.status(400).json({
            succes: false,
            message: "Impossible de modifier un paiement déjà versé"
        });
        }
        // ================= MONTANTS (NON MODIFIABLES ICI) =================
        const brut = paiement.montantTotal;
        const commission = paiement.commissionPlateforme;
        const aVerser = paiement.montantChauffeur;

        // ================= CHAMPS MODIFIABLES =================
        paiement.methode = methode || paiement.methode;
        paiement.compte = compte || paiement.compte;

        if (commentaire) {
        paiement.commentaireModification = commentaire.trim();
        }

        await paiement.save();
        const chauffeurUser = paiement.reservation?.chauffeur || null;
        return res.json({
        succes: true,
        message: "Paiement modifié avec succès",

        paiement: {
            id: paiement._id,
            reference: paiement.reference,
            statut: paiement.verse ? "PAYE" : "A_PAYER",
            methode: paiement.methode,
            service: paiement.reservation?.typeVehicule || null,
            echeance: paiement.echeance || null,
            chauffeur: chauffeurUser
            ? {
                nom: `${chauffeurUser.prenom} ${chauffeurUser.nom}`,
                email: chauffeurUser.email,
                telephone: chauffeurUser.telephone,
                adresse: chauffeurUser.adresse || null
                }
            : null,

            // Ces champs sont affichés MAIS PAS modifiables
            finances: {
            trajets: paiement.nombreTrajets || 0,
            brut,
            commission,
            aVerser
            },

            paiementInfo: {
            compte: paiement.compte || null,
            banque: paiement.banque || null
            },

            meta: {
            creeLe: paiement.createdAt,
            verseLe: paiement.verseLe || null,
            versePar: paiement.versePar || null
            },

            notes: [
            {
                type: "systeme",
                message: "Paiement généré automatiquement"
            },
            paiement.commentaireModification
                ? {
                    type: "admin",
                    message: paiement.commentaireModification
                }
                : null
            ].filter(Boolean)
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur lors de la modification du paiement"
        });
    }
};

// COMMISSION TOTALE CE MOIS
exports.commissionTotaleCeMois = async (req, res) => {
    try {
        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);
        const finMois = new Date();
        finMois.setMonth(finMois.getMonth() + 1);
        finMois.setDate(0);
        finMois.setHours(23, 59, 59, 999);
        const result = await Paiement.aggregate([
        {
            $match: {
            verse: true,
            verseLe: { $gte: debutMois, $lte: finMois }
            }
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$commissionPlateforme" }
            }
        }
        ]);

        return res.json({
        message: "=====TOTAL DES COMMISSIONS DU MOIS=====",
        succes: true,
        total: result[0]?.total || 0
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur commission totale du mois"
        });
    }
};

// CHAUFFEURS PAYÉS (CE MOIS)
exports.chauffeursPayesCeMois = async (req, res) => {
    try {
        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);
        const finMois = new Date();
        finMois.setMonth(finMois.getMonth() + 1);
        finMois.setDate(0);
        finMois.setHours(23, 59, 59, 999);
        const data = await Paiement.aggregate([
        {
            $match: {
            verse: true,
            verseLe: { $gte: debutMois, $lte: finMois }
            }
        },
        {
            $lookup: {
            from: "reservations",
            localField: "reservation",
            foreignField: "_id",
            as: "reservation"
            }
        },
        { $unwind: "$reservation" },
        {
            $group: {
            _id: "$reservation.chauffeur"
            }
        }
        ]);

        return res.json({
        message: "=====TOTAL DES CHAUFFEURS PAYES=====",
        succes: true,
        total: data.length
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chauffeurs payés"
        });
    }
};