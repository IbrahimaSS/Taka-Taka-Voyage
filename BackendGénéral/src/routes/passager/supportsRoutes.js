const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const {
    creerSupport,
    listerMesSupports,
} = require("../../controllers/passager/supportsControllers");

/**
 * @swagger
 * /api/passagers/supports:
 *   post:
 *     summary: Créer un ticket de support
 *     description: Permet à un passager de créer une demande de support.
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
 *               sujet:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket de support créé.
 */
router.post("/", verifierToken, creerSupport);

/**
 * @swagger
 * /api/passagers/supports:
 *   get:
 *     summary: Lister les tickets de support
 *     description: Récupérer la liste des tickets de support créés par le passager.
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tickets récupérée avec succès.
 */
router.get("/", verifierToken, listerMesSupports);

module.exports = router;
