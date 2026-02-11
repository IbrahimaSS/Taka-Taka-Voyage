const express = require("express");
const router = express.Router();

// ✅ DESTRUCTURATION CORRECTE
const {
    creerReservationPlanifiee,
    listerPlanningPassager,
    detailPlanningPassager,
    modifierReservationPlanifiee,
    annulerReservationPlanifiee,
} = require("../../controllers/passager/reservationsPlanifieeControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

router.post(
    "/planifier",
    verifierToken,
    verifierStatutActif,
    creerReservationPlanifiee
);
// Lister le planning des réservations planifiées du passager
router.get(
    "/planning",
    verifierToken,
    verifierStatutActif,
    listerPlanningPassager
);

// Détail d’une réservation planifiée
router.get(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    detailPlanningPassager
);

// Modifier une réservation planifiée (optionnel)
router.put(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    modifierReservationPlanifiee
);

// Annuler une réservation planifiée (optionnel)
router.delete(
    "/planning/:reservationId",
    verifierToken,
    verifierStatutActif,
    annulerReservationPlanifiee
);
module.exports = router;
