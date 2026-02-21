const express = require("express");
const router = express.Router();
const parametresControllers = require("../../controllers/admin/parametresControllers");

// Middleware d'authentification admin (à adapter selon votre système)
// const { protect, admin } = require("../../middlewares/authMiddleware");

router.get("/", parametresControllers.getParametres);
router.patch("/", parametresControllers.updateParametres);

module.exports = router;
