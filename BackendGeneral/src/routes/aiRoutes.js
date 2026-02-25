const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chatter avec l'assistant IA de Taka-Taka
 *     description: Permet d'interagir avec l'assistant IA de l'application.
 *     tags: [5 - Autres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Le message à envoyer à l'IA.
 *                 example: Bonjour, comment fonctionne l'application ?
 *     responses:
 *       200:
 *         description: Réponse générée par l'IA avec succès.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.post("/chat", aiController.chat);

module.exports = router;
