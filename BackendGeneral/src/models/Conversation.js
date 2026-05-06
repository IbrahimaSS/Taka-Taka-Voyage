const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
      },
    ],
    dernierMessage: {
      type: String,
      default: "",
    },
    dateDernierMessage: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexer pour trouver rapidement les conversations d'un utilisateur
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
