const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true, trim: true },
        prenom: { type: String, required: true, trim: true },

        telephone: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        motDePasse: { type: String, required: true },
        passwordChangedAt: {
            type: Date,
            default: null,
        },

        role: {
            type: String,
            enum: ["PASSAGER", "CHAUFFEUR", "ADMIN"],
            default: "PASSAGER",
        },

        genre: {
            type: String,
            enum: ["MASCULIN", "FEMININ"],
            default: "MASCULIN",
        },

        statut: {
            type: String,
            enum: ["ACTIF", "INACTIF", "SUSPENDU"],
            default: "ACTIF",
        },

        photoUrl: String,
        badges: { type: [String], default: [] },

        nombreTrajets: {
            type: Number,
            default: 0,
        },

        //* ============ CHAUFFEUR ONLY ============

        estEnLigne: {
            type: Boolean,
            default: false,
        },

        socketId: {
            type: String,
            default: null,
        },

        position: {
            lat: Number,
            lng: Number,
        },

        vehicule: {
            type: {
                type: String,
                enum: ["MOTO", "TAXI", "VOITURE", "BUS"],
            },
            places: {
                type: Number,
                default: 1,
            },
        },

        trajetEnCours: {
            type: Boolean,
            default: false,
        },

        noteMoyenne: {
            type: Number,
            default: 5,
        },

        nombreEvaluations: {
            type: Number,
            default: 0,
        },

        //* ============ NOTIFICATIONS ============

        notifications: {
            trajet: { type: Boolean, default: true },
            promotionnelles: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Utilisateurs", utilisateurSchema);
