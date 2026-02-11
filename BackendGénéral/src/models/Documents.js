const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        // Chauffeur concerné
        chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChauffeurProfile",
        required: true,
        },

        // Type de document
        type: {
        type: String,
        enum: ["PERMIS", "ASSURANCE", "CARTE_GRISE", "IDENTITE", "PHOTO_VEHICULE"],
        required: true,
        },

        // Fichier (URL ou path)
        fichier: {
        type: String,
        required: true,
        },

        // Statut admin
        statut: {
        type: String,
        enum: ["VERIFIER", "VALIDE", "REFUSE"],
        default: "VERIFIER",
        },

        // Date d’expiration (optionnelle)
        dateExpiration: {
        type: Date,
        },

        // Commentaire admin (optionnel)
        commentaireAdmin: {
        type: String,
        },
    },
    {
        timestamps: true, // createdAt / updatedAt
    }
);

module.exports = mongoose.model("Document", documentSchema);
