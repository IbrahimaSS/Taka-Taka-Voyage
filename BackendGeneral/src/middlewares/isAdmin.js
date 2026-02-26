module.exports = (req, res, next) => {
    try {
        if (!req.utilisateur) {
        return res.status(401).json({
            succes: false,
            message: "Utilisateur non authentifié",
        });
        }

        if (req.utilisateur.role !== "ADMIN") {
        return res.status(403).json({
            succes: false,
            message: "Accès réservé aux administrateurs",
        });
        }

        next();
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: "Erreur middleware isAdmin",
        });
    }
};
