const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    auteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateurs",
      required: true,
    },
    contenu: {
      type: String,
      required: true,
      trim: true,
    },
    typeMedia: {
      type: String,
      enum: ["TEXTE", "VOCAL", "IMAGE", "VIDEO"],
      default: "TEXTE",
    },
    mediaUrl: {
      type: String, // URL vers Cloudinary ou autre stockage
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
      },
    ],
    nombreCommentaires: {
      type: Number,
      default: 0,
    },
    statut: {
      type: String,
      enum: ["ACTIF", "MODERE", "SUPPRIME"],
      default: "ACTIF",
    },
  },
  { timestamps: true }
);

// Indexer pour la recherche par tags
postSchema.index({ tags: 1 });
// Indexer pour le tri par date
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
