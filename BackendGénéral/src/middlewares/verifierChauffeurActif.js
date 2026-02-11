const ChauffeurProfile = require("../models/ChauffeurProfile");

module.exports = async (req, res, next) => {
    try {
        const userId = req.utilisateur?.id || req.utilisateur?._id; // selon ton verifierToken

        if (!userId) {
        return res.status(401).json({ succes: false, message: "Non autorisé" });
        }

        const profil = await ChauffeurProfile.findOne({ utilisateur: userId }).select("statut");

        if (!profil) {
        return res.status(403).json({
            succes: false,
            message: "Profil chauffeur introuvable. Action non autorisée.",
        });
        }

        // Bloquer tout sauf ACTIF
        if (profil.statut !== "ACTIF") {
        const msg =
            profil.statut === "SUSPENDU"
            ? "Compte chauffeur suspendu. Contactez l’administration."
            : profil.statut === "INACTIF"
            ? "Compte chauffeur désactivé. Contactez l’administration."
            : "Chauffeur en attente de validation. Action non autorisée.";

        return res.status(403).json({ succes: false, message: msg, statut: profil.statut });
        }

        next();
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
