const { validationResult } = require("express-validator");

const authService = require("../../services/authService");
const otpService = require("../../services/OtpService");

const InscriptionTemporaire = require("../../models/InscriptionsTemporaire");

//============================= CONNEXION =============================================
exports.connexion = async (req, res) => {
    try {
        const erreurs = validationResult(req);
        if (!erreurs.isEmpty()) {
            return res.status(400).json({
                succes: false,
                erreurs: erreurs.array(),
            });
        }
        const { identifiant, motDePasse } = req.body;

        // Vérification mot de passe
        if (!motDePasse || motDePasse.length < 8) {
            return res.status(400).json({
                succes: false,
                message: "Le mot de passe doit contenir au moins 8 caractères",
            });
        }
        // Connexion via email OU téléphone
        const resultat = await authService.connecterUtilisateur(
            identifiant,
            motDePasse
        );
        const utilisateur = resultat.utilisateur;
        // Vérifier le Statut
        if (utilisateur.statut !== "ACTIF") {
            return res.status(403).json({
                succes: false,
                message:
                    utilisateur.statut === "SUSPENDU"
                        ? "Compte suspendu. Contactez l’administration."
                        : "Compte inactif. Veuillez contacter l’administration.",
            });
        }
        // Cookie httpOnly pour session via cookies
        const cookieOptions = {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        };
        res.cookie("takataka_token", resultat.token, cookieOptions);

        return res.status(200).json({
            succes: true,
            message: "=====CONNEXION REUSSIE=====",
            token: resultat.token,
            utilisateur: {
                id: resultat.utilisateur._id,
                nom: resultat.utilisateur.nom,
                prenom: resultat.utilisateur.prenom,
                email: resultat.utilisateur.email,
                telephone: resultat.utilisateur.telephone,
                role: resultat.utilisateur.role,
                genre: resultat.utilisateur.genre,
                photoUrl: resultat.utilisateur.photoUrl || null,
            },
        });
    } catch (erreur) {
        return res.status(401).json({
            succes: false,
            message: erreur.message,
        });
    }
};

//============================= INIT INSCRIPTION + OTP =============================
exports.initInscription = async (req, res) => {
    try {
        // RÉCUPÉRATION DES ERREURS DU VALIDATOR
        const erreurs = validationResult(req);
        if (!erreurs.isEmpty()) {
            return res.status(400).json({
                succes: false,
                erreurs: erreurs.array(),
            });
        }
        const {
            nom,
            prenom,
            telephone,
            email,
            motDePasse,
            typeProfil,
            genre,
        } = req.body;
        //Taile et Format et Champs
        if (!telephone || !/^[0-9]{9}$/.test(telephone)) {
            return res.status(400).json({
                succes: false,
                message: "Numéro de Téléphone Invalide",
            });
        }
        if (!motDePasse || motDePasse.length < 8) {
            return res.status(400).json({
                succes: false,
                message: "Le mot de passe doit contenir au moins 8 caractères",
            });
        }
        if (!telephone || !motDePasse) {
            return res.status(400).json({
                succes: false,
                message: "Données d’inscription incomplètes",
            });
        }
        // Vérifier existence utilisateur
        const existeDeja = await authService.verifierUtilisateurExiste(
            email,
            telephone
        );
        if (existeDeja) {
            return res.status(400).json({
                succes: false,
                message: "Un compte avec cet email ou téléphone existe déjà",
            });
        }
        // Supprimer anciennes tentatives
        await InscriptionTemporaire.deleteMany({ telephone });
        // Sauvegarde temporaire
        await InscriptionTemporaire.create({
            nom,
            prenom,
            telephone,
            email,
            motDePasse,
            typeProfil,
            genre,
            otpVerifie: false,
            expireA: new Date(Date.now() + 5 * 60 * 1000),
        });

        // Générer OTP
        // await otpService.genererOtp(telephone);
        await otpService.genererOtp({ telephone, email });

        return res.status(200).json({
            succes: true,
            message: "=====OTP GENERE. VERIFICATION REQUISE.=====",
        });
    } catch (erreur) {
        console.error("INIT_INSCRIPTION ERROR:", erreur?.response?.data || erreur);

        return res.status(500).json({
            succes: false,
            message: erreur.message || "Erreur lors de l'initialisation de l'inscription",
            details: erreur?.response?.data || null,
        });
    }
};


//============================= VÉRIFICATION OTP =================================
exports.verifierOtp = async (req, res) => {
    try {
        const { telephone, code } = req.body;

        await otpService.verifierOtp(telephone, code);

        await InscriptionTemporaire.findOneAndUpdate(
            { telephone },
            { otpVerifie: true }
        );

        return res.status(200).json({
            succes: true,
            message: "=====OTP VERIFIER AVEC SUCCES=====",
        });
    } catch (erreur) {
        return res.status(400).json({
            succes: false,
            message: erreur.message,
        });
    }
};

//============================= FINALISER INSCRIPTION =============================
exports.finaliserInscription = async (req, res) => {
    try {
        const { telephone } = req.body;

        const inscription = await InscriptionTemporaire.findOne({
            telephone,
            otpVerifie: true,
            expireA: { $gt: new Date() },
        });

        if (!inscription) {
            return res.status(400).json({
                succes: false,
                message: "OTP non validé ou inscription expirée",
            });
        }

        const utilisateur = await authService.inscrireUtilisateur({
            nom: inscription.nom,
            prenom: inscription.prenom,
            telephone: inscription.telephone,
            email: inscription.email,
            motDePasse: inscription.motDePasse,
            typeProfil: inscription.typeProfil,
            genre: inscription.genre,
        });

        await InscriptionTemporaire.deleteMany({ telephone });

        return res.status(201).json({
            succes: true,
            message: "=====INSCRIPTION FINALISER AVEC SUCCES=====",
            utilisateur: {
                id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                telephone: utilisateur.telephone,
                email: utilisateur.email,
                role: utilisateur.role,
                genre: utilisateur.genre,
                motDePasse: utilisateur.motDePasse,
            },
        });
    } catch (erreur) {
        return res.status(400).json({
            succes: false,
            message: erreur.message,
        });
    }
};

//============================= RÉCUPÉRER UTILISATEUR CONNECTÉ =============================
exports.getMe = async (req, res) => {
    try {
        // L'utilisateur est déjà attaché à la requête par le middleware verifierToken
        const utilisateur = req.utilisateur;

        return res.status(200).json({
            succes: true,
            utilisateur: {
                id: utilisateur._id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                telephone: utilisateur.telephone,
                role: utilisateur.role,
                genre: utilisateur.genre,
                photoUrl: utilisateur.photoUrl || null,
                avatar: utilisateur.photoUrl || null,
                statut: utilisateur.statut
            },
        });
    } catch (erreur) {
        return res.status(500).json({
            succes: false,
            message: "Erreur lors de la récupération des informations utilisateur",
        });
    }
};

//============================= DÉCONNEXION =============================
exports.logout = async (req, res) => {
    try {
        // Supprimer le cookie de session
        res.clearCookie("takataka_token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({
            succes: true,
            message: "Déconnexion réussie",
        });
    } catch (erreur) {
        return res.status(500).json({
            succes: false,
            message: "Erreur lors de la déconnexion",
        });
    }
};


