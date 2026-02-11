const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
    {
        reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true,
        unique: true, // UNE SEULE NOTATION PAR TRAJET
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

        noteGlobale: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        },

        details: {
        conduite: { type: Number, min: 1, max: 5 },
        ponctualite: { type: Number, min: 1, max: 5 },
        proprete: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        },

        ressenti: {
        type: String,
        enum: ["EXCELLENT", "TRES_BIEN", "CORRECT", "MEDIOCRE"],
        default: null,
        },

        pointsForts: [
        {
            type: String,
            enum: [
            "CONDUITE_FLUIDE",
            "VEHICULE_PROPRE",
            "TRES_PONCTUEL",
            "SERVICE_COURTOIS",
            "PRIX_JUSTE",
            ],
        },
        ],

        commentaire: {
        type: String,
        default: null,
        },
    },
    { timestamps: true }
);

// Index pour stats & moyennes chauffeur
evaluationSchema.index({ chauffeur: 1 });

module.exports = mongoose.model("Evaluation", evaluationSchema);
