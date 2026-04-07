const Utilisateur = require("../../models/Utilisateurs");
const Transaction = require("../../models/Transaction");
const mongoose = require("mongoose");
const { envoyerEmailBrevo } = require("../../services/emailService");

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
    const { destinataireTel, montant } = req.body;

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

        const destinataire = await Utilisateur.findOne({ telephone: destinataireTel }).session(session);
        if (!destinataire) {
            throw new Error("Destinataire introuvable");
        }

        if (expediteur.id === destinataire.id) {
            throw new Error("Vous ne pouvez pas vous envoyer d'argent à vous-même");
        }

        // Mouvements de solde
        expediteur.solde -= montant;
        destinataire.solde += montant;

        await expediteur.save({ session });
        await destinataire.save({ session });

        // Enregistrement des deux côtés de la transaction
        await Transaction.create([{
            utilisateur: expediteur.id,
            type: "TRANSFERT_ENVOI",
            montant: montant,
            methode: "WALLET",
            destinataire: destinataire.id,
            statut: "COMPLETE",
            commentaire: `Envoi à ${destinataire.prenom} ${destinataire.nom}`
        }], { session });

        await Transaction.create([{
            utilisateur: destinataire.id,
            type: "TRANSFERT_RECU",
            montant: montant,
            methode: "WALLET",
            expediteur: expediteur.id,
            statut: "COMPLETE",
            commentaire: `Reçu de ${expediteur.prenom} ${expediteur.nom}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ 
            succes: true, 
            message: "Transfert réussi", 
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
            subject: "Votre code de sécurité (OTP) pour le retrait - TakaTaka",
            html: `
              <div style="font-family:Arial,sans-serif; max-width: 500px; margin: auto; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color:#0f172a;">Demande de retrait TakaTaka</h2>
                <p style="color:#475569;">Voici votre code de sécurité (OTP) pour valider votre demande de retrait.</p>
                <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin: 20px 0;">
                    <div style="font-size:36px; font-weight:900; letter-spacing:8px; color:#10b981;">${otp}</div>
                </div>
                <p style="color:#64748b; font-size:12px;">Ce code est valide pendant 5 minutes. Ne le partagez avec personne.</p>
              </div>
            `
        });

        res.status(200).json({ 
            succes: true, 
            message: "Code de sécurité envoyé par E-mail avec succès",
            debugCode: otp // On le garde pour vos tests immédiats
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
        
        // Vérification de l'OTP
        if (!user.withdrawalOTP || user.withdrawalOTP !== otp || user.withdrawalOTPExpires < Date.now()) {
            throw new Error("Code de sécurité invalide ou expiré");
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
