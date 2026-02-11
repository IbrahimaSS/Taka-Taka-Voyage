const express = require("express");
const router = express.Router();

const {
    listerEvaluationsPassager,
    detailEvaluationPassager,
    statsEvaluationsPassager,
    creerEvaluation,
} = require("../controllers/passager/evaluationsControllers");

const verifierToken = require("../../middlewares/authMiddlewares").verifierToken;
const verifierStatutActif = require("../../middlewares/statutMiddlewares").verifierStatutActif;


// Liste des évaluations données par le passager
router.get("/passager", verifierToken, verifierStatutActif, listerEvaluationsPassager);

// Détail d’une évaluation
router.get("/passager/:evaluationId", verifierToken, verifierStatutActif, detailEvaluationPassager);

// Stats (cards)
router.get("/passager/stats", verifierToken, verifierStatutActif, statsEvaluationsPassager);

// Soumettre une évaluation
router.post("/", verifierToken, verifierStatutActif, creerEvaluation);

module.exports = router;
