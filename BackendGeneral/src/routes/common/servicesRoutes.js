const express = require("express");
const router = express.Router();
const servicesControllers = require("../../controllers/common/servicesControllers");

/**
 * @swagger
 * /api/services-actifs:
 *   get:
 *     summary: Récupérer la configuration des services actifs de la plateforme
 *     tags: [5 - Autres]
 *     responses:
 *       200:
 *         description: Liste des services disponibles (Inter-urbain, Location, etc.)
 */
// Route publique — pas besoin d'être authentifié
router.get("/", servicesControllers.getServicesActifs);

module.exports = router;
