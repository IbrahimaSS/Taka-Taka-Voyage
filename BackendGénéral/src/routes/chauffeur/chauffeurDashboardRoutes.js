const express = require("express");
const router = express.Router();

const {
    chauffeurDashboardStats,
} = require("../../controllers/chauffeur/chauffeurDashboardControllers");

const {verifierToken} = require("../../middlewares/authMiddlewares");
const verifierChauffeurActif = require("../../middlewares/verifierChauffeurActif");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

// Dashboard chauffeur
router.get(
    "/dashboard",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    verifierChauffeurActif,
    chauffeurDashboardStats
);

module.exports = router;
