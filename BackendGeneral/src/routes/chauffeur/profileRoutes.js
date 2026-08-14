const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");
const { upload } = require("../../middlewares/upload");
const uploadPhoto = require("../../middlewares/uploadPhoto");
const { checkUploadIdempotency } = require("../../middlewares/checkUploadIdempotency");
const {
  updateVehicule,
  uploadDocuments,
  getProfil,
  updateProfil,
} = require("../../controllers/chauffeur/profileControllers");
const { changerMotDePasse } = require("../../controllers/chauffeur/motDePasseControllers");

/**
 * @swagger
 * /api/chauffeurs/profile:
 *   get:
 *     summary: Récupérer le profil du chauffeur
 *     description: Retourne les informations du profil du chauffeur connecté.
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès.
 *       401:
 *         description: Non autorisé.
 */
router.get(
  "/profile",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  getProfil
);

/**
 * @swagger
 * /api/chauffeurs/profile:
 *   put:
 *     summary: Mettre à jour le profil du chauffeur
 *     description: Permet de mettre à jour les informations du profil du chauffeur.
 *     tags: [2 - Chauffeurs]
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
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès.
 *       401:
 *         description: Non autorisé.
 */
router.put(
  "/profile",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  checkUploadIdempotency,
  uploadPhoto.single("photoUrl"),
  updateProfil
);

/**
 * @swagger
 * /api/chauffeurs/profile/mot-de-passe:
 *   put:
 *     summary: Changer le mot de passe
 *     description: Permet au chauffeur de changer son mot de passe.
 *     tags: [2 - Chauffeurs]
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
 *         description: Mot de passe changé avec succès.
 *       400:
 *         description: Ancien mot de passe incorrect.
 */
router.put(
  "/mot-de-passe",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  changerMotDePasse
);

/**
 * @swagger
 * /api/chauffeurs/profile/vehicule:
 *   put:
 *     summary: Mettre à jour les informations du véhicule
 *     description: Permet au chauffeur de mettre à jour les informations de son véhicule.
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               immatriculation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Informations du véhicule mises à jour.
 */
router.put(
  "/vehicule",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  updateVehicule
);

/**
 * @swagger
 * /api/chauffeurs/profile/documents:
 *   post:
 *     summary: Uploader les documents du chauffeur
 *     description: Permet d'uploader les différents documents requis (photo, permis, carte d'identité, etc.).
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               license:
 *                 type: string
 *                 format: binary
 *               idCard:
 *                 type: string
 *                 format: binary
 *               carRegistration:
 *                 type: string
 *                 format: binary
 *               insurance:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploadés avec succès.
 */
router.post(
  "/documents",
  verifierToken,
  autoriserRoles("CHAUFFEUR"),
  checkUploadIdempotency,
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
