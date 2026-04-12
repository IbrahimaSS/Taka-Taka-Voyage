const mongoose = require("mongoose");

/**
 * Modèle pour les Tickets de réservation (Reçus QR)
 * Un ticket est généré automatiquement dès qu'un chauffeur accepte une course.
 */
const ticketSchema = new mongoose.Schema(
    {
        // Identification
        reservation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reservation",
            required: true,
            unique: true, // Un seul ticket par réservation
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

        // Sécurité & QR
        codeUnique: {
            type: String,
            required: true,
            unique: true, // Code UUID unique
        },
        qrCodeBase64: {
            type: String, // Stockage de l'image en base64
            required: true,
        },

        // Snapshot du trajet (conserve les infos même si la résa est modifiée)
        depart: String,
        destination: String,
        distanceKm: Number,
        dureeMin: Number,
        prix: {
            type: Number,
            required: true,
        },
        devise: {
            type: String,
            default: "GNF",
        },
        methodePaiement: String,

        // Infos véhicule au moment de la course
        vehicule: {
            marque: String,
            modele: String,
            immatriculation: String,
            couleur: String,
        },

        // État du ticket
        statut: {
            type: String,
            enum: ["GENERE", "SCANNE", "VALIDE", "EXPIRE", "ANNULE"],
            default: "GENERE",
        },

        scanneLe: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Indexation pour la performance des listes (Profil passager)
ticketSchema.index({ passager: 1, createdAt: -1 });
ticketSchema.index({ codeUnique: 1 });
ticketSchema.index({ reservation: 1 });

module.exports = mongoose.model("Ticket", ticketSchema);
