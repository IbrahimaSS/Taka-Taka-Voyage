const express = require("express");
const router = express.Router();
const Guide = require("../../models/Guide");
const uploadGuide = require("../../middlewares/uploadGuide");
const cloudinary = require("../../config/cloudinary");
const { verifierToken } = require("../../middlewares/authMiddlewares");
const isAdmin = require("../../middlewares/isAdmin");

// ==================== ROUTES PUBLIQUES ====================

// GET /api/guides — Récupérer tous les guides actifs (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const { categorie } = req.query;
    const filter = { actif: true };

    if (categorie) {
      filter.categorie = categorie.toUpperCase();
    }

    const guides = await Guide.find(filter).sort({ categorie: 1, ordre: 1, createdAt: -1 });

    res.json({ succes: true, guides });
  } catch (error) {
    console.error("Erreur récupération guides:", error);
    res.status(500).json({ succes: false, message: "Erreur serveur" });
  }
});

// ==================== ROUTES ADMIN ====================

// POST /api/guides — Ajouter un guide (ADMIN)
router.post("/", verifierToken, isAdmin, uploadGuide.single("fichier"), async (req, res) => {
  try {
    const { titre, description, categorie, icone, ordre } = req.body;

    if (!req.file) {
      return res.status(400).json({ succes: false, message: "Le fichier PDF est requis" });
    }

    const guide = await Guide.create({
      titre,
      description,
      categorie: categorie?.toUpperCase(),
      fichierUrl: req.file.path,
      fichierPublicId: req.file.filename,
      icone: icone || "FileText",
      ordre: parseInt(ordre) || 0,
    });

    res.status(201).json({ succes: true, guide });
  } catch (error) {
    console.error("Erreur création guide:", error);
    res.status(500).json({ succes: false, message: error.message || "Erreur serveur" });
  }
});

// PUT /api/guides/:id — Modifier un guide (ADMIN)
router.put("/:id", verifierToken, isAdmin, uploadGuide.single("fichier"), async (req, res) => {
  try {
    const { titre, description, categorie, icone, ordre, actif } = req.body;
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ succes: false, message: "Guide non trouvé" });
    }

    // Si un nouveau fichier est uploadé, supprimer l'ancien de Cloudinary
    if (req.file && guide.fichierPublicId) {
      try {
        await cloudinary.uploader.destroy(guide.fichierPublicId, { resource_type: "image" });
      } catch (e) {
        console.warn("Erreur suppression ancien fichier Cloudinary:", e.message);
      }
    }

    // Mise à jour des champs
    if (titre) guide.titre = titre;
    if (description) guide.description = description;
    if (categorie) guide.categorie = categorie.toUpperCase();
    if (icone) guide.icone = icone;
    if (ordre !== undefined) guide.ordre = parseInt(ordre);
    if (actif !== undefined) guide.actif = actif === "true" || actif === true;
    if (req.file) {
      guide.fichierUrl = req.file.path;
      guide.fichierPublicId = req.file.filename;
    }

    await guide.save();
    res.json({ succes: true, guide });
  } catch (error) {
    console.error("Erreur modification guide:", error);
    res.status(500).json({ succes: false, message: error.message || "Erreur serveur" });
  }
});

// DELETE /api/guides/:id — Supprimer un guide (ADMIN)
router.delete("/:id", verifierToken, isAdmin, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);

    if (!guide) {
      return res.status(404).json({ succes: false, message: "Guide non trouvé" });
    }

    // Supprimer le fichier de Cloudinary
    if (guide.fichierPublicId) {
      try {
        await cloudinary.uploader.destroy(guide.fichierPublicId, { resource_type: "image" });
      } catch (e) {
        console.warn("Erreur suppression fichier Cloudinary:", e.message);
      }
    }

    await Guide.findByIdAndDelete(req.params.id);
    res.json({ succes: true, message: "Guide supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression guide:", error);
    res.status(500).json({ succes: false, message: "Erreur serveur" });
  }
});

module.exports = router;
