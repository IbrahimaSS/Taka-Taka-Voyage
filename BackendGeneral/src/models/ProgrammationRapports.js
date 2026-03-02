const mongoose = require("mongoose");

const programmationRapportSchema = new mongoose.Schema(
    {
        titre: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["FINANCIER", "UTILISATEURS", "TRAJETS", "PERFORMANCE", "SECURITE"],
            required: true
        },
        frequence: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            required: true
        },
        format: {
            type: String,
            enum: ["PDF", "CSV", "EXCEL", "WORD"],
            required: true
        },
        destinataires: [{
            type: String,
            required: true
        }],
        statut: {
            type: String,
            enum: ["active", "desactive"],
            default: "active"
        },
        prochaineExecution: {
            type: Date
        },
        derniereExecution: {
            type: Date
        },
        creePar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProgrammationRapport", programmationRapportSchema);
