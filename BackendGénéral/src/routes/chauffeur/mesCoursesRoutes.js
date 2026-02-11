const express = require("express");
const router = express.Router();

const {
    verifierToken
} = require("../../middlewares/authMiddlewares");

const mesCoursesCtrl = require("../../controllers/chauffeur/courses/mesCoursesControllers");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

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

module.exports = router;
