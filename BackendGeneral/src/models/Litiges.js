const mongoose = require("mongoose");

const litigeSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            unique: true
        },

        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: false // Peut être null si c'est un contact général sans trajet précis
        },

        passager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true
        },

        type: {
            type: String,
            enum: [
                "PAIEMENT",
                "COMPORTEMENT",
                "TRAJET",
                "ACCIDENT",
                "AGRESSION",
                "URGENCE_MEDICALE",
                "DANGER",
                "AUTRE"
            ],
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        statut: {
            type: String,
            enum: ["OUVERT", "REJETER", "EN_COURS", "RESOLU"],
            default: "OUVERT"
        },

        piecesJointes: [String]

    },
    { timestamps: true }
);

module.exports = mongoose.model("Litige", litigeSchema);
