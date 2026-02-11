const express = require("express");
const router = express.Router();

const { updateNotifications } = require("../../controllers/passager/notificationsControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");

// Paramètres de notifications
router.put(
    "/notifications",
    verifierToken,
    verifierStatutActif,
    updateNotifications
);

module.exports = router;
