const express = require("express");
const router = express.Router();

const { verifierToken } = require("../../middlewares/authMiddlewares");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");
const documentController = require("../../controllers/admin/documentControllers");


//=====================================DOCUMENTS====================================
//Cards des documents
router.get(
    "/documents/stats",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.statsDocuments
);
//Listes des documents
router.get(
    "/documents",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.listeDocuments
);
//Valider et Refuser un Document
router.patch(
    "/documents/:id/statut",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.changerStatutDocument
);
//Voir un Document
router.get(
    "/chauffeurs/:id/documents/",
    verifierToken,
    autoriserRoles("ADMIN"),
    documentController.voirDocumentsChauffeur
);

module.exports = router;