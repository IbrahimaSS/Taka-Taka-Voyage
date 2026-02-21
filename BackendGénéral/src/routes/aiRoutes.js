const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

/**
 * @route   POST /api/ai/chat
 * @desc    Chatter avec l'assistant IA de Taka-Taka
 * @access  Public (ou Authentifié selon vos besoins)
 */
router.post("/chat", aiController.chat);

module.exports = router;
