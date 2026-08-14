const Utilisateur = require("../../models/Utilisateurs");
const Trajet = require("../../models/Trajets");
const Paiement = require("../../models/Paiements");
const { validationResult } = require("express-validator");
const { deleteFile } = require("../../utils/fileUtils");
const { logActivity } = require("../../utils/logger");
const { sendIdempotentResponse } = require("../../utils/idempotency");

/* ===================== PROFIL ===================== */

// Afficher mon profil
exports.getProfil = async (req, res) => {
    try {
        const utilisateur = req.utilisateur;
        return res.status(200).json({
            succes: true,
            profil: {
                _id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                telephone: utilisateur.telephone,
                genre: utilisateur.genre,
                photoUrl: utilisateur.photoUrl || null,
                avatar: utilisateur.photoUrl || null,
                localisation: utilisateur.localisation || "",
                adresse: utilisateur.adresse || "",
                noteMoyenne: utilisateur.noteMoyenne || 0,
                membreDepuis: utilisateur.createdAt,

                preferences: utilisateur.preferences || {},

                // Notifications
                notifications: utilisateur.notifications || {
                    trajet: true,
                    promotionnelles: true,
                    sms: false,
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

// Modifier le profil
exports.updateProfil = async (req, res) => {
    try {
        const erreurs = validationResult(req);
        if (!erreurs.isEmpty()) {
            return res.status(400).json({
                succes: false,
                erreurs: erreurs.array(),
            });
        }
        const userId = req.utilisateur._id;

        const champsAutorises = [
            "nom",
            "prenom",
            "email",
            "telephone",
            "genre",
            "localisation",
            "adresse"
        ];

        const donnees = {};
        champsAutorises.forEach((champ) => {
            if (req.body[champ] !== undefined) {
                donnees[champ] = req.body[champ];
            }
        });

        // Gestion de la photo de profil si elle est envoyée
        if (req.file) {
            // Note : deleteFile() ne sait supprimer qu'un fichier local — no-op silencieux
            // si l'ancienne photo est déjà sur Cloudinary (nettoyage Cloudinary à prévoir séparément).
            if (req.utilisateur.photoUrl) {
                deleteFile(req.utilisateur.photoUrl);
            }
            donnees.photoUrl = req.file.path; // URL Cloudinary complète
        }

        // Unicité email / téléphone
        if (donnees.email || donnees.telephone) {
            const existe = await Utilisateur.findOne({
                _id: { $ne: userId },
                $or: [
                    donnees.email ? { email: donnees.email } : null,
                    donnees.telephone ? { telephone: donnees.telephone } : null,
                ].filter(Boolean),
            });

            if (existe) {
                return res.status(400).json({
                    succes: false,
                    message: "Email ou numéro déjà utilisé",
                });
            }
        }

        const utilisateurMisAJour = await Utilisateur.findByIdAndUpdate(
            userId,
            donnees,
            { new: true, runValidators: true }
        ).select("-motDePasse");

        // LOG DE L'ACTIVITÉ
        await logActivity({
            utilisateurId: userId,
            nomUtilisateur: `${utilisateurMisAJour.prenom} ${utilisateurMisAJour.nom}`,
            role: utilisateurMisAJour.role,
            action: "MISE_A_JOUR_PROFIL",
            module: "UTILISATEURS",
            details: { champsModifies: Object.keys(donnees) },
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown"
        });

        return sendIdempotentResponse(req, res, 200, {
            succes: true,
            message: "Profil mis à jour avec succès",
            utilisateur: {
                id: utilisateurMisAJour._id,
                nom: utilisateurMisAJour.nom,
                prenom: utilisateurMisAJour.prenom,
                email: utilisateurMisAJour.email,
                telephone: utilisateurMisAJour.telephone,
                role: utilisateurMisAJour.role,
                genre: utilisateurMisAJour.genre,
                photoUrl: utilisateurMisAJour.photoUrl,
                avatar: utilisateurMisAJour.photoUrl,
                photoProfil: utilisateurMisAJour.photoUrl,
                localisation: utilisateurMisAJour.localisation,
                adresse: utilisateurMisAJour.adresse
            },
        });
    } catch (erreur) {
        return res.status(500).json({
            succes: false,
            message: erreur.message,
        });
    }
};

/* ===================== PRÉFÉRENCES ===================== */
// Mettre à jour les préférences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        const champsAutorises = [
            "trajetSilencieux",
            "assistanceBagages",
            "chauffeurExperimente",
        ];

        const preferences = {};
        champsAutorises.forEach((champ) => {
            if (req.body[champ] !== undefined) {
                preferences[`preferences.${champ}`] = req.body[champ];
            }
        });

        await Utilisateur.findByIdAndUpdate(userId, {
            $set: preferences,
        });

        // LOG DE L'ACTIVITÉ
        await logActivity({
            utilisateurId: userId,
            nomUtilisateur: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
            role: req.utilisateur.role,
            action: "MISE_A_JOUR_PREFERENCES",
            module: "UTILISATEURS",
            details: req.body,
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown"
        });

        return res.status(200).json({
            succes: true,
            message: "Préférences mises à jour",
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// Récupérer les statistiques du passager
exports.getStats = async (req, res) => {
    try {
        const passagerId = req.utilisateur._id;

        // 1. Nombre de trajets (Basé sur les trajets terminés)
        const totalTrips = await Trajet.countDocuments({
            passager: passagerId,
            statut: "TERMINEE"
        });

        // 2. Dépenses totales (Basé sur les paiements "PAYE" pour être cohérent avec l'écran Paiement)
        const statsComptables = await Paiement.aggregate([
            { $match: { passager: passagerId, statut: "PAYE" } },
            {
                $group: {
                    _id: null,
                    totalSpending: { $sum: "$montantTotal" }
                }
            }
        ]);

        const totalSpending = statsComptables[0]?.totalSpending || 0;

        // 3. Temps total passé en trajet
        const statsTemps = await Trajet.aggregate([
            { $match: { passager: passagerId, statut: "TERMINEE" } },
            {
                $group: {
                    _id: null,
                    totalDuration: { $sum: "$dureeMin" }
                }
            }
        ]);

        const totalTime = statsTemps[0]?.totalDuration || 0;

        const stats = {
            trips: totalTrips,
            spending: totalSpending,
            averageRating: req.utilisateur.noteMoyenne || 5.0,
            totalTime: totalTime
        };

        return res.status(200).json({
            succes: true,
            stats
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};


