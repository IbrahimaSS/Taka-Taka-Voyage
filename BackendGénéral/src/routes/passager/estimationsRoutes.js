const express = require("express");
const router = express.Router();

const estimationController = require("../../controllers/passager/estimationsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const { validerEstimation } = require("../../validators/estimationValidator");

// 🔹 Estimation trajet (Accueil Passager)
router.post(
    "/estimer-trajet",
    verifierToken,
    verifierStatutActif,
    validerEstimation,
    estimationController.estimerTrajet
);

module.exports = router;
