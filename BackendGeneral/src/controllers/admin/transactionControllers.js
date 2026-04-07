const Transaction = require("../../models/Transaction");
const Utilisateur = require("../../models/Utilisateurs");
const mongoose = require("mongoose");

/**
 * 💼 transactionControllers (Admin) - Management of Wallet Activity
 */

// 1. Lister toutes les transactions avec pagination et filtres
exports.listeTransactions = async (req, res) => {
    try {
        const { status, type, search, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status && status !== 'all') query.statut = status;
        if (type && type !== 'all') query.type = type;

        // Recherche par utilisateur (prénom, nom, téléphone)
        if (search) {
            const matchedUsers = await Utilisateur.find({
                $or: [
                    { prenom: { $regex: search, $options: "i" } },
                    { nom: { $regex: search, $options: "i" } },
                    { telephone: { $regex: search, $options: "i" } }
                ]
            }).select("_id");
            
            const userIds = matchedUsers.map(u => u._id);
            query.utilisateur = { $in: userIds };
        }

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .populate("utilisateur", "prenom nom telephone photoUrl role")
            .populate("destinataire", "prenom nom telephone")
            .populate("expediteur", "prenom nom telephone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            succes: true,
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// 2. Statistiques globales du portefeuille
exports.statsTransactions = async (req, res) => {
    try {
        const stats = await Transaction.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalMontant: { $sum: "$montant" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const pendingWithdrawals = await Transaction.countDocuments({ type: "RETRAIT", statut: "EN_ATTENTE" });
        const totalUsersBalance = await Utilisateur.aggregate([
            { $group: { _id: null, total: { $sum: "$solde" } } }
        ]);

        res.status(200).json({
            succes: true,
            stats,
            pendingWithdrawals,
            totalUsersBalance: totalUsersBalance[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// 3. Modifier le statut (Valider/Annuler un retrait)
exports.modifierStatut = async (req, res) => {
    const { id } = req.params;
    const { statut, commentaire } = req.body; // COMPLETE, ANNULE, ECHOUE

    if (!["COMPLETE", "ANNULE", "ECHOUE"].includes(statut)) {
        return res.status(400).json({ succes: false, message: "Statut invalide" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.findById(id).session(session);
        if (!transaction) throw new Error("Transaction introuvable");

        if (transaction.statut !== "EN_ATTENTE") {
            throw new Error("Cette transaction a déjà été traitée");
        }

        // Si on annule ou on échoue un RETRAIT, on rembourse l'utilisateur
        if (transaction.type === "RETRAIT" && (statut === "ANNULE" || statut === "ECHOUE")) {
            await Utilisateur.findByIdAndUpdate(
                transaction.utilisateur,
                { $inc: { solde: transaction.montant } },
                { session }
            );
        }

        // Mise à jour de la transaction
        transaction.statut = statut;
        if (commentaire) transaction.commentaire = (transaction.commentaire || "") + " | Admin: " + commentaire;
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        // ✅ NOTIFICATION PASSAGER (PERSISTANTE + TEMPS RÉEL)
        try {
            const Notification = require("../../models/Notifications");
            const labels = { 'COMPLETE': 'validée', 'ANNULE': 'annulée', 'ECHOUE': 'échouée' };
            const typeLabel = transaction.type === "RETRAIT" ? "retrait" : "dépôt";
            const msg = `Votre demande de ${typeLabel} de ${transaction.montant.toLocaleString()} GNF a été ${labels[statut] || 'traitée'}.`;

            // Enregistrement en base de données
            await Notification.create({
                utilisateur: transaction.utilisateur,
                message: msg
            });

            // Émission temps réel (Socket.io)
            if (global.io) {
                const userRoom = `USER_${transaction.utilisateur}`;
                global.io.to(userRoom).emit("wallet:status_update", {
                    transactionId: transaction._id,
                    type: transaction.type,
                    statut: statut,
                    message: msg
                });
            }
        } catch (notifErr) {
            console.error("⚠️ Erreur notification passager:", notifErr.message);
        }

        res.status(200).json({ 
            succes: true, 
            message: `Transaction mise à jour : ${statut}`,
            transaction
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ succes: false, message: error.message });
    }
};
