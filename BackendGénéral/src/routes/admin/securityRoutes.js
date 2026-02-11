const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const {
    changePassword,
} = require("../../controllers/admin/securityControllers");

router.put("/password", verifierToken, changePassword);

module.exports = router;