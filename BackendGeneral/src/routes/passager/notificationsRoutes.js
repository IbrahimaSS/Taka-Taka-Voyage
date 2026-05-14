const express = require("express");
const router = express.Router();

const { updateNotifications, getNotifications } = require("../../controllers/passager/notificationsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/passager/notifications:
 *   put:
 *     summary: Mettre à jour les préférences de notifications du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Préférences mises à jour
 */
// Paramètres de notifications
router.put(
    "/notifications",
    verifierToken,
    verifierStatutActif,
    updateNotifications
);

/**
 * @desc    Récupérer les notifications du passager
 * @route   GET /api/passager/notifications
 */
router.get(
    "/notifications",
    verifierToken,
    verifierStatutActif,
    getNotifications
);

module.exports = router;
