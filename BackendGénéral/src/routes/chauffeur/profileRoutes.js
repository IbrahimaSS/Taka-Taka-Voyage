const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");
const { upload } = require("../../middlewares/upload");
const uploadPhoto = require("../../middlewares/uploadPhoto");
const {
  updateVehicule,
  uploadDocuments,
  getProfil,
  updateProfil,
} = require("../../controllers/chauffeur/profileControllers");
const { changerMotDePasse } = require("../../controllers/chauffeur/motDePasseControllers");

router.get(
  "/profile",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  getProfil
);

router.put(
  "/profile",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  uploadPhoto.single("photoUrl"),
  updateProfil
);

router.put(
  "/mot-de-passe",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  changerMotDePasse
);

router.put(
  "/vehicule",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  updateVehicule
);

router.post(
  "/documents",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "license", maxCount: 1 },
    { name: "idCard", maxCount: 1 },
    { name: "carRegistration", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  uploadDocuments
);

module.exports = router;
