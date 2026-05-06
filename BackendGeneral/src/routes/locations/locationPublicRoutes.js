const express = require("express");
const router = express.Router();
const locationPublicControllers = require("../../controllers/location/locationPublicControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

/**
 * Routes pour la location de véhicules
 */
router.get("/vehicules", locationPublicControllers.getVehiculesPublics);
router.get("/vehicules/:id", locationPublicControllers.getVehiculeDetails);

// Demande de réservation (Nécessite d'être connecté)
router.post("/reserver", verifierToken, locationPublicControllers.creerReservation);
router.get("/mes-reservations", verifierToken, locationPublicControllers.getMesReservations);
router.post("/:id/signaler-retour", verifierToken, locationPublicControllers.signalerRetour);

module.exports = router;
