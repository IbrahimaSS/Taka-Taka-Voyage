const Utilisateur = require("../../models/Utilisateurs");
const Transaction = require("../../models/Transaction");
const mongoose = require("mongoose");
const { envoyerEmailBrevo } = require("../../services/emailService");
const { sendSMS } = require("../../services/smsService");

/**
 * 💰 walletControllers - Gestion du Portefeuille (Fintech)
 */

// 1. Récupérer le solde actuel
exports.getSolde = async (req, res) => {
    try {
        const user = await Utilisateur.findById(req.utilisateur.id).select("solde");
        if (!user) {
            return res.status(404).json({ succes: false, message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ succes: true, solde: user.solde || 0 });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// 2. Déposer de l'argent (Recharge) - Simulation
exports.recharger = async (req, res) => {
    const { montant, methode, reference } = req.body;

    if (!montant || montant <= 0) {
        return res.status(400).json({ succes: false, message: "Montant invalide" });
    }

    try {
        // En prod, ici on appellerait l'API Orange/MTN pour vérifier referenceExterne

        // Mise à jour du solde
        const user = await Utilisateur.findByIdAndUpdate(
            req.utilisateur.id,
            { $inc: { solde: montant } },
            { new: true }
        );

        // Création de la transaction
        await Transaction.create({
            utilisateur: req.utilisateur.id,
            type: "DEPOT",
            montant: montant,
            methode: methode || "ORANGE_MONEY",
            reference: reference || `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            statut: "COMPLETE",
            commentaire: "Recharge portefeuille"
        });

        // ✅ NOTIFICATION ADMIN TEMPS RÉEL
        if (global.io) {
            global.io.to("ADMINS").emit("admin:notification", {
                type: "DEPOT",
                message: `L'utilisateur ${user.prenom} ${user.nom} a effectué un dépôt de ${montant.toLocaleString()} GNF`,
                montant,
                timestamp: new Date()
            });
        }

        res.status(200).json({
            succes: true,
            message: "Recharge effectuée",
            nouveauSolde: user.solde
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// 3. Transférer de l'argent à un autre utilisateur
exports.transferer = async (req, res) => {
    const { destinataireTel, montant: montantBrut } = req.body;
    const montant = Number(montantBrut);

    if (!montant || montant <= 0) {
        return res.status(400).json({ succes: false, message: "Montant invalide" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const expediteur = await Utilisateur.findById(req.utilisateur.id).session(session);

        if (expediteur.solde < montant) {
            throw new Error("Solde insuffisant pour ce transfert");
        }

        // Normalisation rapide du numéro de téléphone pour la recherche
        let searchPhone = destinataireTel.trim().replace(/\s/g, '');
        
        const destinataire = await Utilisateur.findOne({ 
            $or: [
                { telephone: searchPhone },
                { telephone: searchPhone.replace(/^\+224/, '') },
                { telephone: `+224${searchPhone.replace(/^\+224/, '')}` }
            ]
        }).session(session);

        if (!destinataire) {
            throw new Error("Destinataire introuvable sur TakaTaka");
        }

        if (expediteur.id === destinataire.id) {
            throw new Error("Vous ne pouvez pas vous envoyer d'argent à vous-même");
        }

        // Mouvements de solde (On force le calcul numérique)
        expediteur.solde = Number(expediteur.solde) - montant;
        destinataire.solde = Number(destinataire.solde) + montant;

        await expediteur.save({ session });
        await destinataire.save({ session });

        // Enregistrement des deux côtés de la transaction
        const refTransfert = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await Transaction.create([{
            utilisateur: expediteur.id,
            type: "TRANSFERT_ENVOI",
            montant: montant,
            methode: "WALLET",
            destinataire: destinataire.id,
            reference: refTransfert,
            statut: "COMPLETE",
            commentaire: `Envoi à ${destinataire.prenom} ${destinataire.nom}`
        }], { session });

        await Transaction.create([{
            utilisateur: destinataire.id,
            type: "TRANSFERT_RECU",
            montant: montant,
            methode: "WALLET",
            expediteur: expediteur.id,
            reference: `REC-${refTransfert}`,
            statut: "COMPLETE",
            commentaire: `Reçu de ${expediteur.prenom} ${expediteur.nom}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // 🔔 [NOTIFICATION TEMPS RÉEL] Prévenir le destinataire
        // On récupère l'IO depuis le global (défini dans server.js)
        const io = global.io;
        
        if (io) {
            const destinataireIdStr = destinataire._id.toString();
            // Important: Le nom de la room doit correspondre à celui défini dans socket.js (USER_ID)
            const roomName = `USER_${destinataireIdStr}`;
            
            console.log(`📡 Émission notification transfert vers room: ${roomName}`);

            io.to(roomName).emit("wallet:update", {
                type: "TRANSFERT_RECU",
                montant: montant,
                playSound: true,
                expediteur: `${expediteur.prenom} ${expediteur.nom}`,
                message: `Vous avez reçu ${montant.toLocaleString()} GNF de ${expediteur.prenom} ${expediteur.nom} ! 💰`
            });

            io.to(roomName).emit("notification:new", {
                title: "Argent reçu ! 💰",
                message: `${expediteur.prenom} vous a envoyé ${montant.toLocaleString()} GNF`,
                type: "SUCCESS",
                playSound: true
            });
        }

        res.status(200).json({
            succes: true,
            message: "Transfert effectué avec succès",
            nouveauSolde: expediteur.solde
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ succes: false, message: error.message });
    }
};

// 4. Envoyer un code OTP pour le retrait
exports.envoyerCodeRetrait = async (req, res) => {
    try {
        const user = await Utilisateur.findById(req.utilisateur.id);
        if (!user) return res.status(404).json({ succes: false, message: "Utilisateur non trouvé" });

        // Génération d'un code à 4 chiffres
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Sauvegarde dans la DB (validité 5 minutes)
        user.withdrawalOTP = otp;
        user.withdrawalOTPExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        const userEmail = user.email;
        if (!userEmail) throw new Error("L'utilisateur n'a pas d'adresse e-mail configurée.");

        console.log(`📧 [BREVO_EMAIL] Tentative envoi OTP à : ${userEmail}`);

        await envoyerEmailBrevo({
            toEmail: userEmail,
            subject: "Votre code de sécurité (OTP) - TakaTaka",
            html: `
              <div style="font-family:Arial,sans-serif; max-width: 500px; margin: auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color:#0f172a;">Demande de retrait TakaTaka</h2>
                <p style="color:#475569;">Voici votre code de sécurité (OTP) pour valider votre demande de retrait.</p>
                <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin: 20px 0;">
                    <div style="font-size:36px; font-weight:900; letter-spacing:8px; color:#10b981;">${otp}</div>
                </div>
                <p style="color:#64748b; font-size:12px;">Ce code est valide pendant 5 minutes. Ne le partagez avec personne.</p>
                <div style="margin-top:20px; border-top:1px solid #eee; pt-10px; font-size:10px; color:#94a3b8;">
                  © 2026 TakaTaka Voyage. Tous droits réservés.
                </div>
              </div>
            `
        });

        // --- 📱 ENVOI SMS AFRICA'S TALKING ---
        try {
            if (user.telephone) {
                const smsMessage = `Code de sécurité TakaTaka pour votre retrait : ${otp}. Valable 5 minutes. Ne le partagez pas.`;
                await sendSMS(user.telephone, smsMessage);
            }
        } catch (err) {
            console.error("❌ Erreur envoi SMS OTP Retrait:", err.message);
        }

        res.status(200).json({ 
            succes: true, 
            message: "Code de sécurité envoyé par E-mail et SMS avec succès",
            debugCode: otp 
        });
    } catch (error) {
        console.error("❌ Erreur détaillée Brevo Email:", error.message);
        res.status(500).json({
            succes: false,
            message: `Erreur lors de l'envoi de l'e-mail: ${error.message}`,
            error: error.message
        });
    }
};

// 5. Demander un retrait (Avec validation Admin + OTP)
exports.demanderRetrait = async (req, res) => {
    const { montant, methode, numeroMobileMoney, otp } = req.body;

    if (!otp) {
        return res.status(400).json({ succes: false, message: "Code de sécurité requis" });
    }

    if (!montant || montant <= 0) {
        return res.status(400).json({ succes: false, message: "Montant invalide" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await Utilisateur.findById(req.utilisateur.id).session(session);

        // --- VÉRIFICATION DE LA SÉCURITÉ ---
        // Si otp est un ID Token Firebase (longue chaîne), on le vérifie via admin sdk
        if (otp.length > 20) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(otp);
                console.log("✅ [BACKEND] Firebase Token validé pour:", decodedToken.phone_number);

                // Optionnel: Vérifier que le numéro dans le token correspond 
                // à un des numéros de l'utilisateur ou est juste valide
                if (!decodedToken.phone_number) {
                    throw new Error("Le jeton Firebase ne contient pas de numéro de téléphone validé.");
                }
            } catch (authError) {
                console.error("❌ [BACKEND] Erreur validation Firebase:", authError.message);
                throw new Error("Session de sécurité expirée ou invalide. Veuillez renvoyer le code.");
            }
        } else {
            // Fallback: Ancien système OTP local (4 chiffres)
            if (!user.withdrawalOTP || user.withdrawalOTP !== otp || user.withdrawalOTPExpires < Date.now()) {
                throw new Error("Code de sécurité invalide ou expiré");
            }
        }

        if (user.solde < montant) {
            throw new Error("Solde insuffisant");
        }

        // Consommer l'OTP
        user.withdrawalOTP = null;
        user.withdrawalOTPExpires = null;

        // Verrouillage du montant
        user.solde -= montant;
        await user.save({ session });

        // Création de la transaction en attente
        const trans = await Transaction.create([{
            utilisateur: req.utilisateur.id,
            type: "RETRAIT",
            montant: montant,
            methode: methode || "ORANGE_MONEY",
            reference: `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            statut: "EN_ATTENTE",
            commentaire: `Demande de retrait vers ${numeroMobileMoney || user.telephone}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // ✅ NOTIFICATION ADMIN TEMPS RÉEL (ALERTE SONORE)
        if (global.io) {
            global.io.to("ADMINS").emit("admin:withdraw_alert", {
                type: "RETRAIT",
                message: `Nouvelle demande de retrait : ${user.prenom} ${user.nom} (${montant.toLocaleString()} GNF)`,
                montant,
                utilisateur: `${user.prenom} ${user.nom}`,
                timestamp: new Date()
            });
        }

        res.status(201).json({
            succes: true,
            message: "Demande de retrait envoyée à l'administration",
            transactionId: trans[0]._id,
            nouveauSolde: user.solde
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ succes: false, message: error.message });
    }
};

// 5. Historique des transactions du portefeuille
exports.getHistorique = async (req, res) => {
    try {
        const transactions = await Transaction.find({ utilisateur: req.utilisateur.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ succes: true, transactions });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};
