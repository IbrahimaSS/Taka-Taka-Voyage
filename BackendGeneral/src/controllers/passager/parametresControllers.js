const ParametresUtilisateur = require("../models/ParametresUtilisateur");

exports.getParametres = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        let parametres = await ParametresUtilisateur.findOne({
        utilisateur: userId,
        });

        // 🆕 création automatique si absent
        if (!parametres) {
        parametres = await ParametresUtilisateur.create({
            utilisateur: userId,
        });
        }

        res.status(200).json({
        succes: true,
        parametres,
        });
    } catch (error) {
        res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// METTRE A JOUR LES PARAMETRES
exports.updateParametres = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        const parametres = await ParametresUtilisateur.findOneAndUpdate(
        { utilisateur: userId },
        { $set: req.body },
        { new: true, upsert: true }
        );

        res.status(200).json({
        succes: true,
        message: "Paramètres mis à jour",
        parametres,
        });
    } catch (error) {
        res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

