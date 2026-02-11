const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const chauffeurActif = require("../../middlewares/verifierChauffeurActif");

const {
    historiqueTrajetsChauffeur,
} = require("../../controllers/chauffeur/historiqueTrajetsControllers");

router.get(
    "/trajets/historique",
    verifierToken,
    chauffeurActif,
    historiqueTrajetsChauffeur
);

module.exports = router;
