const Conversation = require("../../models/Conversation");
const DirectMessage = require("../../models/DirectMessage");

/**
 * @desc    Démarrer ou récupérer une conversation existante
 * @route   POST /api/community/conversations
 */
exports.startConversation = async (req, res) => {
  try {
    const { destinataireId } = req.body;
    const monId = req.utilisateur._id;

    if (monId.toString() === destinataireId) {
      return res.status(400).json({ succes: false, message: "Impossible de se parler à soi-même" });
    }

    // Chercher une conversation existante entre ces deux personnes
    let conversation = await Conversation.findOne({
      participants: { $all: [monId, destinataireId] }
    }).populate("participants", "nom prenom photoUrl");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [monId, destinataireId]
      });
      conversation = await conversation.populate("participants", "nom prenom photoUrl");
    }

    res.status(200).json({ succes: true, donnees: conversation });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

/**
 * @desc    Lister mes conversations
 * @route   GET /api/community/conversations
 */
exports.getMesConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.utilisateur._id
    })
    .populate("participants", "nom prenom photoUrl")
    .sort("-dateDernierMessage");

    res.status(200).json({ succes: true, donnees: conversations });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

/**
 * @desc    Envoyer un message privé
 * @route   POST /api/community/conversations/:id/messages
 */
exports.envoyerMessage = async (req, res) => {
  try {
    const { contenu, type, mediaUrl } = req.body;
    const conversationId = req.params.id;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ succes: false, message: "Conversation introuvable" });

    const destinataire = conv.participants.find(p => p.toString() !== req.utilisateur._id.toString());

    const message = await DirectMessage.create({
      conversation: conversationId,
      expediteur: req.utilisateur._id,
      destinataire,
      contenu,
      type: type || "TEXTE",
      mediaUrl
    });

    // Mettre à jour le dernier message de la conversation
    conv.dernierMessage = type === "TEXTE" ? contenu : `[Média: ${type}]`;
    conv.dateDernierMessage = Date.now();
    await conv.save();

    // Notification Socket.io
    if (global.io) {
      const roomDest = `USER_${destinataire}`;
      global.io.to(roomDest).emit("community:nouveau_message", {
        conversationId,
        message: message,
        expediteur: {
          nom: req.utilisateur.nom,
          prenom: req.utilisateur.prenom,
          photoUrl: req.utilisateur.photoUrl
        }
      });
    }

    res.status(201).json({ succes: true, donnees: message });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

/**
 * @desc    Récupérer l'historique d'une conversation
 * @route   GET /api/community/conversations/:id/messages
 */
exports.getHistorique = async (req, res) => {
  try {
    const messages = await DirectMessage.find({ conversation: req.params.id })
      .sort("createdAt");

    res.status(200).json({ succes: true, donnees: messages });
  } catch (error) {
    res.status(500).json({ succes: false, message: error.message });
  }
};
