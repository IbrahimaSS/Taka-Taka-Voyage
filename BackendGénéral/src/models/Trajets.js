const mongoose = require("mongoose");

const trajetSchema = new mongoose.Schema(
    {
        // Lien avec la réservation d’origine
        reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true,
        unique: true,
        },

        passager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        },

        chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        default: null,
        },

        depart: {
        type: String,
        required: true,
        trim: true,
        },

        destination: {
        type: String,
        required: true,
        trim: true,
        },

        distanceKm: {
        type: Number,
        required: true,
        min: 0,
        },

        dureeMin: {
        type: Number,
        required: true,
        min: 0,
        },

        prix: {
        type: Number,
        required: true,
        },

        statut: {
        type: String,
        enum: ["EN_COURS", "TERMINEE"],
        required: true,
        },

        dateDebut: {
        type: Date,
        default: null,
        },

        dateFin: {
        type: Date,
        default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Trajet", trajetSchema);
