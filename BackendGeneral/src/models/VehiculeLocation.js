const mongoose = require("mongoose");

const vehiculeLocationSchema = new mongoose.Schema(
  {
    immatriculation: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    marque: { type: String, required: true, trim: true }, // Ex: Toyota
    modele: { type: String, required: true, trim: true }, // Ex: Land Cruiser
    annee: { type: Number },
    categorie: {
      type: String,
      required: true,
      trim: true,
    },

    // --- Propriétaire / Partenaire ---
    partenaire: { type: String, default: "Baraka Trans" },

    // --- Tarification (GNF) ---
    prix_jour: { type: Number, required: true },
    prix_semaine: { type: Number }, // Prix dégressif possible
    prix_mois: { type: Number },    // Prix dégressif possible
    caution: { type: Number, required: true, default: 0 },

    // --- Médias ---
    photos: [{ type: String }], // URLs des images

    // --- Statut ---
    statut: {
      type: String,
      enum: ["DISPONIBLE", "EN_LOCATION", "MAINTENANCE", "RETIRE"],
      default: "DISPONIBLE",
    },

    // --- Caractéristiques techniques ---
    caracteristiques: {
      nb_places: { type: Number, default: 5 },
      climatisation: { type: Boolean, default: true },
      boite_auto: { type: Boolean, default: false },
      type_carburant: {
        type: String,
        enum: ["ESSENCE", "DIESEL", "ÉLECTRIQUE", "HYBRIDE"],
        default: "DIESEL",
      },
      consommation: { type: String }, // Ex: 8L/100km
    },

    // --- Documents & Maintenance ---
    documents: {
        assurance_expire: { type: Date },
        visite_technique_expire: { type: Date },
        derniere_revision: { type: Date },
    },

    note_moyenne: { type: Number, default: 5 },
    nb_locations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehiculeLocation", vehiculeLocationSchema);
