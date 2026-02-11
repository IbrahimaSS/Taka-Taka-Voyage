const jwt = require("jsonwebtoken");
const Utilisateur = require("../models/Utilisateurs");

exports.verifierToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieHeader = req.headers.cookie || "";

        const lireCookie = (name) => {
        const cookies = cookieHeader.split(";").map((c) => c.trim());
        const found = cookies.find((c) => c.startsWith(`${name}=`));
        if (!found) return null;
        return decodeURIComponent(found.split("=")[1]);
        };

        let token = null;
        if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        } else {
        token = lireCookie("takataka_token");
        }

        if (!token) {
        return res.status(401).json({
            succes: false,
            message: "Accès refusé. Token manquant",
        });
        }

        let donnees;
        try {
        donnees = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
        return res.status(401).json({
            succes: false,
            message: "Token invalide ou expiré",
        });
        }

        const utilisateur = await Utilisateur.findById(donnees.id).select(
        "-motDePasse"
        );

        if (!utilisateur) {
        return res.status(401).json({
            succes: false,
            message: "Utilisateur introuvable",
        });
        }

        // Vérifier si le mot de passe a été changé après émission du token
        if (
        utilisateur.passwordChangedAt &&
        donnees.iat * 1000 < utilisateur.passwordChangedAt.getTime()
        ) {
        return res.status(401).json({
            succes: false,
            message: "Session expirée. Veuillez vous reconnecter.",
        });
        }

        req.utilisateur = utilisateur;
        next();
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: "Erreur serveur (auth)",
        });
    }
};
