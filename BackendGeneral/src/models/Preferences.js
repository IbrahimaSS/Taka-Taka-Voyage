const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
    {
        utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        unique: true,
        required: true,
        },

        notifications: {
        trajet: { type: Boolean, default: true },
        promotion: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        },

        confidentialite: {
        profilPublic: { type: Boolean, default: true },
        partagePosition: { type: Boolean, default: false },
        historiqueAnonyme: { type: Boolean, default: false },
        },

        preferencesTrajet: {
        vehiculePrefere: {
            type: String,
            enum: ["Taxi", "Moto", "Voiture"],
            default: "Taxi",
        },
        langue: {
            type: String,
            default: "fr",
        },
        paiementDefaut: {
            type: String,
            enum: ["CASH", "MTN_MONEY", "ORANGE_MONEY"],
            default: "CASH",
        },
        contactPrefere: {
            type: String,
            enum: ["APPEL", "SMS"],
            default: "APPEL",
        },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Preferences", preferencesSchema);
