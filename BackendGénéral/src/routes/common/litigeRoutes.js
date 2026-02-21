const express = require("express");
const router = express.Router();
const litigeController = require("../../controllers/admin/litigeControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

// CRÉER UN LITIGE
// Accessible par Passager et Chauffeur
router.post("/", verifierToken, litigeController.creerLitige);

module.exports = router;
