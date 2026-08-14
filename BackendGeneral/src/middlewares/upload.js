const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "takataka/documents-chauffeur",
    // "auto" : Cloudinary détecte lui-même image vs PDF (ce champ accepte les deux).
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    public_id: `${file.fieldname}-${req.utilisateur?._id || "anonyme"}-${Date.now()}`,
    // Ignoré par Cloudinary pour les PDF (resource_type "raw"), appliqué aux images.
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype && file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";
  if (isImage || isPdf) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Utilisez une image ou un PDF."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload };
