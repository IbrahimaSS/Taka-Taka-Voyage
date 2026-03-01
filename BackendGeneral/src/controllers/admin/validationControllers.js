const mongoose = require("mongoose");
const ChauffeurProfile = require("../../models/ChauffeurProfile");
const Utilisateurs = require("../../models/Utilisateurs");


// ===============================VALIDATIONS========================================

// CARDS VALIDATIONS
exports.statsValidationChauffeurs = async (req, res) => {
    try {
        const debutMois = new Date();
        debutMois.setDate(1);
        debutMois.setHours(0, 0, 0, 0);

        const finMois = new Date();
        finMois.setMonth(finMois.getMonth() + 1);
        finMois.setDate(0);
        finMois.setHours(23, 59, 59, 999);

        const [enAttente, validesCeMois, rejetesCeMois] = await Promise.all([
            ChauffeurProfile.countDocuments({ statut: "EN_ATTENTE" }),

            ChauffeurProfile.countDocuments({
                statut: "ACTIF",
                dateValidation: { $gte: debutMois, $lte: finMois },
            }),

            ChauffeurProfile.countDocuments({
                statut: "SUSPENDU",
                updatedAt: { $gte: debutMois, $lte: finMois },
            }),
        ]);

        return res.json({
            succes: true,
            stats: {
                enAttente,
                validesCeMois,
                rejetesCeMois,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            succes: false,
            message: "Erreur lors du chargement des statistiques",
        });
    }
};

// LISTES DE DEMANDES DE VALIDATIONS
exports.listeDemandesValidation = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const statut = req.query.statut || "EN_ATTENTE";

        const filter = { statut };
        const total = await ChauffeurProfile.countDocuments(filter);

        const demandes = await ChauffeurProfile.find(filter)
            .populate("utilisateur", "nom prenom telephone email photoUrl")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // format pratique
        const chauffeurs = demandes.map((p) => ({
            _id: p._id,
            statut: p.statut,
            typeVehicule: p.typeVehicule,
            createdAt: p.createdAt,
            utilisateur: p.utilisateur,
            documents: {
                permisConduire: !!p.permisConduire,
                carteGrise: !!p.carteGrise,
                assurance: !!p.assurance,
            },
            urls: {
                permisConduire: p.permisConduire || null,
                carteGrise: p.carteGrise || null,
                assurance: p.assurance || null,
            },
        }));

        return res.json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            chauffeurs,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};

// VALIDER UN CHAUFFEUR
exports.validerChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentaire } = req.body || {};
        const chauffeur = await ChauffeurProfile.findById(id).populate("utilisateur", "nom prenom telephone");
        if (!chauffeur) {
            return res.status(404).json({ succes: false, message: "Chauffeur introuvable" });
        }

        chauffeur.statut = "ACTIF";
        chauffeur.dateValidation = new Date();
        chauffeur.valideLe = new Date();
        chauffeur.validePar = req.utilisateur._id;
        chauffeur.commentaireValidation = commentaire?.trim() || null;

        await chauffeur.save();

        // ✅ CRITIQUE : Mettre à jour le statut Utilisateurs pour autoriser la connexion après validation
        await Utilisateurs.findByIdAndUpdate(chauffeur.utilisateur._id, { statut: "ACTIF" });

        // 🔔 Notifier le chauffeur en temps réel qu'il a été validé
        try {
            const io = req.app.get("io");
            if (io && chauffeur.utilisateur) {
                const userId = String(chauffeur.utilisateur._id);
                console.log(`🔔 [SOCKET] Tentative d'envoi notification validation à USER_${userId} et CHAUFFEUR_${userId}`);

                io.to(`USER_${userId}`).emit("chauffeur:valide", {
                    message: "🎉 Félicitations ! Votre compte chauffeur a été validé. Vous pouvez maintenant vous connecter.",
                    redirectUrl: "/connexion",
                    commentaire: commentaire?.trim() || null,
                });
                io.to(`CHAUFFEUR_${userId}`).emit("chauffeur:valide", {
                    message: "🎉 Félicitations ! Votre compte chauffeur a été validé. Vous pouvez maintenant vous connecter.",
                    redirectUrl: "/connexion",
                    commentaire: commentaire?.trim() || null,
                });
            } else {
                console.warn("⚠️ [SOCKET] Impossible d'envoyer la notification : io ou chauffeur.utilisateur manquant");
            }
        } catch (socketErr) {
            console.error("⚠️ Erreur notification socket chauffeur:", socketErr.message);
        }

        return res.json({ succes: true, message: "Chauffeur validé" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};

// REJETER UN CHAUFFEUR
exports.rejeterChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const { motif } = req.body;

        const chauffeur = await ChauffeurProfile.findById(id).populate("utilisateur", "nom prenom telephone");
        if (!chauffeur) {
            return res.status(404).json({
                succes: false,
                message: "Chauffeur introuvable",
            });
        }

        chauffeur.statut = "SUSPENDU";
        chauffeur.motifRefus = motif || "Documents non conformes";

        await chauffeur.save();

        // ✅ CRITIQUE : Mettre à jour le statut Utilisateurs pour bloquer la connexion
        await Utilisateurs.findByIdAndUpdate(chauffeur.utilisateur._id, { statut: "SUSPENDU" });

        // 🔔 Notifier le chauffeur en temps réel qu'il a été rejeté
        try {
            const io = req.app.get("io");
            if (io && chauffeur.utilisateur) {
                const userId = String(chauffeur.utilisateur._id);
                io.to(`USER_${userId}`).emit("chauffeur:rejete", {
                    message: `❌ Votre demande a été rejetée. Motif : ${chauffeur.motifRefus}`,
                    motif: chauffeur.motifRefus,
                });
                io.to(`CHAUFFEUR_${userId}`).emit("chauffeur:rejete", {
                    message: `❌ Votre demande a été rejetée. Motif : ${chauffeur.motifRefus}`,
                    motif: chauffeur.motifRefus,
                });
                console.log(`🔔 [SOCKET] Notification rejet envoyée au chauffeur ${userId}`);
            }
        } catch (socketErr) {
            console.error("⚠️ Erreur notification socket chauffeur:", socketErr.message);
        }

        return res.json({
            succes: true,
            message: "Chauffeur rejeté",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            succes: false,
            message: "Erreur lors du rejet",
        });
    }
};

