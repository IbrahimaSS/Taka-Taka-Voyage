const express = require("express");
const router = express.Router();

// Middlewares
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

// Controller
const activityLogController = require("../../controllers/admin/activityLogControllers");

// @route   GET /api/admin/logs
router.get(
    "/",
    verifierToken,
    autoriserRoles("ADMIN", "SUPERVISEUR"),
    activityLogController.getActivityLogs
);

// @route   GET /api/admin/logs/stats
router.get(
    "/stats",
    verifierToken,
    autoriserRoles("ADMIN", "SUPERVISEUR"),
    activityLogController.getLogStats
);

// @route   DELETE /api/admin/logs/purge
router.delete(
    "/purge",
    verifierToken,
    autoriserRoles("ADMIN", "SUPERVISEUR"),
    activityLogController.purgeOldLogs
);

// @route   POST /api/admin/logs/report-user
router.post(
    "/report-user",
    verifierToken,
    autoriserRoles("ADMIN", "SUPERVISEUR"),
    activityLogController.reportUserFromLog
);

// @route   POST /api/admin/logs/manuel
// @desc    Permet au frontend de loguer une action spécifique
router.post(
    "/manuel",
    verifierToken,
    activityLogController.creerLogManuel
);

module.exports = router;
