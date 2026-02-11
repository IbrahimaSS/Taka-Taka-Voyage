const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const dashboardController = require("../../controllers/admin/dashboardControllers");
//Cards dashboard
router.get(
    "/dashboard",
    verifierToken,
    autoriserRoles("ADMIN"),
    dashboardController.dashboardCards
);
//5 Trajets Recents
router.get(
    "/trajets/recents",
    verifierToken, autoriserRoles("ADMIN"),
    dashboardController.trajetsRecents
);

module.exports = router;