const Document = require("../../models/Documents");

// DETAILS D'UNE VALIDATION D'UN CHAUFFEUR
exports.detailsChauffeurValidation = async (req, res) => {
    try {
        const { id } = req.params;

        const chauffeur = await ChauffeurProfile.findById(id)
            .populate("utilisateur", "nom prenom telephone email photoUrl createdAt");

        if (!chauffeur) {
            return res.status(404).json({
                succes: false,
                message: "Chauffeur introuvable",
            });
        }

        // Récupérer les documents réels de la collection Document
        const docsRecupere = await Document.find({ chauffeur: id });

        // On définit les types requis
        const typesRequis = [
            { label: "Permis de conduire", code: "PERMIS" },
            { label: "Carte grise", code: "CARTE_GRISE" },
            { label: "Assurance", code: "ASSURANCE" },
            { label: "Pièce d'identité", code: "IDENTITE" },
            { label: "Photo véhicule", code: "PHOTO_VEHICULE" },
        ];

        const documents = typesRequis.map(tr => {
            const d = docsRecupere.find(doc => doc.type === tr.code);
            return {
                nom: tr.label,
                type: tr.code,
                id: d?._id || null,
                statut: d?.statut || "NON_SOUMIS",
                url: d?.fichier || null,
                dateExpiration: d?.dateExpiration || null,
                commentaireAdmin: d?.commentaireAdmin || null
            };
        });

        const totalDocs = documents.length;
        const docsValides = documents.filter(d => d.statut === "VALIDE").length;
        const progression = Math.round((docsValides / totalDocs) * 100);

        return res.json({
            succes: true,
            chauffeur: {
                id: chauffeur._id,
                statut: chauffeur.statut,
                typeVehicule: chauffeur.typeVehicule,
                inscritLe: chauffeur.createdAt,
                utilisateur: chauffeur.utilisateur,

                // Progression
                progression: {
                    pourcentage: progression,
                    valides: docsValides,
                    total: totalDocs,
                },

                // Liste documents
                documents,

                actions: {
                    peutValider: chauffeur.statut === "EN_ATTENTE" && docsValides === totalDocs,
                    peutRejeter: chauffeur.statut === "EN_ATTENTE",
                },

                motifRefus: chauffeur.motifRefus || null,
                commentaireValidation: chauffeur.commentaireValidation || null
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            succes: false,
            message: "Erreur serveur",
        });
    }
};

// HISTORIQUES DES VALIDATIONS
exports.historiqueValidations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const type = req.query.type; // VALIDE | REJETE

        const filter = {
            statut: { $in: ["ACTIF", "SUSPENDU"] },
        };

        if (type === "VALIDE") filter.statut = "ACTIF";
        if (type === "REJETE") filter.statut = "SUSPENDU";

        const total = await ChauffeurProfile.countDocuments(filter);

        const items = await ChauffeurProfile.find(filter)
            .populate("utilisateur", "nom prenom telephone")
            .populate("validePar", "nom prenom role")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        const historique = items.map((c) => ({
            id: c._id,
            date: c.valideLe || c.updatedAt,
            chauffeur: {
                nom: `${c.utilisateur.prenom} ${c.utilisateur.nom}`,
                telephone: c.utilisateur.telephone,
            },
            typeVehicule: c.typeVehicule,
            action: c.statut === "ACTIF" ? "VALIDE" : "REJETE",
            validateur: c.validePar
                ? `${c.validePar.prenom} ${c.validePar.nom}`
                : "Admin",
            motifRefus: c.motifRefus || null,
        }));

        return res.json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            historique,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            succes: false,
            message: "Erreur lors du chargement de l’historique",
        });
    }
};