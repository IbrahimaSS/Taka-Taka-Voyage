const mongoose = require("mongoose");

// Mémorise le résultat d'une requête d'upload identifiée par une clé d'idempotence
// (générée côté client, ex. par la file d'attente hors-ligne mobile). Un retry réseau
// qui renvoie la même clé récupère la réponse déjà produite au lieu de recréer les
// documents/photos en base.
const uploadIdempotencySchema = new mongoose.Schema(
  {
    idempotencyKey: { type: String, required: true, unique: true },
    response: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Une clé n'a besoin d'être conservée que le temps que les retries mobiles puissent
// survenir (file d'attente + backoff) — 7 jours est largement suffisant, purge automatique.
uploadIdempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model("UploadIdempotency", uploadIdempotencySchema);
