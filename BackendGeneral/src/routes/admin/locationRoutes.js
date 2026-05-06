const express = require("express");
const router = express.Router();
const locationAdminControllers = require("../../controllers/admin/locationAdminControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const isAdmin = require("../../middlewares/isAdmin");
const uploadVehicule = require("../../middlewares/uploadVehicule");

/**
 * Routes pour la gestion des véhicules de location
 * Protégées par authentification et rôle ADMIN
 */

router.use(verifierToken);
router.use(isAdmin);

router
  .route("/vehicules")
  .get(locationAdminControllers.getTousLesVehicules)
  .post(uploadVehicule.single("photo"), locationAdminControllers.ajouterVehicule);

router
  .route("/vehicules/:id")
  .get(locationAdminControllers.getVehiculeById)
  .put(uploadVehicule.single("photo"), locationAdminControllers.modifierVehicule)
  .delete(locationAdminControllers.supprimerVehicule);

// ─── Réservations ───
router.get("/reservations", locationAdminControllers.getReservations);
router.put("/reservations/:id/approuver", locationAdminControllers.approuverReservation);
router.put("/reservations/:id/demarrer", locationAdminControllers.demarrerLocation);
router.put("/reservations/:id/confirmer-retour", locationAdminControllers.confirmerRetour);
router.put("/reservations/:id/refuser", locationAdminControllers.refuserReservation);
router.delete("/reservations/:id", locationAdminControllers.supprimerReservation);

module.exports = router;
