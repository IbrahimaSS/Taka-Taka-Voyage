const Support = require("../../models/Supports");

// CRÉER UN MESSAGE SUPPORT
exports.creerSupport = async (req, res) => {
    try {
        const utilisateur = req.utilisateur;
        const { sujet, message, reservation, piecesJointes } = req.body;

        if (!sujet || !message) {
        return res.status(400).json({
            succes: false,
            message: "Sujet et message obligatoires",
        });
        }

        const support = await Support.create({
        utilisateur: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        sujet,
        message,
        reservation: reservation || null,
        piecesJointes: piecesJointes || [],
        });

        res.status(201).json({
        succes: true,
        message: "Message envoyé au support",
        support,
        });
    } catch (error) {
        res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
    };

    // HISTORIQUE SUPPORT UTILISATEUR
    exports.listerMesSupports = async (req, res) => {
    try {
        const supports = await Support.find({
        utilisateur: req.utilisateur._id,
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
        succes: true,
        supports,
        });
    } catch (error) {
        res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
