const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "takataka/profiles",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `user-${req.utilisateur?._id || "anonyme"}-${Date.now()}`,
    // Limite raisonnable pour un avatar : pas la peine de garder une photo en pleine résolution.
    transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }],
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Fichier non valide"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
