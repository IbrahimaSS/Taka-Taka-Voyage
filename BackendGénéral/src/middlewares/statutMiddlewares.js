exports.verifierStatutActif = (req, res, next) => {
    if (!req.utilisateur) {
        return res.status(401).json({
        succes: false,
        message: "Utilisateur non authentifié",
        });
    }

    if (req.utilisateur.statut !== "ACTIF") {
        return res.status(403).json({
        succes: false,
        message:
            req.utilisateur.statut === "SUSPENDU"
            ? "Compte suspendu. Contactez l’administration."
            : "Compte inactif. Veuillez contacter l’administration.",
        });
    }

    next();
};
