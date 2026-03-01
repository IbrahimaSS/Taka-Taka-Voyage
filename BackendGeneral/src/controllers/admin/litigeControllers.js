const Litige = require("../../models/Litiges");
const Reservation = require("../../models/Reservations");
const Utilisateurs = require("../../models/Utilisateurs");
const Notification = require("../../models/Notifications");
const Paiement = require("../../models/Paiements");


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
            if (d._id === "REJETER") resolus += d.total; // Count rejected as closed/resolved in the context of the cards if needed
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

        const { type, status, search } = req.query;
        let query = {};

        if (type && type !== 'all') {
            query.type = type.toUpperCase();
        }

        if (status && status !== 'all') {
            const statusMap = {
                open: "OUVERT",
                in_progress: "EN_COURS",
                resolved: "RESOLU",
                rejected: "REJETER",
                pending: "EN_COURS"
            };
            query.statut = statusMap[status.toLowerCase()] || status.toUpperCase();
        }

        if (search) {
            query.$or = [
                { reference: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [litiges, total] = await Promise.all([
            Litige.find(query)
                .populate("passager", "nom prenom")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Litige.countDocuments(query)
        ]);

        // Récupérer les IDs valides uniquement
        const resIds = litiges.map(l => l.reservation ? l.reservation.toString() : null).filter(Boolean);
        const reservationIds = [...new Set(resIds)];

        // Charger réservations et paiements en bloc (Mongoose gère automatiquement le tableau)
        const [reservations, paiements] = await Promise.all([
            Reservation.find({ _id: reservationIds }).populate("chauffeur", "nom prenom").lean(),
            Paiement.find({ reservation: reservationIds }).populate("chauffeur", "nom prenom").lean()
        ]);

        const driverMap = {};
        reservationIds.forEach(id => {
            const sid = id.toString();
            const r = reservations.find(res => res._id.toString() === sid);
            if (r && r.chauffeur) {
                driverMap[sid] = `${r.chauffeur.prenom || ""} ${r.chauffeur.nom || ""}`.trim() || "Chauffeur";
            } else {
                const p = paiements.find(paie => paie.reservation.toString() === sid);
                if (p && p.chauffeur) {
                    driverMap[sid] = `${p.chauffeur.prenom || ""} ${p.chauffeur.nom || ""}`.trim() || "Chauffeur";
                }
            }
        });

        return res.json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            litiges: litiges.map(l => {
                const sid = l.reservation ? l.reservation.toString() : null;
                const reservationFound = sid ? reservations.find(res => res._id.toString() === sid) : null;

                return {
                    identifiant: l.id || l._id,
                    reference: l.reference || `DIS-${l._id.toString().slice(-6).toUpperCase()}`,
                    date: l.createdAt,
                    description: l.description || "Aucune description",
                    montant: reservationFound ? reservationFound.prix : 0,
                    utilisateurs: {
                        passager: l.passager
                            ? `${l.passager.prenom || ""} ${l.passager.nom || ""}`.trim()
                            : "Inconnu",
                        chauffeur: sid && driverMap[sid] ? driverMap[sid] : "Non assigné"
                    },
                    type: l.type,
                    statut: l.statut
                };
            })
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
            .lean(); // Utilisation de lean pour avoir l'ID brut de reservation si ref cassée

        if (!litige) {
            return res.status(404).json({ succes: false, message: "Litige introuvable" });
        }

        const resId = litige.reservation;
        let chauffeurName = "Non assigné";
        let tripData = { depart: "N/A", destination: "N/A" };

        if (resId) {
            // 1. Essayer de charger la réservation
            const r = await Reservation.findById(resId).populate("chauffeur", "nom prenom").lean();
            if (r) {
                tripData = { depart: r.depart || "N/A", destination: r.destination || "N/A" };
                if (r.chauffeur) {
                    chauffeurName = `${r.chauffeur.prenom || ""} ${r.chauffeur.nom || ""}`.trim() || "Chauffeur";
                }
            }

            // 2. Si pas de chauffeur, essayer via le paiement
            if (chauffeurName === "Non assigné") {
                const p = await Paiement.findOne({ reservation: resId }).populate("chauffeur", "nom prenom").lean();
                if (p && p.chauffeur) {
                    chauffeurName = `${p.chauffeur.prenom || ""} ${p.chauffeur.nom || ""}`.trim() || "Chauffeur";
                }
            }
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
                    Depart: tripData.depart,
                    Destination: tripData.destination,
                },

                partiesConcernees: {
                    passager: litige.passager
                        ? `${litige.passager.prenom} ${litige.passager.nom}`
                        : null,
                    chauffeur: chauffeurName
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

        // NOTIFIER LE PASSAGER
        try {
            await Notification.create({
                utilisateur: litige.passager,
                message: `✅ Votre litige #${litige.reference} a été résolu par l'administrateur.`
            });

            const io = req.app.get("io");
            if (io) {
                io.to(`USER_${String(litige.passager)}`).emit("litige:status_update", {
                    litigeId,
                    reference: litige.reference,
                    statut: "RESOLU",
                    message: "Votre litige a été résolu."
                });
            }
        } catch (notifErr) {
            console.error("❌ Erreur notification litige résolu:", notifErr);
        }

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

        // NOTIFIER LE PASSAGER
        try {
            await Notification.create({
                utilisateur: litige.passager,
                message: `❌ Votre litige #${litige.reference} a été rejeté par l'administrateur.`
            });

            const io = req.app.get("io");
            if (io) {
                io.to(`USER_${String(litige.passager)}`).emit("litige:status_update", {
                    litigeId,
                    reference: litige.reference,
                    statut: "REJETER",
                    message: "Votre litige a été rejeté."
                });
            }
        } catch (notifErr) {
            console.error("❌ Erreur notification litige rejeté:", notifErr);
        }

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

// CRÉER UN LITIGE
exports.creerLitige = async (req, res) => {
    try {
        const { reservation, type, description, piecesJointes } = req.body;
        const utilisateurId = req.utilisateur._id;

        // "Type" et "Description" sont obligatoires. "Reservation" est optionnel pour les questions générales.
        if (!type || !description) {
            return res.status(400).json({
                succes: false,
                message: "Veuillez remplir les champs obligatoires (Type et Description)"
            });
        }

        let passagerConcerne = utilisateurId;
        let reservationId = null;

        if (reservation) {
            const resExist = await Reservation.findById(reservation);
            if (resExist) {
                passagerConcerne = resExist.passager;
                reservationId = reservation;
            }
        }

        const reference = `DIS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const nouveauLitige = await Litige.create({
            reference,
            reservation: reservationId, // Peut être null si contact général
            passager: passagerConcerne,
            type,
            description,
            statut: "OUVERT",
            piecesJointes: piecesJointes || []
        });

        const io = req.app.get("io");
        if (io) {
            io.to("ADMINS").emit("dispute:new", {
                id: nouveauLitige._id,
                reference: nouveauLitige.reference,
                type: nouveauLitige.type,
                date: nouveauLitige.createdAt,
                message: "Un nouveau litige a été signalé"
            });
        }

        return res.status(201).json({
            succes: true,
            message: "Votre litige a été signalé avec succès. Un administrateur va l'étudier.",
            litige: nouveauLitige
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            succes: false,
            message: "Erreur lors de la création du litige"
        });
    }
};
