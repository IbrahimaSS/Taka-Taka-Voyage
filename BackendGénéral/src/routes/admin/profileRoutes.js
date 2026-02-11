const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const profileController = require("../../controllers/admin/profileControllers");
const uploadPhoto = require("../../middlewares/uploadPhoto");
// ====================== PROFILE ADMIN ======================

// Infos du profil connecté
router.get(
    "/profile",
    verifierToken,
    autoriserRoles("ADMIN"),
    profileController.getProfile
);

// Modifier le profil
router.put(
    "/profile",
    verifierToken,
    autoriserRoles("ADMIN"),
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
