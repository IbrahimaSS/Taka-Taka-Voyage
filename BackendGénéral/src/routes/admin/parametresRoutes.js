const express = require("express");
const router = express.Router();
const parametresControllers = require("../../controllers/admin/parametresControllers");

// Middleware d'authentification admin (à adapter selon votre système)
// const { protect, admin } = require("../../middlewares/authMiddleware");

/**
 * @swagger
 * /api/admin/parametres:
 *   get:
 *     summary: Récupérer les paramètres globaux de l'application
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres récupérés avec succès
 */
router.get("/", parametresControllers.getParametres);

/**
 * @swagger
 * /api/admin/parametres:
 *   patch:
 *     summary: Mettre à jour les paramètres globaux de l'application
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Champs de configuration à mettre à jour
 *     responses:
 *       200:
 *         description: Paramètres mis à jour avec succès
 */
router.patch("/", parametresControllers.updateParametres);

module.exports = router;
