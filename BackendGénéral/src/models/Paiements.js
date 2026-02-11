const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema(
    {
        reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true,
        unique: true, // 1 paiement par trajet
        },

        passager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        },

        chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        },

        montantTotal: {
        type: Number,
        required: true,
        },

        commissionPlateforme: {
        type: Number,
        required: true,
        },

        montantChauffeur: {
        type: Number,
        required: true,
        },

        statut: {
        type: String,
        enum: ["EN_ATTENTE", "PAYE", "ANNULE"],
        default: "EN_ATTENTE",
        },

        methode: {
        type: String,
        enum: ["CASH", "MTN_MONEY", "ORANGE_MONEY"],
        required: true,
        },

        // Versement chauffeur (back‑office / comptabilité)
        verse: {
        type: Boolean,
        default: false,
        },

        verseLe: {
        type: Date,
        default: null,
        },

        versePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        default: null,
        },

        commentaireVersement: {
        type: String,
        default: null,
        },
    },
    { timestamps: true }
);

// Index utiles
paiementSchema.index({ chauffeur: 1 });
paiementSchema.index({ statut: 1 });

module.exports = mongoose.model("Paiement", paiementSchema);
