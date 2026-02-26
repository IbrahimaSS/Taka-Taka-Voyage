const express = require("express");
const router = express.Router();
const { listerFaq } = require("../../controllers/support/faqControllers");

/**
 * @swagger
 * /api/passagers/faq:
 *   get:
 *     summary: Lister les FAQs
 *     description: Récupérer la liste des questions fréquemment posées.
 *     tags: [3 - Passagers]
 *     responses:
 *       200:
 *         description: Liste des FAQ récupérée avec succès.
 */
router.get("/faq", listerFaq);

module.exports = router;