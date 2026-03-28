const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { peuplerUtilisateur, verifierToken } = require("../middlewares/authMiddlewares");

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
router.post("/chat", peuplerUtilisateur, aiController.chat);

/**
 * @swagger
 * /api/ai/validate:
 *   post:
 *     summary: Valider si une action IA peut être exécutée
 *     description: Vérifie les conditions métier avant l'exécution d'une action par l'agent IA.
 *     tags: [5 - Autres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: Le nom de l'action à valider.
 *                 example: demarrer_trajet
 *     responses:
 *       200:
 *         description: Résultat de la validation.
 *       401:
 *         description: Non authentifié.
 */
router.post("/validate", peuplerUtilisateur, aiController.validateAction);

/**
 * @swagger
 * /api/ai/execute:
 *   post:
 *     summary: Exécuter une action IA avec Payload
 *     description: "Finalise l'exécution en base de données via le chatbot (ex: Réservations)."
 *     tags: [5 - Autres]
 *     security:
 *       - bearerAuth: []
 */
router.post("/execute", verifierToken, aiController.executeAction);

module.exports = router;

