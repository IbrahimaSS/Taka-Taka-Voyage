const mongoose = require("mongoose");
const Paiement = require("../../models/Paiements");
const Notification = require("../../models/Notifications");


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

            // À verser (seulement les paiements NON encore versés au chauffeur)
            Paiement.aggregate([
                {
                    $match: { statut: "PAYE", verse: false }
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

// LISTE DES COMMISSIONS CHAUFFEURS (ADMIN)
// Supporte filtrage par statut (all/A_PAYER/PAYE), recherche, pagination
exports.listeChauffeursAPayer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const statutFiltre = req.query.statut || "all"; // all, A_PAYER, PAYE
        const search = req.query.search || "";

        // Condition de base : paiement PAYE (passager a payé)
        const matchCondition = { statut: "PAYE" };

        // Filtre sur le versement au chauffeur
        if (statutFiltre === "A_PAYER") {
            matchCondition.verse = false;
        } else if (statutFiltre === "PAYE") {
            matchCondition.verse = true;
        }
        // "all" => pas de filtre sur verse

        const pipeline = [
            { $match: matchCondition },
            // Reservation
            {
                $lookup: {
                    from: "reservations",
                    localField: "reservation",
                    foreignField: "_id",
                    as: "reservationData"
                }
            },
            { $unwind: "$reservationData" },
            // Chauffeur
            {
                $lookup: {
                    from: "utilisateurs",
                    localField: "reservationData.chauffeur",
                    foreignField: "_id",
                    as: "chauffeurData"
                }
            },
            { $unwind: "$chauffeurData" },
        ];

        // Recherche par nom/prénom/téléphone
        if (search.trim()) {
            const regex = search.trim();
            pipeline.push({
                $match: {
                    $or: [
                        { "chauffeurData.nom": { $regex: regex, $options: "i" } },
                        { "chauffeurData.prenom": { $regex: regex, $options: "i" } },
                        { "chauffeurData.telephone": { $regex: regex, $options: "i" } }
                    ]
                }
            });
        }

        // Projection pour le résultat final (pas de groupement, on retourne chaque paiement)
        pipeline.push({
            $project: {
                _id: 1,
                paiementId: "$_id",
                chauffeurId: "$chauffeurData._id",
                nom: { $concat: ["$chauffeurData.prenom", " ", "$chauffeurData.nom"] },
                email: "$chauffeurData.email",
                telephone: "$chauffeurData.telephone",
                photo: "$chauffeurData.photoUrl",
                service: "$reservationData.typeVehicule",
                montantBrut: "$montantTotal",
                commission: "$commissionPlateforme",
                montantNet: "$montantChauffeur",
                methode: "$methode",
                verse: 1,
                verseLe: 1,
                createdAt: 1,
                statut: {
                    $cond: {
                        if: "$verse",
                        then: "PAYE",
                        else: "A_PAYER"
                    }
                }
            }
        });

        pipeline.push({ $sort: { createdAt: -1 } });

        // Compter le total AVANT pagination
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await Paiement.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const data = await Paiement.aggregate(pipeline);

        return res.json({
            succes: true,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            chauffeurs: data.map(d => ({
                id: d.paiementId,
                chauffeurId: d.chauffeurId,
                nom: d.nom,
                email: d.email,
                telephone: d.telephone,
                photo: d.photo || null,
                service: d.service,
                montantBrut: d.montantBrut,
                commission: d.commission,
                montantNet: d.montantNet,
                methode: d.methode,
                statut: d.statut,
                verse: d.verse,
                verseLe: d.verseLe,
                createdAt: d.createdAt
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            succes: false,
            message: "Erreur liste commissions chauffeurs"
        });
    }
};

// TRAITER (MARQUER COMME PAYÉ) UN PAIEMENT
exports.traiterPaiement = async (req, res) => {
    try {
        const { paiementId } = req.params;
        const { commentaire } = req.body;

        // Populate la réservation pour récupérer l'ID du chauffeur
        const paiement = await Paiement.findById(paiementId)
            .populate({
                path: "reservation",
                select: "chauffeur"
            });

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

        // ================= NOTIFICATION CHAUFFEUR =================
        const chauffeurId = paiement.reservation?.chauffeur || paiement.chauffeur;
        if (chauffeurId) {
            const montantFormate = (paiement.montantChauffeur || 0).toLocaleString('fr-FR');

            // 1. Notification persistante en base de données
            try {
                await Notification.create({
                    utilisateur: chauffeurId,
                    message: `💰 Paiement de ${montantFormate} GNF versé sur votre compte ! Vérifiez vos revenus.`,
                });
            } catch (notifErr) {
                console.error("Erreur création notification:", notifErr.message);
            }

            // 2. Notification temps réel via socket
            const io = req.app.get("io");
            if (io) {
                io.to(`CHAUFFEUR_${String(chauffeurId)}`).emit("paiement:verse", {
                    paiementId: paiement._id,
                    montant: paiement.montantChauffeur,
                    methode: paiement.methode,
                    verseLe: paiement.verseLe,
                    message: `Paiement de ${montantFormate} GNF versé avec succès`
                });
            }
        }

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