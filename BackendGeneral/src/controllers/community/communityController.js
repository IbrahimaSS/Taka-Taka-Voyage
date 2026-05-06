const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

/**
 * @desc    Créer une nouvelle publication
 * @route   POST /api/community/posts
 * @access  Privé
 */
exports.creerPost = async (req, res) => {
  try {
    const { contenu, typeMedia, mediaUrl, tags } = req.body;

    const nouveauPost = await Post.create({
      auteur: req.utilisateur._id,
      contenu,
      typeMedia,
      mediaUrl,
      tags: tags || [],
    });

    // Populate l'auteur pour le retour
    const postPopule = await Post.findById(nouveauPost._id).populate("auteur", "nom prenom photoUrl");

    res.status(201).json({
      succes: true,
      donnees: postPopule,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la création du post",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Récupérer tous les posts (Fil d'actualité)
 * @route   GET /api/community/posts
 * @access  Public
 */
exports.getPosts = async (req, res) => {
  try {
    const { tag } = req.query;
    let filtre = { statut: "ACTIF" };

    if (tag) {
      filtre.tags = tag;
    }

    const posts = await Post.find(filtre)
      .populate("auteur", "nom prenom photoUrl")
      .sort("-createdAt")
      .limit(50);

    res.status(200).json({
      succes: true,
      nb: posts.length,
      donnees: posts,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la récupération du fil d'actualité",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Liker / Unliker un post
 * @route   PUT /api/community/posts/:id/like
 * @access  Privé
 */
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ succes: false, message: "Post introuvable" });
    }

    const index = post.likes.indexOf(req.utilisateur._id);
    if (index === -1) {
      post.likes.push(req.utilisateur._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.status(200).json({
      succes: true,
      likes: post.likes.length,
      isLiked: index === -1,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors du like",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Uploader un média (Audio/Photo/Vidéo)
 * @route   POST /api/community/upload
 * @access  Privé
 */
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ succes: false, message: "Aucun fichier envoyé" });
    }

    // On retourne l'URL relative (le frontend rajoutera le domaine si besoin)
    const url = `/uploads/community/${req.file.filename}`;

    res.status(200).json({
      succes: true,
      url: url,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de l'upload",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Ajouter un commentaire à un post
 * @route   POST /api/community/posts/:id/comments
 * @access  Privé
 */
exports.creerCommentaire = async (req, res) => {
  try {
    const { contenu } = req.body;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ succes: false, message: "Post introuvable" });
    }

    const commentaire = await Comment.create({
      post: postId,
      auteur: req.utilisateur._id,
      contenu
    });

    // Mettre à jour le compteur sur le post
    post.nombreCommentaires = (post.nombreCommentaires || 0) + 1;
    await post.save();

    const comPopule = await Comment.findById(commentaire._id).populate("auteur", "nom prenom photoUrl");

    // Notification Socket.io
    if (global.io && String(post.auteur) !== String(req.utilisateur._id)) {
      const roomAuteur = `USER_${post.auteur}`;
      global.io.to(roomAuteur).emit("community:nouveau_commentaire", {
        post: post._id,
        commentaire: comPopule,
        message: `${req.utilisateur.prenom} a commenté votre publication`
      });
    }

    res.status(201).json({
      succes: true,
      donnees: comPopule
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de l'ajout du commentaire",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Récupérer les commentaires d'un post
 * @route   GET /api/community/posts/:id/comments
 * @access  Public
 */
exports.getCommentaires = async (req, res) => {
  try {
    const commentaires = await Comment.find({ post: req.params.id })
      .populate("auteur", "nom prenom photoUrl")
      .sort("createdAt");

    res.status(200).json({
      succes: true,
      donnees: commentaires
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la récupération des commentaires",
      erreur: error.message,
    });
  }
};
