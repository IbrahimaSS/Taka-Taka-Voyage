const { validationResult } = require("express-validator");

const authService = require("../../services/authService");
const otpService = require("../../services/OtpService");

const InscriptionTemporaire = require("../../models/InscriptionsTemporaire");
const ChauffeurProfile = require("../../models/ChauffeurProfile");
const Utilisateurs = require("../../models/Utilisateurs");
const { logActivity } = require("../../utils/logger");

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
        const { identifiant, motDePasse, deviceId, otpCode } = req.body;

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

        // ====== NOUVELLE LOGIQUE 2FA ADAPTATIF ======
        const clientIp = req.ip || req.connection.remoteAddress;
        const clientUserAgent = req.headers["user-agent"] || "Unknown";
        let finalDeviceId = deviceId;

        const AppareilApprouve = require("../../models/AppareilApprouve");

        if (otpCode) {
            // verifier OTP
            try {
                await otpService.verifierOtp(utilisateur.telephone, otpCode);
            } catch (err) {
                return res.status(400).json({ succes: false, requires2FA: true, message: err.message, deviceId: finalDeviceId });
            }

            if (!finalDeviceId) {
                finalDeviceId = require("crypto").randomUUID();
            }

            // Mark new device as approved
            await AppareilApprouve.findOneAndUpdate(
                { utilisateur: utilisateur._id, deviceId: finalDeviceId },
                { isApprouve: true, userAgent: clientUserAgent, derniereIp: clientIp, derniereConnexion: new Date() },
                { upsert: true, new: true }
            );
        } else {
            let isDeviceApprouve = false;
            const countAppareils = await AppareilApprouve.countDocuments({ utilisateur: utilisateur._id, isApprouve: true });

            if (finalDeviceId && countAppareils > 0) {
                const device = await AppareilApprouve.findOne({ utilisateur: utilisateur._id, deviceId: finalDeviceId, isApprouve: true });
                if (device) {
                    isDeviceApprouve = true;
                    device.derniereIp = clientIp;
                    device.derniereConnexion = new Date();
                    await device.save();
                }
            } else if (countAppareils === 0) {
                isDeviceApprouve = true;
                if (!finalDeviceId) finalDeviceId = require("crypto").randomUUID();

                await AppareilApprouve.create({
                    utilisateur: utilisateur._id,
                    deviceId: finalDeviceId,
                    userAgent: clientUserAgent,
                    isApprouve: true,
                    derniereIp: clientIp
                });
            }

            if (!isDeviceApprouve) {
                // NOUVEL APPAREIL DETECTE ! 
                await otpService.genererOtp({ telephone: utilisateur.telephone, email: utilisateur.email });

                return res.status(200).json({
                    succes: false, // Ne pas connecter
                    requires2FA: true, // Tag spécial frontend 
                    message: "Nouvel appareil détecté. Veuillez confirmer votre identité avec le code OTP.",
                    deviceId: finalDeviceId || require("crypto").randomUUID(),
                    telephoneMasked: utilisateur.telephone.replace(/.(?=.{4})/g, '*'),
                    emailMasked: utilisateur.email.replace(/(.{2})(.*)(?=@)/, (m, p1, p2) => p1 + '*'.repeat(p2.length))
                });
            }
        }
        // ============================================

        // Vérifier le Statut (Utilisateurs)
        if (utilisateur.statut === "SUSPENDU") {
            return res.status(403).json({
                succes: false,
                message: "Compte suspendu. Contactez l'administration.",
            });
        }

        // 🔒 Pour les CHAUFFEURS : vérification SYSTÉMATIQUE du ChauffeurProfile
        // (couvre les anciens comptes créés avant la mise à jour du statut par défaut)
        let statutFinal = utilisateur.statut;
        if (utilisateur.role === "CHAUFFEUR") {
            const profil = await ChauffeurProfile.findOne({ utilisateur: utilisateur._id }).select("statut");
            if (profil) {
                if (profil.statut === "EN_ATTENTE" || profil.statut === "INACTIF") {
                    // Synchroniser Utilisateurs.statut si nécessaire
                    if (utilisateur.statut !== "EN_ATTENTE") {
                        await Utilisateurs.findByIdAndUpdate(utilisateur._id, { statut: "EN_ATTENTE" });
                    }
                    statutFinal = "EN_ATTENTE";
                } else if (profil.statut === "SUSPENDU") {
                    if (utilisateur.statut !== "SUSPENDU") {
                        await Utilisateurs.findByIdAndUpdate(utilisateur._id, { statut: "SUSPENDU" });
                    }
                    return res.status(403).json({
                        succes: false,
                        message: "Compte chauffeur suspendu. Contactez l'administration.",
                    });
                } else if (profil.statut === "ACTIF") {
                    // Profil validé, s'assurer que Utilisateurs est aussi ACTIF
                    if (utilisateur.statut !== "ACTIF") {
                        await Utilisateurs.findByIdAndUpdate(utilisateur._id, { statut: "ACTIF" });
                    }
                    statutFinal = "ACTIF";
                }
            } else {
                // Pas de profil chauffeur encore créé → compte EN_ATTENTE
                statutFinal = "EN_ATTENTE";
            }
        }

        // Cookie httpOnly pour session via cookies
        // En production (cross-domain Vercel→Render), sameSite doit être "none" + secure
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        };
        res.cookie("takataka_token", resultat.token, cookieOptions);

        // Log de l'activité réussie
        await logActivity({
            utilisateurId: resultat.utilisateur._id,
            nomUtilisateur: `${resultat.utilisateur.prenom} ${resultat.utilisateur.nom}`,
            role: resultat.utilisateur.role,
            action: "CONNEXION",
            module: "AUTH",
            ip: clientIp,
            navigateur: clientUserAgent,
            statut: "REUSSI"
        });

        return res.status(200).json({
            succes: true,
            message: "=====CONNEXION REUSSIE=====",
            token: resultat.token,
            statut: statutFinal,
            deviceId: finalDeviceId,
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
        // Optionnel : Loguer l'échec de connexion
        await logActivity({
            nomUtilisateur: req.body.identifiant || "Inconnu",
            role: "VISITEUR",
            action: "CONNEXION",
            module: "AUTH",
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown",
            statut: "ECHOUE",
            details: { erreur: erreur.message }
        });

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

        // Log de la création de compte
        await logActivity({
            utilisateurId: utilisateur._id,
            nomUtilisateur: `${utilisateur.prenom} ${utilisateur.nom}`,
            role: utilisateur.role,
            action: "CREATION_COMPTE",
            module: "AUTH",
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown",
            statut: "REUSSI"
        });

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
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("takataka_token", {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
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

//============================= CALLBACK SOCIAL (GOOGLE/FACEBOOK) =============================
exports.socialCallback = async (req, res) => {
    try {
        const utilisateur = req.user;
        if (!utilisateur) {
            return res.redirect(`${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/connexion?error=auth_failed`);
        }

        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
            { id: utilisateur._id, role: utilisateur.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        };
        res.cookie("takataka_token", token, cookieOptions);

        // Rediriger vers le dashboard avec le token dans l'URL pour que le frontend puisse le stocker
        let target = "/";
        if (utilisateur.role === 'ADMIN') target = "/admin";
        else if (utilisateur.role === 'CHAUFFEUR') target = "/chauffeur";
        else if (utilisateur.role === 'PASSAGER') target = "/passager";

        const redirectUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}${target}?social_login=success&token=${token}`;
        return res.redirect(redirectUrl);
    } catch (erreur) {
        console.error("SOCIAL_CALLBACK ERROR:", erreur);
        return res.redirect(`${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/connexion?error=server_error`);
    }
};

//============================= FINALISER PROFIL SOCIAL =============================
exports.socialFinalize = async (req, res) => {
    try {
        const { telephone, role } = req.body;
        const utilisateur = await Utilisateurs.findById(req.utilisateur.id);

        if (!utilisateur) {
            return res.status(404).json({ succes: false, message: "Utilisateur non trouvé" });
        }

        // Si l'utilisateur est déjà complet, on évite les changements de rôle arbitraires
        if (utilisateur.telephone) {
            return res.status(400).json({ succes: false, message: "Profil déjà finalisé" });
        }

        // Vérifier si le téléphone est déjà utilisé par un autre compte
        const telephoneExiste = await Utilisateurs.findOne({ telephone });
        if (telephoneExiste) {
            return res.status(400).json({ succes: false, message: "Ce numéro de téléphone est déjà utilisé" });
        }

        utilisateur.telephone = telephone;

        // On n'autorise que PASSAGER ou CHAUFFEUR
        if (role === 'CHAUFFEUR' || role === 'PASSAGER') {
            utilisateur.role = role;
        }

        await utilisateur.save();

        res.json({
            succes: true,
            message: "Profil finalisé avec succès",
            utilisateur
        });
    } catch (erreur) {
        console.error("SOCIAL_FINALIZE ERROR:", erreur);
        res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};


