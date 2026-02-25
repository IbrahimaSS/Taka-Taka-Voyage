const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const {
    changePassword,
} = require("../../controllers/admin/securityControllers");

/**
 * @swagger
 * /api/admin/security/password:
 *   put:
 *     summary: Changer le mot de passe de l'administrateur
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 */
router.put("/password", verifierToken, changePassword);

module.exports = router;