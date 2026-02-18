const express = require("express");
const router = express.Router();

const {
    verifierToken
} = require("../../middlewares/authMiddlewares");

const mesCoursesCtrl = require("../../controllers/chauffeur/courses/mesCoursesControllers");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

router.get(
    "/disponibles",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listeDisponible
);

router.post(
    "/mes-courses/:reservationId/accepter",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.accepterReservation
);

router.post(
    "/mes-courses/:reservationId/refuser",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.refuserReservation
);

router.get(
    "/mes-courses/ramassage",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listeRamassage
);


router.post(
    "/mes-courses/:reservationId/rejoindre",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.rejoindreCourse
);

router.post(
    "/mes-courses/:reservationId/signaler-arrivee",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.signalerArrivee
);

router.post(
    "/mes-courses/:reservationId/demarrer",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.demarrerTrajet
);

router.post(
    "/mes-courses/:reservationId/terminer",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.terminerTrajet
);

router.get(
    "/plannings",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listePlannings
);

module.exports = router;
