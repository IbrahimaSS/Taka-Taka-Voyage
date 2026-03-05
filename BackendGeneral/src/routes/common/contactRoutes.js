const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/common/contactControllers");

/**
 * @swagger
 * /api/common/contact:
 *   post:
 *     summary: Envoyer un message via le formulaire de contact
 *     tags: [0 - Common]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 */
router.post("/contact", contactController.submitContactForm);

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");

/**
 * @swagger
 * /api/common/contact/settings:
 *   get:
 *     summary: Récupérer les informations de contact plateforme
 *     tags: [0 - Common]
 */
router.get("/contact/settings", contactController.getContactSettings);

/**
 * @swagger
 * /api/common/contact/reply:
 *   post:
 *     summary: Répondre à un message de contact (Admin uniquement)
 *     tags: [0 - Common]
 *     security:
 *       - bearerAuth: []
 */
router.post("/contact/reply", verifierToken, autoriserRoles("ADMIN"), contactController.replyContactForm);

module.exports = router;
