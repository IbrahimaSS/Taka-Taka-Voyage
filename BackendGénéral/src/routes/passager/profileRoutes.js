const express = require("express");
const router = express.Router();

const {
    getProfil,
    updateProfil,
    updatePreferences,
} = require("../../controllers/passager/profileControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const uploadPhoto = require("../../middlewares/uploadPhoto");

// Mon profil
router.get(
    "/profil",
    verifierToken,
    verifierStatutActif,
    getProfil
);

// Modifier mon profil (SANS validerInscription)
router.put(
    "/profil",
    verifierToken,
    verifierStatutActif,
    uploadPhoto.single("photoUrl"),
    updateProfil
);

// Préférences
router.put(
    "/preferences",
    verifierToken,
    verifierStatutActif,
    updatePreferences
);

module.exports = router;
