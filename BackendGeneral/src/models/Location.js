const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true,
      required: true,
    },

    // --- Les parties concernées ---
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateurs",
      required: true,
    },
    vehicule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehiculeLocation",
      required: true,
    },
    chauffeur_assigne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateurs",
      default: null, // Si location sans chauffeur
    },

    // --- Détails du contrat ---
    type_usage: {
      type: String,
      enum: ["PERSONNEL", "PRIVÉ_AVEC_CHAUFFEUR", "INVESTISSEUR_B2B", "LEASING_TRAVAIL"],
      default: "PERSONNEL",
    },

    date_debut: { type: Date, required: true },
    date_fin_prevue: { type: Date, required: true },
    date_retour_reelle: { type: Date, default: null },

    statut: {
      type: String,
      enum: [
        "EN_ATTENTE", // Demande soumise
        "APPROUVÉE",  // Validée par l'admin
        "EN_COURS",   // Véhicule récupéré
        "RETOUR_SIGNALÉ", // Client a fini
        "TERMINÉE",   // Véhicule rendu
        "ANNULÉE",    // Location annulée
        "LITIGE",     // Problème constaté au retour
      ],
      default: "EN_ATTENTE",
    },

    // --- Finances (GNF) ---
    montant_total: { type: Number, required: true },
    caution_bloquee: { type: Number, required: true },
    commission_plateforme: { type: Number, default: 0 },

    statut_paiement: {
      type: String,
      enum: ["EN_ATTENTE", "PAYÉ", "REMBOURSÉ", "IMPAYÉ"],
      default: "EN_ATTENTE",
    },

    // --- État des lieux (Check-in / Check-out) ---
    etat_depart: {
      km: { type: Number },
      carburant: { type: String }, // Ex: 100%, 75%, 50%
      observations: { type: String },
    },
    etat_retour: {
      km: { type: Number },
      carburant: { type: String },
      observations: { type: String },
      montant_degats: { type: Number, default: 0 },
    },

    notes_admin: { type: String },
  },
  { timestamps: true }
);

// La référence est maintenant gérée directement dans le contrôleur pour plus de sécurité

module.exports = mongoose.model("Location", locationSchema);
