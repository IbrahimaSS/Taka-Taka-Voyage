const mongoose = require("mongoose");
const Paiement = require("../../models/Paiements");
const Rapport = require("../../models/Rapports");
const Reservation = require("../../models/Reservations");
const Utilisateurs = require("../../models/Utilisateurs");


//===================================GESTIONS RAPPORTS==============================

// STATS RAPPORTS / VERSEMENTS (CARDS)
exports.statsRapportsVersements = async (req, res) => {
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
            $group: {
            _id: null,
            commissionTotale: { $sum: "$commissionPlateforme" },
            chauffeurs: { $addToSet: "$reservation" }
            }
        }
        ]);

        const commissionTotale = data[0]?.commissionTotale || 0;
        const chauffeursPayes = data[0]?.chauffeurs?.length || 0;

        return res.json({
        succes: true,
        Cards: {
            commissionCeMois: commissionTotale,
            chauffeursPayes
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement stats rapports"
        });
    }
};

// ACTIVITÉ DE GÉNÉRATION DES RAPPORTS (7 DERNIERS JOURS)
exports.activiteGenerationRapports = async (req, res) => {
    try {
        const debut = new Date();
        debut.setDate(debut.getDate() - 6);
        debut.setHours(0, 0, 0, 0);
        const data = await Rapport.aggregate([
        {
            $match: {
            createdAt: { $gte: debut }
            }
        },
        {
            $group: {
            _id: {
                jour: { $dayOfWeek: "$createdAt" }
            },
            total: { $sum: 1 }
            }
        }
        ]);
        const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        return res.json({
        succes: true,
        data: data.map(d => ({
            label: jours[d._id.jour - 1],
            total: d.total
        }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur activité génération rapports"
        });
    }
};

// RÉPARTITION (PIE)
exports.repartitionAnalyses = async (req, res) => {
    try {
        const scope = (req.query.scope || "trajets").toLowerCase();
        const period = (req.query.period || "mensuel").toLowerCase();
        // Période (optionnel)
        const debut = new Date();
        debut.setHours(0, 0, 0, 0);
        if (period === "annuel") {
        debut.setMonth(0, 1); // 1er janvier
        } else {
        debut.setDate(1); // début du mois
        }
        let data = [];
        // =========== TRAJETS ===========
        // Répartition par type de véhicule (MOTO/TAXI/VOITURE/BUS) sur Reservation
        if (scope === "trajets") {
        data = await Reservation.aggregate([
            { $match: { createdAt: { $gte: debut } } },
            { $group: { _id: "$typeVehicule", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        return res.json({
            succes: true,
            scope,
            period,
            data: data.map(d => ({ label: d._id || "INCONNU", total: d.total }))
        });
        }
        // =========== UTILISATEURS ============
        // Répartition par rôle (PASSAGER/CHAUFFEUR/ADMIN) sur Utilisateurs
        if (scope === "utilisateurs") {
        data = await Utilisateur.aggregate([
            { $match: { createdAt: { $gte: debut } } },
            { $group: { _id: "$role", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        return res.json({
            succes: true,
            scope,
            period,
            data: data.map(d => ({ label: d._id || "INCONNU", total: d.total }))
        });
        }
        // ===================== FINANCIER =====================
        // Répartition des commissions (ou montants) par service (typeVehicule) via Paiement + Reservation
        if (scope === "financier") {
        data = await Paiement.aggregate([
            { $match: { verse: true, verseLe: { $gte: debut } } },

            { $lookup: { from: "reservations", localField: "reservation", foreignField: "_id", as: "reservation" } },
            { $unwind: "$reservation" },

            // Répartition par service = typeVehicule, montant = commissionPlateforme
            { $group: { _id: "$reservation.typeVehicule", total: { $sum: "$commissionPlateforme" } } },
            { $sort: { total: -1 } }
        ]);

        return res.json({
            succes: true,
            scope,
            period,
            data: data.map(d => ({ label: d._id || "INCONNU", total: d.total }))
        });
        }

        // scope inconnu
        return res.status(400).json({
        succes: false,
        message: "scope invalide (financier | utilisateurs | trajets)"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur répartition analyses"
        });
    }
};

// LISTE DES RAPPORTS (AFFICHAGE TABLE)
exports.listeRapports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [total, rapports] = await Promise.all([
        Rapport.countDocuments(),
        Rapport.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        ]);
        return res.json({
        succes: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        rapports: rapports.map(r => ({
            id: r._id,

            // Colonne "Rapport"
            rapport: r.titre,

            // Badge Type (Financier / Utilisateurs / Trajets / ...)
            type: r.type,

            // Format (PDF / CSV / EXCEL / WORD)
            format: r.format,

            // Statut (Généré / En attente / En cours / Échoué)
            statut: r.statut,

            // Créé le
            creeLe: r.createdAt,

            // Période affichée sous la date
            periode: r.periode
            ? {
                debut: r.periode.debut,
                fin: r.periode.fin
                }
            : null,

            // ===== Actions (menu ⋮)
            actions: {
            telecharger: r.statut === "GENERE",
            relancer: r.statut === "ECHOUE",
            supprimer: true
            }
        }))
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement liste des rapports"
        });
    }
};

// CRÉER UN NOUVEAU RAPPORT
exports.creerRapport = async (req, res) => {
    try {
        const { titre, type, format, periode } = req.body;

        // validations minimales
        if (!titre || !type || !format) {
        return res.status(400).json({
            succes: false,
            message: "Champs obligatoires manquants"
        });
        }

        const rapport = await Rapport.create({
        titre,
        type,       // FINANCIER | UTILISATEURS | TRAJETS | PERFORMANCE | SECURITE
        format,     // PDF | CSV | EXCEL | WORD
        statut: "GENERE", // pour l’instant (plus tard EN_ATTENTE / EN_COURS)
        periode: periode || null,
        generePar: req.utilisateur?._id || null
        });

        return res.status(201).json({
        succes: true,
        message: "Rapport créé avec succès",
        rapport: {
            id: rapport._id,
            titre: rapport.titre,
            type: rapport.type,
            format: rapport.format,
            statut: rapport.statut,
            creeLe: rapport.createdAt,
            periode: rapport.periode
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur création rapport"
        });
    }
};

// DÉTAILS COMPLETS D’UN RAPPORT (SANS MÉTRIQUES)
exports.detailsRapport = async (req, res) => {
    try {
        const { rapportId } = req.params;
        const rapport = await Rapport.findById(rapportId)
        .populate("generePar", "nom prenom email role");
        if (!rapport) {
        return res.status(404).json({
            succes: false,
            message: "Rapport introuvable"
        });
        }
        return res.json({
        succes: true,
        rapport: {
            id: rapport._id,
            // ===== En-tête
            titre: rapport.titre,
            description: `Rapport ${rapport.type.toLowerCase()} généré par le système`,

            reference: `RPT-${rapport._id.toString().slice(-6).toUpperCase()}`,

            // ===== Informations générales
            type: rapport.type,           // FINANCIER | UTILISATEURS | TRAJETS | ...
            format: rapport.format,       // PDF | CSV | EXCEL | WORD
            statut: rapport.statut,       // GENERE | EN_ATTENTE | EN_COURS | ECHOUE

            auteur: rapport.generePar
            ? {
                nom: `${rapport.generePar.prenom} ${rapport.generePar.nom}`,
                role: rapport.generePar.role || "ADMIN"
                }
            : {
                nom: "Système",
                role: "SYSTEM"
                },

            // ===== Dates
            dates: {
            creation: rapport.createdAt,
            derniereModification: rapport.updatedAt,
            dernierAcces: rapport.updatedAt // simulé pour l’instant
            },

            // ===== Période couverte
            periode: rapport.periode
            ? {
                debut: rapport.periode.debut,
                fin: rapport.periode.fin
                }
            : null,

            // ===== Tags (UI)
            tags: [
            rapport.type.toLowerCase(),
            rapport.format.toLowerCase(),
            rapport.statut === "GENERE" ? "disponible" : "indisponible"
            ],

            // ===== Actions possibles
            actions: {
            telecharger: rapport.statut === "GENERE",
            relancer: rapport.statut === "ECHOUE",
            supprimer: true,
            partager: rapport.statut === "GENERE"
            }
        }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        succes: false,
        message: "Erreur chargement détails du rapport"
        });
    }
};