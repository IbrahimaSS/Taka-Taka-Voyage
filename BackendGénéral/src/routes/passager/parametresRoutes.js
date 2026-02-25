const express = require("express");
const router = express.Router();
const {
    getParametres,
    updateParametres,
} = require("../controllers/passager/parametresControllers");
const verifyToken = require("../middlewares/verifyToken");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");


/**
 * @swagger
 * /api/passager/parametres:
 *   get:
 *     summary: Obtenir les paramètres du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paramètres récupérés
 */
router.get("/", verifyToken, verifierStatutActif, getParametres);

/**
 * @swagger
 * /api/passager/parametres:
 *   put:
 *     summary: Mettre à jour les paramètres du passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 */
router.put("/", verifyToken, verifierStatutActif, updateParametres);

module.exports = router;