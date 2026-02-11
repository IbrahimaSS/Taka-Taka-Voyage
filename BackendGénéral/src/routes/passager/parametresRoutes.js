const express = require("express");
const router = express.Router();
const {
    getParametres,
    updateParametres,
} = require("../controllers/passager/parametresControllers");
const verifyToken = require("../middlewares/verifyToken");
const { verifierStatutActif } = require("../../middlewares/statutMiddlewares");


router.get("/", verifyToken, verifierStatutActif, getParametres);
router.put("/", verifyToken, verifierStatutActif, updateParametres);

module.exports = router;