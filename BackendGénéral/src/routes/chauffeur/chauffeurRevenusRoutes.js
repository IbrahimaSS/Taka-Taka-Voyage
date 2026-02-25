const express = require("express");
const router = express.Router();

const {
    chauffeurRevenus,
    chauffeurRevenusListe,
} = require("../../controllers/chauffeur/chauffeurRevenusControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const chauffeurActif = require("../../middlewares/verifierChauffeurActif");

/**
 * @swagger
 * /api/chauffeur/revenus:
 *   get:
 *     summary: Tableau de bord des statistiques de revenus du chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des revenus
 *       401:
 *         description: Non autorisé
 */
//Dashboard Stats
router.get(
    "/revenus",
    verifierToken,
    chauffeurActif,
    chauffeurRevenus
);

/**
 * @swagger
 * /api/chauffeur/revenus/liste:
 *   get:
 *     summary: Obtenir la liste détaillée des paiements du chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 *       401:
 *         description: Non autorisé
 */
// Liste des paiements
router.get(
    "/revenus/liste",
    verifierToken,
    chauffeurActif,
    chauffeurRevenusListe
);
module.exports = router;
