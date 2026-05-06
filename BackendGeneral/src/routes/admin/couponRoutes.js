const express = require("express");
const router = express.Router();

const {
    creerCoupon,
    listerCoupons,
    changerStatutCoupon,
    validerCoupon
} = require("../../controllers/admin/couponControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares");

// Routes Passagers (Ouvertes à tous les utilisateurs authentifiés pour vérifier un code)
router.post("/valider", verifierToken, validerCoupon);

// Routes Admin (Strictement réservées à l'administration)
router.post("/", verifierToken, autoriserRoles("ADMIN"), creerCoupon);
router.get("/", verifierToken, autoriserRoles("ADMIN"), listerCoupons);
router.patch("/:id/statut", verifierToken, autoriserRoles("ADMIN"), changerStatutCoupon);

module.exports = router;
