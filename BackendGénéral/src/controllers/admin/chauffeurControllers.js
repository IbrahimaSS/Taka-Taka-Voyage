const mongoose = require("mongoose");
const Utilisateurs = require("../../models/Utilisateurs");
const Reservation = require("../../models/Reservations");
const Evaluation = require("../../models/Evaluations");
const ChauffeurProfile = require("../../models/ChauffeurProfile");


//===================================CHAUFFEURS======================================

// CARDS CHAUFFEURS
exports.statsChauffeurs = async (req, res) => {
    try {
        // Date début du jour
        const debutJour = new Date();
        debutJour.setHours(0, 0, 0, 0);

        // Chauffeurs actifs
        const chauffeursActifs = await Utilisateurs.countDocuments({
        role: "CHAUFFEUR",
        statut: "ACTIF",
        });

        // Revenus du jour (PAYE + chauffeur)
        const revenusAgg = await Reservation.aggregate([
        {
            $match: {
            chauffeur: { $ne: null },
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

        const revenusDuJour = revenusAgg?.[0]?.total || 0;

        // Trajets du jour (avec chauffeur)
        const trajetsDuJour = await Reservation.countDocuments({
        chauffeur: { $ne: null },
        createdAt: { $gte: debutJour },
        });

        // Note moyenne des chauffeurs
        const evaluations = await Evaluation.find({
        chauffeur: { $exists: true },
        });

        let noteMoyenne = null;
        if (evaluations.length > 0) {
        const totalNotes = evaluations.reduce(
            (sum, e) => sum + e.noteGlobale,
            0
        );
        noteMoyenne = (totalNotes / evaluations.length).toFixed(1);
        }

        return res.status(200).json({
        succes: true,
        stats: {
            chauffeursActifs,
            revenusDuJour,
            trajetsDuJour,
            noteMoyenne,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// LISTES DES CHAUFFEURS
exports.listeChauffeurs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const { statut, disponibilite, typeVehicule } = req.query;

        const profileFilter = {};
        if (statut) profileFilter.statut = statut;
        if (disponibilite) profileFilter.disponibilite = disponibilite;
        if (typeVehicule) profileFilter.typeVehicule = typeVehicule;

        const total = await ChauffeurProfile.countDocuments(profileFilter);

        const chauffeurs = await ChauffeurProfile.find(profileFilter)
        .populate("utilisateur", "nom prenom email telephone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const resultat = (
        await Promise.all(
            chauffeurs.map(async (ch) => {
            if (!ch.utilisateur) return null;

            const nombreTrajets = await Reservation.countDocuments({
                chauffeur: ch.utilisateur._id,
            });

            const evaluations = await Evaluation.find({
                chauffeur: ch.utilisateur._id,
            });

            let noteMoyenne = null;
            if (evaluations.length > 0) {
                const totalNotes = evaluations.reduce(
                (sum, e) => sum + e.noteGlobale,
                0
                );
                noteMoyenne = (totalNotes / evaluations.length).toFixed(1);
            }

            return {
                id: ch._id,
                chauffeur: ch.utilisateur,
                statut: ch.statut,
                disponibilite: ch.disponibilite,
                typeVehicule: ch.typeVehicule,
                marqueVehicule: ch.marqueVehicule,
                plaque: ch.plaque,
                nombreTrajets,
                noteMoyenne,
                gainsTotaux: ch.gainsTotaux || 0,
                createdAt: ch.createdAt,
            };
            })
        )
        ).filter(Boolean);

        return res.status(200).json({
        succes: true,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            from: total === 0 ? 0 : skip + 1,
            to: total === 0 ? 0 : skip + resultat.length,
        },
        chauffeurs: resultat,
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// DETAILS D'UN CHAUFFEUR
exports.detailChauffeur = async (req, res) => {
    try {
        const { id } = req.params;

        const chauffeurProfile = await ChauffeurProfile.findById(id)
        .populate("utilisateur", "nom prenom email telephone createdAt");

        if (!chauffeurProfile || !chauffeurProfile.utilisateur) {
        return res.status(404).json({
            succes: false,
            message: "Chauffeur introuvable",
        });
        }

        const userId = chauffeurProfile.utilisateur._id;

        // Nombre de trajets
        const nombreTrajets = await Reservation.countDocuments({
        chauffeur: userId,
        });

        // Note moyenne
        const evaluations = await Evaluation.find({ chauffeur: userId });
        let noteMoyenne = null;

        if (evaluations.length > 0) {
        const totalNotes = evaluations.reduce(
            (sum, e) => sum + e.noteGlobale,
            0
        );
        noteMoyenne = (totalNotes / evaluations.length).toFixed(1);
        }

        // Total gagné (PAYE)
        const gainsAgg = await Reservation.aggregate([
        {
            $match: {
            chauffeur: new mongoose.Types.ObjectId(userId),
            "paiement.statut": "PAYE",
            },
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            },
        },
        ]);

        const totalGagne = gainsAgg?.[0]?.total || 0;

        return res.status(200).json({
        succes: true,
        chauffeur: {
            // ===== INFOS CHAUFFEUR =====
            id: chauffeurProfile._id,
            nom: chauffeurProfile.utilisateur.nom,
            prenom: chauffeurProfile.utilisateur.prenom,
            email: chauffeurProfile.utilisateur.email,
            telephone: chauffeurProfile.utilisateur.telephone,
            inscritLe: chauffeurProfile.utilisateur.createdAt,
            derniereActivite: chauffeurProfile.updatedAt,

            statut: chauffeurProfile.statut,
            disponibilite: chauffeurProfile.disponibilite,
            verifie: chauffeurProfile.statut === "ACTIF",
            typeChauffeur: chauffeurProfile.typeVehicule,

            // ===== VEHICULE =====
            vehicule: {
            type: chauffeurProfile.typeVehicule,
            marque: chauffeurProfile.marqueVehicule,
            plaque: chauffeurProfile.plaque,
            },

            // ===== STATS =====
            stats: {
            noteMoyenne,
            nombreTrajets,
            },

            // ===== DOCUMENTS =====
            documents: {
            permis: !!chauffeurProfile.permisConduire,
            assurance: !!chauffeurProfile.assurance,
            carteGrise: !!chauffeurProfile.carteGrise,
            },

            // ===== REVENUS =====
            revenus: {
            totalGagne,
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

// ================= ACTIVER / DESACTIVER / SUSPENDRE CHAUFFEUR =================
exports.changerStatutChauffeur = async (req, res) => {
    try {
        const { id } = req.params; // id = ChauffeurProfile._id
        const { statut } = req.body;

        const statutsAutorises = ["ACTIF", "INACTIF", "SUSPENDU"];
        if (!statutsAutorises.includes(statut)) {
        return res.status(400).json({ succes: false, message: "Statut invalide" });
        }

        const chauffeur = await ChauffeurProfile.findById(id).populate(
        "utilisateur",
        "nom prenom email telephone"
        );

        if (!chauffeur || !chauffeur.utilisateur) {
        return res.status(404).json({ succes: false, message: "Chauffeur introuvable" });
        }

        chauffeur.statut = statut;

        // effet métier : si bloqué, il ne doit plus être EN_LIGNE/OCCUPE
        if (statut !== "ACTIF") {
        chauffeur.disponibilite = "HORS_LIGNE";
        }

        await chauffeur.save();

        return res.status(200).json({
        succes: true,
        message: "===== STATUT CHAUFFEUR MIS À JOUR =====",
        chauffeur: {
            id: chauffeur._id,
            nom: chauffeur.utilisateur.nom,
            prenom: chauffeur.utilisateur.prenom,
            statut: chauffeur.statut,
            disponibilite: chauffeur.disponibilite,
        },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
