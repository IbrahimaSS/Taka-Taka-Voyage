const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Le code promotionnel est obligatoire"],
            unique: true,
            trim: true,
            uppercase: true,
            minlength: [3, "Le code doit contenir au moins 3 caractères"]
        },
        typeReduction: {
            type: String,
            enum: ["POURCENTAGE", "MONTANT_FIXE"],
            required: [true, "Le type de réduction est obligatoire"]
        },
        valeur: {
            type: Number,
            required: [true, "La valeur de la réduction est obligatoire"],
            min: [1, "La valeur doit être supérieure à 0"]
        },
        dateExpiration: {
            type: Date,
            required: [true, "La date d'expiration est obligatoire"]
        },
        limiteUtilisationsGlobales: {
            type: Number,
            default: null, // Null = Illimité
            min: [1, "La limite doit être d'au moins 1"]
        },
        utilisationsActuelles: {
            type: Number,
            default: 0
        },
        limiteParUtilisateur: {
            type: Number,
            default: 1 // On empêche par défaut un passager d'utiliser le même code 10 fois
        },
        statut: {
            type: String,
            enum: ["ACTIF", "EXPIRE", "INACTIF"],
            default: "ACTIF"
        },
        conditions: {
            montantMinimumCourse: {
                type: Number,
                default: 0
            },
            typeCourseRestreint: {
                type: String,
                enum: ["TOUS", "TAXI_PARTAGE", "COURSE_IMMEDIATE", "RESERVATION"],
                default: "TOUS"
            }
        },
        // Pour garder une trace de ceux qui l'ont utilisé
        utilisateursHistorique: [{
            utilisateurId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Utilisateurs"
            },
            dateUtilisation: {
                type: Date,
                default: Date.now
            }
        }],
        creePar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs" // L'admin qui a créé le coupon
        }
    },
    { timestamps: true }
);

// Middleware pour mettre à jour automatiquement le statut à EXPIRE si la date est passée
couponSchema.pre("save", async function() {
    if (this.dateExpiration && this.dateExpiration < new Date() && this.statut === "ACTIF") {
        this.statut = "EXPIRE";
    }
});

// Index pour recherche rapide
couponSchema.index({ code: 1 });
couponSchema.index({ statut: 1, dateExpiration: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
