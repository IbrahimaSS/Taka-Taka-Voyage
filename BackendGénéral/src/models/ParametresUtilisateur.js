// src/models/ParametresUtilisateur.js
const mongoose = require("mongoose");

const parametresUtilisateurSchema = new mongoose.Schema(
    {
        utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        unique: true,
        },

        /* ===================== */
        /* NOTIFICATIONS         */
        /* ===================== */
        notifications: {
        trajet: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        },

        /* ===================== */
        /* CONFIDENTIALITÉ       */
        /* ===================== */
        confidentialite: {
        profilPublic: { type: Boolean, default: true },
        partagePosition: { type: Boolean, default: true },
        historiqueAnonyme: { type: Boolean, default: false },
        },

        /* ===================== */
        /* PRÉFÉRENCES TRAJET    */
        /* ===================== */
        preferencesTrajet: {
        typeVehicule: {
            type: String,
            enum: ["TAXI", "MOTO", "VOITURE_PRIVEE"],
            default: "TAXI",
        },
        langue: {
            type: String,
            enum: ["FR", "EN"],
            default: "FR",
        },
        paiementParDefaut: {
            type: String,
            enum: ["CASH", "MTN_MONEY", "ORANGE_MONEY"],
            default: "CASH",
        },
        contactPrefere: {
            type: String,
            enum: ["APPEL", "MESSAGE", "APPEL_UNIQUEMENT"],
            default: "APPEL",
        },
        },
    },
    { timestamps: true }
    );

    module.exports = mongoose.model(
    "ParametresUtilisateur",
    parametresUtilisateurSchema
);
