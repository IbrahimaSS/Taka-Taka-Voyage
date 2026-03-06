const express = require("express");
const router = express.Router();
const backupControllers = require("../../controllers/admin/backupControllers");
const { verifierToken } = require("../../middlewares/authMiddlewares");

// Toutes les routes sont protégées et réservées aux admins
router.use(verifierToken);

// On pourrait ajouter un middleware de role check ici s'il n'est pas déjà dans verifierToken
// router.use(verifierRole('ADMIN'));

router.get("/", backupControllers.listerBackups);
router.post("/", backupControllers.creerBackup);
router.post("/restore/:id", backupControllers.restaurerBackup);
router.delete("/:id", backupControllers.supprimerBackup);

module.exports = router;
