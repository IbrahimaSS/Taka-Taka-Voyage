const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
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

        depart: { type: String, required: true },
        destination: { type: String, required: true },

        distanceKm: { type: Number, required: true },
        dureeMin: { type: Number, required: true },

        typeVehicule: {
        type: String,
        enum: ["MOTO", "TAXI", "VOITURE", "BUS"],
        required: true,
        },

        prix: { type: Number, required: true },

        statut: {
        type: String,
        enum: [
            "EN_ATTENTE",
            "ACCEPTEE",
            "ASSIGNEE",
            "EN_COURS",
            "TERMINEE",
            "ANNULEE",
        ],
        default: "EN_ATTENTE",
        },

        typeCourse: {
        type: String,
        enum: ["IMMEDIATE", "PLANIFIEE"],
        default: "IMMEDIATE",
        },

        datePlanifiee: {
        type: Date,
        default: null,
        },

        // suivi réel du trajet
        dateDebut: {
        type: Date,
        default: null,
        },

        dateFin: {
        type: Date,
        default: null,
        },

        // annulation
        annuleeLe: Date,
        annuleePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        },

        // snapshot paiement
        paiement: {
            statut: {
                type: String,
                enum: ["EN_ATTENTE", "PAYE", "ECHEC"],
            },
            methode: {
                type: String,
                enum: ["CASH", "ORANGE_MONEY", "MTN_MONEY"],
            },
        },

        // Pour la phase d'attribution
        offresEnvoyees: [{
            chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateurs' },
            envoyeeA: { type: Date, default: Date.now },
            statut: {
                type: String,
                enum: ['ENVOYEE', 'ACCEPTEE', 'REFUSEE', 'EXPIREE'],
                default: 'ENVOYEE'
            },
            expireLe: { type: Date },           // Date d'expiration de cette offre
            tempsReponseMs: Number,             // combien de temps a pris la réponse
            }],

            derniereOffreExpireeLe: Date,
            nbToursAttribution: { type: Number, default: 0 },   // si > 1 → augmentation prix possible
        },
    { timestamps: true }
);

// index utiles
reservationSchema.index({ passager: 1, createdAt: -1 });
reservationSchema.index({ chauffeur: 1, statut: 1 });
reservationSchema.index({ datePlanifiee: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
