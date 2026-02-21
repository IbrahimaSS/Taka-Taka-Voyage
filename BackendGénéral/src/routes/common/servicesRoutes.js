const express = require("express");
const router = express.Router();
const servicesControllers = require("../../controllers/common/servicesControllers");

// Route publique — pas besoin d'être authentifié
router.get("/", servicesControllers.getServicesActifs);

module.exports = router;
