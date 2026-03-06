const express = require("express");
const router = express.Router();

const authController = require("../../controllers/compte/authControllers");
const { validerConnexion } = require("../../validators/connexionValidators");
const { validerInscription } = require("../../validators/inscriptionValidators");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const passport = require("passport");

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Se connecter avec Google
 *     tags: [1 - Authentification]
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), authController.socialCallback);

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Se connecter avec Facebook
 *     tags: [1 - Authentification]
 */
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), authController.socialCallback);

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification et de l'inscription des utilisateurs
 */

/**
 * @swagger
 * /api/auth/init-inscription:
 *   post:
 *     summary: Initialisation de l'inscription
 *     tags: [1 - Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telephone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP envoyé avec succès
 *       400:
 *         description: Erreur de validation
 */
// Initialisation inscription + génération OTP
router.post("/init-inscription", validerInscription, authController.initInscription);

/**
 * @swagger
 * /api/auth/verifier-otp:
 *   post:
 *     summary: Vérification de l'OTP
 *     tags: [1 - Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telephone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP vérifié avec succès
 *       400:
 *         description: OTP invalide ou expiré
 */
// Vérification OTP
router.post("/verifier-otp", authController.verifierOtp);

/**
 * @swagger
 * /api/auth/finaliser-inscription:
 *   post:
 *     summary: Finalisation de l'inscription
 *     tags: [1 - Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               telephone:
 *                 type: string
 *               email:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur lors de la création
 */
// Finalisation inscription (création utilisateur)
router.post(
    "/finaliser-inscription",
    validerInscription,
    authController.finaliserInscription
);

/**
 * @swagger
 * /api/auth/connexion:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [1 - Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               motDePasse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token
 *       401:
 *         description: Identifiants incorrects
 */
// Connexion
router.post("/connexion", validerConnexion, authController.connexion);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [1 - Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré
 *       401:
 *         description: Non authentifié
 */
// Récupérer l'utilisateur connecté
router.get("/me", verifierToken, authController.getMe);

// Finalisation profil social (Ajout téléphone/rôle)
router.put("/social-finalize", verifierToken, authController.socialFinalize);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [1 - Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
// Déconnexion (suppression du cookie)
router.post("/logout", authController.logout);

module.exports = router;
