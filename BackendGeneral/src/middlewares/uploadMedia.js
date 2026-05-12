const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'takataka/community',
    resource_type: 'auto', // Important pour supporter les fichiers audio et vidéo
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp3', 'wav', 'mp4', 'mkv', 'webm']
  }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/", "audio/", "video/"];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non supporté. Veuillez envoyer une image, un audio ou une vidéo."), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite à 50MB pour les vidéos/audios
});
