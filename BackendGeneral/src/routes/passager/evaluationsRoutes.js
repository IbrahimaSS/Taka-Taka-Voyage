const express = require("express");
const router = express.Router();

const {
    listerEvaluationsPassager,
    detailEvaluationPassager,
    statsEvaluationsPassager,
    creerEvaluation,
} = require("../../controllers/passager/evaluationsControllers");

const verifierToken = require("../../middlewares/authMiddlewares").verifierToken;
const verifierStatutActif = require("../../middlewares/statutMiddlewares").verifierStatutActif;

/**
 * @swagger
 * /api/evaluations/passager:
 *   get:
 *     summary: Liste des évaluations données par le passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des évaluations
 */
// Liste des évaluations données par le passager
router.get("/passager", verifierToken, verifierStatutActif, listerEvaluationsPassager);

/**
 * @swagger
 * /api/evaluations/passager/stats:
 *   get:
 *     summary: Statistiques globales des évaluations données par le passager
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques d'évaluation
 */
// Stats (cards)
router.get("/passager/stats", verifierToken, verifierStatutActif, statsEvaluationsPassager);

/**
 * @swagger
 * /api/evaluations/passager/{evaluationId}:
 *   get:
 *     summary: Détail d'une évaluation spécifique
 *     tags: [3 - Passagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'évaluation
 */
// Détail d’une évaluation
router.get("/passager/:evaluationId", verifierToken, verifierStatutActif, detailEvaluationPassager);

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Soumettre une nouvelle évaluation pour un trajet/chauffeur
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
 *               trajetId:
 *                 type: string
 *               note:
 *                 type: integer
 *               commentaire:
 *                 type: string
 *     responses:
 *       201:
 *         description: Évaluation créée
 */
// Soumettre une évaluation
router.post("/", verifierToken, verifierStatutActif, creerEvaluation);

module.exports = router;
