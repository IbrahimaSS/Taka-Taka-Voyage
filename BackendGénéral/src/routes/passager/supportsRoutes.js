const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const {
    creerSupport,
    listerMesSupports,
} = require("../../controllers/passager/supportsControllers");

// CREER UN SUPPORT
router.post("/", verifierToken, creerSupport);

// LISTE DES SUPPORTS
router.get("/", verifierToken, listerMesSupports);

module.exports = router;
