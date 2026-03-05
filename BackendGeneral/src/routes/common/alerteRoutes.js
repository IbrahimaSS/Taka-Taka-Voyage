const express = require("express");
const router = express.Router();
const alerteControllers = require("../../controllers/common/alerteControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

/**
 * @swagger
 * /api/alertes/log-appel:
 *   post:
 *     summary: Enregistrer un log d'appel vers un service d'urgence
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
 *               service:
 *                 type: string
 *               numero:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Log enregistré
 */
router.post("/log-appel", verifierToken, alerteControllers.logCall);

module.exports = router;
