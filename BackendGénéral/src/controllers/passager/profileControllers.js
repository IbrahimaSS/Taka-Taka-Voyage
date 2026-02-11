const Utilisateur = require("../../models/Utilisateurs");
const { validationResult } = require("express-validator");

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
                photo: utilisateur.photoUrl || null,
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
            "adresse",
        ];

        const donnees = {};
        champsAutorises.forEach((champ) => {
            if (req.body[champ] !== undefined) {
                donnees[champ] = req.body[champ];
            }
        });

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

        return res.status(200).json({
            succes: true,
            message: "Profil mis à jour avec succès",
            utilisateur: utilisateurMisAJour,
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

