const mongoose = require("mongoose");

const personnelSchema = new mongoose.Schema(
    {
        nom: {
        type: String,
        required: true,
        trim: true,
        },
        prenom: {
        type: String,
        required: true,
        trim: true,
        },
        email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        },
        telephone: {
        type: String,
        unique: true,
        sparse: true,
        },

        role: {
        type: String,
        enum: ["ADMIN", "SUPERVISEUR", "AGENT", "ANALYSTE"],
        required: true,
        },

        permissions: {
        lecture: { type: Boolean, default: true },
        edition: { type: Boolean, default: false },
        creation: { type: Boolean, default: false },
        suppression: { type: Boolean, default: false },
        gestionUtilisateurs: { type: Boolean, default: false },
        },

        photoProfil: {
        type: String,
        default: null,
        },

        statut: {
        type: String,
        enum: ["ACTIF", "INACTIF"],
        default: "ACTIF",
        },

        password: {
        type: String,
        required: true,
        select: false,
        },

        creePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs", // admin créateur
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Personnels", personnelSchema);
