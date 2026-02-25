const express = require("express");
const router = express.Router();
const litigeController = require("../../controllers/admin/litigeControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

// CRÉER UN LITIGE
// Accessible par Passager et Chauffeur

/**
 * @swagger
 * /api/litiges:
 *   post:
 *     summary: Créer un nouveau litige (signalement)
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
 *               trajetId:
 *                 type: string
 *               typeLitige:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Litige créé avec succès
 */
router.post("/", verifierToken, litigeController.creerLitige);

module.exports = router;
