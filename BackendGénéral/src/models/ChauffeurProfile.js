const mongoose = require("mongoose");

const chauffeurProfileSchema = new mongoose.Schema(
    {
        // Lien utilisateur
        utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true,
        unique: true,
        index: true,
        },

        // Statut ADMIN
        statut: {
        type: String,
        enum: ["EN_ATTENTE", "ACTIF", "INACTIF", "SUSPENDU"],
        default: "EN_ATTENTE",
        index: true,
        },

        // Disponibilité chauffeur
        disponibilite: {
        type: String,
        enum: ["EN_LIGNE", "HORS_LIGNE", "OCCUPE"],
        default: "HORS_LIGNE",
        index: true,
        },

        // Depuis quand il est en ligne
        disponibiliteDepuis: {
        type: Date,
        default: null,
        },

        // Véhicule
        typeVehicule: {
        type: String,
        enum: ["MOTO", "VOITURE", "TAXI_PARTAGE"],
        required: true,
        },

        marqueVehicule: { type: String, trim: true },
        modeleVehicule: { type: String, trim: true },
        plaque: { type: String, trim: true, uppercase: true },
        couleurVehicule: String,
        anneeVehicule: Number,
        capaciteVehicule: Number,

        // Documents (paths ou URLs)
        permisConduire: String,
        carteGrise: String,
        assurance: String,
        photoVehicule: String,
        pieceIdentite: String,

        // Statistiques globales
        nombreTrajets: {
        type: Number,
        default: 0,
        },

        totalRevenus: {
        type: Number,
        default: 0,
        },

        noteMoyenne: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        },

        nombreEvaluations: {
        type: Number,
        default: 0,
        },

        // Validation ADMIN
        validePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        default: null,
        },

        valideLe: {
        type: Date,
        default: null,
        },

        motifRefus: {
        type: String,
        default: null,
        },

        commentaireValidation: {
        type: String,
        default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ChauffeurProfile", chauffeurProfileSchema);
