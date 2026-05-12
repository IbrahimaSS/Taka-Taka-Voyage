const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
    },
    categorie: {
      type: String,
      enum: ["PASSAGER", "CHAUFFEUR", "ETUDE", "FAQ", "LEGAL"],
      required: [true, "La catégorie est requise"],
    },
    fichierUrl: {
      type: String,
      required: [true, "Le fichier est requis"],
    },
    fichierPublicId: {
      type: String,
      default: null,
    },
    icone: {
      type: String,
      default: "FileText",
    },
    ordre: {
      type: Number,
      default: 0,
    },
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour tri et filtrage rapide
guideSchema.index({ categorie: 1, ordre: 1 });
guideSchema.index({ actif: 1 });

module.exports = mongoose.model("Guide", guideSchema);
