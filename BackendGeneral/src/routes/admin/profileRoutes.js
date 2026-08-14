const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const profileController = require("../../controllers/admin/profileControllers");
const uploadPhoto = require("../../middlewares/uploadPhoto");
const { checkUploadIdempotency } = require("../../middlewares/checkUploadIdempotency");
// ====================== PROFILE ADMIN ======================

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Obtenir les informations du profil administrateur connecté
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations du profil
 */
// Infos du profil connecté
router.get(
    "/profile",
    verifierToken,
    autoriserRoles("ADMIN"),
    profileController.getProfile
);

/**
 * @swagger
 * /api/admin/profile:
 *   put:
 *     summary: Modifier les informations du profil administrateur
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
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
 *         description: Profil mis à jour
 */
// Modifier le profil
router.put(
    "/profile",
    verifierToken,
    autoriserRoles("ADMIN"),
    checkUploadIdempotency,
    uploadPhoto.single("photoUrl"),
    profileController.updateProfile
);

// Journal d'activité
// router.get(
//     "/profile/activites",
//     verifierToken,
//     autoriserRoles("ADMIN"),
//     profileController.journalActivite
// );

// Statistiques rapides
// router.get(
//     "/profile/stats",
//     verifierToken,
//     autoriserRoles("ADMIN"),
//     profileController.statsProfile
// );

module.exports = router;
