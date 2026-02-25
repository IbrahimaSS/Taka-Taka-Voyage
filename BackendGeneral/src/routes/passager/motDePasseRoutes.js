const express = require("express");
const router = express.Router();

const { changerMotDePasse } = require("../../controllers/passager/motDePasseControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

/**
 * @swagger
 * /api/passagers/mot-de-passe:
 *   put:
 *     summary: Changer le mot de passe du passager
 *     description: Permet à un passager de changer son mot de passe actuel.
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
 *               ancienMotDePasse:
 *                 type: string
 *               nouveauMotDePasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès.
 *       400:
 *         description: Mauvaise requête.
 *       401:
 *         description: Non autorisé.
 */
router.put(
    "/mot-de-passe",
    verifierToken,
    verifierStatutActif,
    changerMotDePasse
);

module.exports = router;
