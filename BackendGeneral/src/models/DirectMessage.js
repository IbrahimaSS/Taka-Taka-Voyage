const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    expediteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateurs",
      required: true,
    },
    destinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilisateurs",
      required: true,
    },
    contenu: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["TEXTE", "VOCAL", "IMAGE", "VIDEO", "CALL_INVITE"],
      default: "TEXTE",
    },
    mediaUrl: String,
    lu: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DirectMessage", directMessageSchema);
