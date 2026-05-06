const express = require("express");
const router = express.Router();
const communityController = require("../../controllers/community/communityController");
const messageController = require("../../controllers/community/messageController");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const uploadMedia = require("../../middlewares/uploadMedia");

// Routes publiques
router.get("/posts", communityController.getPosts);

// Routes protégées
router.use(verifierToken);
router.post("/posts", communityController.creerPost);
router.post("/upload", uploadMedia.single("media"), communityController.uploadMedia);
router.put("/posts/:id/like", communityController.toggleLike);
router.post("/posts/:id/comments", communityController.creerCommentaire);
router.get("/posts/:id/comments", communityController.getCommentaires);

// Messagerie Privée
router.post("/conversations", messageController.startConversation);
router.get("/conversations", messageController.getMesConversations);
router.post("/conversations/:id/messages", messageController.envoyerMessage);
router.get("/conversations/:id/messages", messageController.getHistorique);

module.exports = router;
