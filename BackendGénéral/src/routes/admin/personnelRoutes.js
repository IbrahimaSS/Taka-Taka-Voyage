const express = require("express");
const router = express.Router();

const {
    createPersonnel,
    getPersonnels,
    getPersonnelById,
    updatePersonnel,
    deletePersonnel,
    togglePersonnelStatus,
} = require("../../controllers/admin/personnelControllers");

const {verifierToken} = require("../../middlewares/authMiddlewares");
const isAdmin = require("../../middlewares/isAdmin");

router.post("/", verifierToken, isAdmin, createPersonnel);
router.get("/", verifierToken, isAdmin, getPersonnels);
router.get("/:id", verifierToken, isAdmin, getPersonnelById);
router.put("/:id", verifierToken, isAdmin, updatePersonnel);
router.delete("/:id", verifierToken, isAdmin, deletePersonnel);
router.put("/:id/status", verifierToken, isAdmin, togglePersonnelStatus);

module.exports = router;
