const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
    {
        utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        },
        nom: String,
        prenom: String,

        sujet: {
        type: String,
        required: true,
        trim: true,
        },
        message: {
        type: String,
        required: true,
        trim: true,
        },

        canal: {
        type: String,
        enum: ["APP", "CHAT", "EMAIL"],
        default: "APP",
        },

        reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        default: null,
        },

        piecesJointes: [
        {
            type: String,
        },
        ],

        statut: {
        type: String,
        enum: ["OUVERT", "EN_COURS", "FERME"],
        default: "OUVERT",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Support", supportSchema);
