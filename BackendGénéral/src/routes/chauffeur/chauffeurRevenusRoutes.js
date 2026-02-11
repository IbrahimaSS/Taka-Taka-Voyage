const express = require("express");
const router = express.Router();

const {
    chauffeurRevenus,
    chauffeurRevenusListe,
} = require("../../controllers/chauffeur/chauffeurRevenusControllers");

const {verifierToken} = require("../../middlewares/authMiddlewares");
const chauffeurActif = require("../../middlewares/verifierChauffeurActif");

//Dashboard Stats
router.get(
    "/revenus",
    verifierToken,
    chauffeurActif,
    chauffeurRevenus
);

// Liste des paiements
router.get(
    "/revenus/liste",
    verifierToken,
    chauffeurActif,
    chauffeurRevenusListe
);
module.exports = router;
