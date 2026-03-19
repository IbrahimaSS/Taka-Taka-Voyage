const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        utilisateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: false,
        },
        nomUtilisateur: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["PASSAGER", "CHAUFFEUR", "ADMIN", "SUPERVISEUR", "AGENT", "ANALYSTE", "SYSTEME", "VISITEUR"],
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        module: {
            type: String,
            enum: ["AUTH", "UTILISATEURS", "TRANSPORT", "PAIEMENT", "SYSTEME", "MAINTENANCE", "SUPPORT"],
            required: true,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ip: {
            type: String,
        },
        navigateur: {
            type: String,
        },
        statut: {
            type: String,
            enum: ["REUSSI", "ECHOUE"],
            default: "REUSSI",
        },
        estSuspect: {
            type: Boolean,
            default: false,
        },
        messageAlerte: {
            type: String,
        },
    },
    { timestamps: true }
);

// Index pour la recherche rapide et le filtrage
activityLogSchema.index({ nomUtilisateur: "text", action: "text" });
activityLogSchema.index({ role: 1, module: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
