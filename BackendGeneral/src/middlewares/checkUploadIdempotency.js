const UploadIdempotency = require("../models/UploadIdempotency");

// Si la requête porte une idempotencyKey déjà traitée avec succès (retry de la file
// d'attente mobile après une coupure réseau), renvoie directement la réponse déjà
// produite au lieu de relancer l'upload — évite les doublons en base et sur Cloudinary.
//
// Placé AVANT le middleware Multer dans la chaîne de route : si la clé est connue, on
// court-circuite avant même que le fichier ne soit envoyé à Cloudinary.
async function checkUploadIdempotency(req, res, next) {
  const key = req.query.idempotencyKey;
  if (!key) return next(); // pas de clé fournie : comportement inchangé (rétro-compatible)

  try {
    const existing = await UploadIdempotency.findOne({ idempotencyKey: key });
    if (existing) {
      return res.json(existing.response);
    }
    req.idempotencyKey = key;
    next();
  } catch (e) {
    console.error("❌ checkUploadIdempotency:", e.message);
    next(); // panne technique du contrôle d'idempotence : on n'empêche pas l'upload pour autant
  }
}

module.exports = { checkUploadIdempotency };
