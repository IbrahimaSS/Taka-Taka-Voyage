const mongoose = require("mongoose");
const Utilisateurs = require("../../models/Utilisateurs");
const Reservation = require("../../models/Reservations");
const Evaluation = require("../../models/Evaluations");

//================================= GESTION PASSAGERS =================================

// LISTE DES PASSAGERS (PAGINÉE + RECHERCHE + FILTRES)
exports.listeUtilisateurs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const { search, statut, dateRange } = req.query;

        // Filtre de base : uniquement les passagers
        const filtre = { role: "PASSAGER" };

        // Filtre par recherche (nom, prénom, email)
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            filtre.$or = [
                { nom: regex },
                { prenom: regex },
                { email: regex },
            ];
        }

        // Filtre par statut
        if (statut && ["ACTIF", "INACTIF", "SUSPENDU"].includes(statut)) {
            filtre.statut = statut;
        }

        // Filtre par plage de dates (date d'inscription)
        if (dateRange && dateRange !== "all") {
            const now = new Date();
            let dateDebut;

            switch (dateRange) {
                case "today":
                    dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case "7days":
                    dateDebut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "30days":
                    dateDebut = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case "3months":
                    dateDebut = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
            }

            if (dateDebut) {
                filtre.createdAt = { $gte: dateDebut };
            }
        }

        const total = await Utilisateurs.countDocuments(filtre);
        const utilisateurs = await Utilisateurs.find(filtre)
            .select("nom prenom email role statut createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const resultat = await Promise.all(
            utilisateurs.map(async (user) => {
                const nombreTrajets = await Reservation.countDocuments({
                    passager: user._id,
                });
                const notes = await Evaluation.find({ passager: user._id });
                let noteMoyenne = null;
                if (notes.length > 0) {
                    const totalNotes = notes.reduce(
                        (sum, n) => sum + n.noteGlobale,
                        0
                    );
                    noteMoyenne = (totalNotes / notes.length).toFixed(1);
                }
                return {
                    _id: user._id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    role: user.role,
                    statut: user.statut,
                    createdAt: user.createdAt,
                    nombreTrajets,
                    noteMoyenne,
                };
            })
        );
        return res.status(200).json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            utilisateurs: resultat,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// DETAILS D'UN PASSAGER
exports.detailUtilisateur = async (req, res) => {
    try {
        const { id } = req.params;
        const utilisateur = await Utilisateurs.findById(id)
            .select("nom prenom email role statut createdAt telephone photoUrl localisation");

        if (!utilisateur) {
            return res.status(404).json({
                succes: false,
                message: "Utilisateur introuvable",
            });
        }

        const nombreTrajets = await Reservation.countDocuments({
            passager: utilisateur._id,
        });

        const evaluations = await Evaluation.find({
            passager: utilisateur._id,
        });

        let noteMoyenne = null;
        if (evaluations.length > 0) {
            const totalNotes = evaluations.reduce(
                (sum, e) => sum + e.noteGlobale,
                0
            );
            noteMoyenne = (totalNotes / evaluations.length).toFixed(1);
        }

        const depenseAgg = await Reservation.aggregate([
            {
                $match: {
                    passager: new mongoose.Types.ObjectId(utilisateur._id),
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

        const totalDepense = depenseAgg?.[0]?.total || 0;

        return res.status(200).json({
            succes: true,
            utilisateur: {
                _id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                role: utilisateur.role,
                statut: utilisateur.statut,
                createdAt: utilisateur.createdAt,
                nombreTrajets,
                noteMoyenne,
                totalDepense,
            },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// ACTIVER / DESACTIVER / SUSPENDRE PASSAGER
exports.changerStatutUtilisateur = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const statutsAutorises = ["ACTIF", "INACTIF", "SUSPENDU"];
        if (!statutsAutorises.includes(statut)) {
            return res.status(400).json({
                succes: false,
                message: "Statut invalide",
            });
        }
        const utilisateur = await Utilisateurs.findById(id);
        if (!utilisateur) {
            return res.status(404).json({
                succes: false,
                message: "Utilisateur introuvable",
            });
        }

        utilisateur.statut = statut;
        await utilisateur.save();

        return res.status(200).json({
            succes: true,
            message: "===== STATUT UTILISATEUR MIS À JOUR =====",
            utilisateur: {
                _id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                statut: utilisateur.statut,
            },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// CARDS PASSAGERS
exports.statsUtilisateurs = async (req, res) => {
    try {
        const utilisateursActifs = await Utilisateurs.countDocuments({
            role: "PASSAGER",
            statut: "ACTIF",
        });

        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);

        const nouveauxCeMois = await Utilisateurs.countDocuments({
            role: "PASSAGER",
            createdAt: { $gte: debutMois },
        });

        const evaluations = await Evaluation.find({
            passager: { $exists: true },
        });

        let noteMoyenneGlobale = null;
        if (evaluations.length > 0) {
            const total = evaluations.reduce(
                (sum, e) => sum + e.noteGlobale,
                0
            );
            noteMoyenneGlobale = (total / evaluations.length).toFixed(1);
        }

        return res.status(200).json({
            succes: true,
            stats: {
                utilisateursActifs,
                nouveauxCeMois,
                noteMoyenneGlobale,
            },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};