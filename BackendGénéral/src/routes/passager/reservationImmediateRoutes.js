const express = require("express");
const router = express.Router();

const {
  confirmerReservationImmediate,
} = require("../../controllers/passager/reservationsImmediateControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares"); // ✅

router.post(
  "/confirmer-immediate",
  verifierToken,
  verifierStatutActif,
  autoriserRoles("PASSAGER"), // ✅ IMPORTANT
  confirmerReservationImmediate
);

module.exports = router;