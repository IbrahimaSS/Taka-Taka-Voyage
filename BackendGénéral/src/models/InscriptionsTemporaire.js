//remplace le model initiInscription par sa :
const mongoose = require("mongoose");

const inscriptionTemporaireSchema = new mongoose.Schema(
  {
    nom: { type: String, trim: true, default: "" },
    prenom: { type: String, trim: true, default: "" },

    telephone: { type: String, required: true, trim: true, index: true, unique: true },
    email: { type: String, trim: true, lowercase: true, default: "" },

    motDePasse: { type: String, required: true }, // tu le stockes temporairement, OK (voir note sécurité)
    typeProfil: { type: String, trim: true, default: "" },
    genre: { type: String, trim: true, default: "" },

    otpVerifie: { type: Boolean, default: false },

    // IMPORTANT: date d’expiration
    expireA: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

/**
 * TTL index: Mongo supprimera automatiquement le document
 * quand expireA est dépassé.
 * expireAfterSeconds: 0 => suppression à expireA
 */
inscriptionTemporaireSchema.index({ expireA: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("InscriptionTemporaire", inscriptionTemporaireSchema);