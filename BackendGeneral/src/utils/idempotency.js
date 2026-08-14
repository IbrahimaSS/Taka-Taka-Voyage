const UploadIdempotency = require("../models/UploadIdempotency");

// Envoie la réponse HTTP et, si la requête portait une idempotencyKey (voir
// middlewares/checkUploadIdempotency.js), mémorise le résultat pour qu'un retry
// identique (file d'attente hors-ligne mobile) renvoie la même chose sans
// ré-uploader le fichier ni recréer les enregistrements en base.
async function sendIdempotentResponse(req, res, statusCode, payload) {
  if (req.idempotencyKey) {
    try {
      await UploadIdempotency.create({ idempotencyKey: req.idempotencyKey, response: payload });
    } catch (e) {
      // Doublon de clé (deux retries quasi simultanés) : sans conséquence, on
      // renvoie quand même la réponse plutôt que de faire échouer la requête.
      if (e.code !== 11000) console.error("❌ sendIdempotentResponse:", e.message);
    }
  }
  return res.status(statusCode).json(payload);
}

module.exports = { sendIdempotentResponse };
