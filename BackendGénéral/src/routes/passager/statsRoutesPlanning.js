const express = require("express");
const router = express.Router();

const { statsPassager } = require("../../controllers/passager/statsControllersPlanning");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

// 📊 Stats globales passager
router.get(
    "/stats",
    verifierToken,
    verifierStatutActif,
    statsPassager
);

module.exports = router;
