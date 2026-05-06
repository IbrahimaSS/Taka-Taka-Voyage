const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "DEPOT",            // Recharge (Cash-in)
                "RETRAIT",          // Cash-out vers OM/MTN
                "TRANSFERT_ENVOI",  // Envoi d'argent à un ami
                "TRANSFERT_RECU",   // Réception d'argent d'un ami
                "PAIEMENT_TRAJET",  // Paiement d'une course
                "PAIEMENT_LOCATION", // Paiement des frais de location de véhicule
                "REMBOURSEMENT",    // Retour d'argent suite annulation
                "REMBOURSEMENT_LOCATION", // Remboursement complet (Caution + Location)
                "COMMISSION",       // Prélèvement plateforme
                "COMPENSATION",      // Compensation chauffeur (frais annulation)
                "VERSEMENT",        // Déversement de la plateforme au chauffeur
                "GAIN",             // Gain direct d'une course
                "CAUTION_LOCATION"  // Blocage/Sécurisation de caution
            ],
            required: true,
        },
        montant: {
            type: Number,
            required: true,
        },
        devise: {
            type: String,
            default: "GNF",
        },
        statut: {
            type: String,
            enum: ["EN_ATTENTE", "COMPLETE", "ECHOUE", "ANNULE"],
            default: "EN_ATTENTE",
        },
        methode: {
            type: String,
            enum: ["ORANGE_MONEY", "MTN_MONEY", "WALLET", "CASH", "CARD"],
            required: true,
        },
        reference: {
            type: String, // ID de transaction Orange, MTN ou Stripe
            unique: true,
            sparse: true,
        },
        destinataire: {
            type: mongoose.Schema.Types.ObjectId, // Si transfert P2P
            ref: "Utilisateurs",
        },
        expediteur: {
            type: mongoose.Schema.Types.ObjectId, // Si transfert P2P
            ref: "Utilisateurs",
        },
        commentaire: String,
        metadata: {
            reservationId: mongoose.Schema.Types.ObjectId,
            trajetId: mongoose.Schema.Types.ObjectId,
            paiementId: mongoose.Schema.Types.ObjectId
        },
    },
    { timestamps: true }
);

// Indexation pour la rapidité des recherches d'historique
transactionSchema.index({ utilisateur: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ statut: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
