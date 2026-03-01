const express = require("express");
const router = express.Router();

const {
    getProfil,
    updateProfil,
    updatePreferences,
    getStats,
} = require("../../controllers/passager/profileControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const uploadPhoto = require("../../middlewares/uploadPhoto");

/**
 * @swagger
 * /api/passagers/profil:
 *   get:
 *     summary: Récupérer le profil du passager
 *     description: Renvoie les détails du profil du passager actuellement connecté.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré.
 *       401:
 *         description: Non autorisé.
 */
router.get(
    "/profil",
    verifierToken,
    verifierStatutActif,
    getProfil
);

/**
 * @swagger
 * /api/passagers/profil:
 *   put:
 *     summary: Modifier le profil du passager
 *     description: Permet au passager de modifier ses informations de profil, incluant sa photo.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 format: binary
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour.
 *       401:
 *         description: Non autorisé.
 */
router.put(
    "/profil",
    verifierToken,
    verifierStatutActif,
    uploadPhoto.single("photoUrl"),
    updateProfil
);

/**
 * @swagger
 * /api/passagers/preferences:
 *   put:
 *     summary: Modifier les préférences
 *     description: Mettre à jour les préférences de l'utilisateur passager.
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
 *               langue:
 *                 type: string
 *               notifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Préférences mises à jour avec succès.
 *       401:
 *         description: Non autorisé.
 */
router.put(
    "/preferences",
    verifierToken,
    verifierStatutActif,
    updatePreferences
);

/**
 * @swagger
 * /api/passagers/stats:
 *   get:
 *     summary: Récupérer les statistiques du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées.
 *       401:
 *         description: Non autorisé.
 */
router.get(
    "/stats",
    verifierToken,
    verifierStatutActif,
    getStats
);

module.exports = router;
