const mongoose = require("mongoose");

const rapportSchema = new mongoose.Schema(
    {
        // Nom affiché
        titre: {
        type: String,
        required: true
        },
        // Type affiché (badge)
        type: {
        type: String,
        enum: [
            "FINANCIER",
            "UTILISATEURS",
            "TRAJETS",
            "PERFORMANCE",
            "SECURITE"
        ],
        required: true
        },
        // Format du fichier
        format: {
        type: String,
        enum: ["PDF", "CSV", "EXCEL", "WORD"],
        required: true
        },
        // Statut du rapport
        statut: {
        type: String,
        enum: ["GENERE", "EN_ATTENTE", "EN_COURS", "ECHOUE"],
        default: "EN_ATTENTE"
        },
        // Période couverte par le rapport
        periode: {
        debut: Date,
        fin: Date
        },
        // Audit
        generePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs"
        },
        nombreTelechargements: {
        type: Number,
        default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Rapport", rapportSchema);
