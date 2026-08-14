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

        // Temps total passé en ligne (en millisecondes)
        tempsEnLigneCumule: {
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

// Suppression en cascade : sans ça, les documents (collection Document) d'un
// chauffeur supprimé restent orphelins en base indéfiniment (constaté lors d'un
// audit — des ChauffeurProfile supprimés manuellement avaient laissé des Document
// sans aucun profil à rattacher). Couvre les deux façons habituelles de supprimer
// dans ce projet : findByIdAndDelete/findOneAndDelete, et deleteMany en masse.
// Mongoose 9 : middleware asynchrone sans callback "next" (on retourne une
// promesse, elle est automatiquement attendue avant de poursuivre la suppression).
chauffeurProfileSchema.pre("findOneAndDelete", async function () {
    const profile = await this.model.findOne(this.getQuery()).select("_id");
    if (profile) {
        await mongoose.model("Document").deleteMany({ chauffeur: profile._id });
    }
});

chauffeurProfileSchema.pre("deleteMany", async function () {
    const profiles = await this.model.find(this.getQuery()).select("_id");
    if (profiles.length > 0) {
        await mongoose.model("Document").deleteMany({ chauffeur: { $in: profiles.map((p) => p._id) } });
    }
});

module.exports = mongoose.model("ChauffeurProfile", chauffeurProfileSchema);
