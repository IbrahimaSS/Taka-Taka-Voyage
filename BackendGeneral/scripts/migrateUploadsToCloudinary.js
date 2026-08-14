/**
 * Script one-shot : migre vers Cloudinary les fichiers déjà uploadés en local
 * (photos de profil, documents chauffeur, photos véhicules de location) et met
 * à jour les références correspondantes en base de données.
 *
 * Ne supprime JAMAIS un fichier local : les fichiers migrés avec succès sont
 * listés en fin d'exécution pour une suppression manuelle après vérification.
 *
 * Usage :
 *   node scripts/migrateUploadsToCloudinary.js            (dry-run, aucune écriture)
 *   node scripts/migrateUploadsToCloudinary.js --execute   (exécution réelle)
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("../src/config/cloudinary");

const Utilisateurs = require("../src/models/Utilisateurs");
const ChauffeurProfile = require("../src/models/ChauffeurProfile");
const Document = require("../src/models/Documents");
const VehiculeLocation = require("../src/models/VehiculeLocation");

const DRY_RUN = !process.argv.includes("--execute");
const BACKEND_ROOT = path.join(__dirname, "..");

const DOCUMENT_TYPE_BY_FIELD = {
  photoVehicule: "PHOTO_VEHICULE",
  permisConduire: "PERMIS",
  pieceIdentite: "IDENTITE",
  carteGrise: "CARTE_GRISE",
  assurance: "ASSURANCE",
};

const stats = { uploaded: 0, missingFile: 0 };
const localFilesMigrated = [];

// Une valeur DB peut être : une URL absolue "http://host/uploads/x", un chemin
// relatif "/uploads/x", ou un chemin sans slash initial "uploads/x". Dans les
// trois cas, on retrouve le fichier réel sous BackendGeneral/uploads/.
function resolveLocalPath(value) {
  if (!value) return null;
  const marker = "/uploads/";
  const idx = value.indexOf(marker);
  let afterUploads;
  if (idx !== -1) {
    afterUploads = value.slice(idx + marker.length);
  } else if (value.startsWith("uploads/")) {
    afterUploads = value.slice("uploads/".length);
  } else {
    return null; // Pas une référence locale reconnue (déjà Cloudinary, OAuth, etc.)
  }
  return path.join(BACKEND_ROOT, "uploads", afterUploads);
}

async function uploadToCloudinary(localPath, folder) {
  if (!fs.existsSync(localPath)) {
    stats.missingFile++;
    console.warn(`⚠️  Fichier introuvable sur le disque, ignoré : ${localPath}`);
    return null;
  }
  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Uploadrait ${localPath} → Cloudinary (${folder})`);
    return "URL_SIMULEE_DRY_RUN";
  }
  const result = await cloudinary.uploader.upload(localPath, { folder, resource_type: "auto" });
  stats.uploaded++;
  localFilesMigrated.push(localPath);
  return result.secure_url;
}

async function migrerPhotosUtilisateurs() {
  const users = await Utilisateurs.find({ photoUrl: { $regex: "uploads" } });
  console.log(`\n--- Photos de profil (${users.length} candidats) ---`);
  for (const user of users) {
    const localPath = resolveLocalPath(user.photoUrl);
    if (!localPath) continue;
    const newUrl = await uploadToCloudinary(localPath, "takataka/profiles");
    if (!newUrl) continue;
    console.log(`  Utilisateur ${user._id} : ${user.photoUrl} → ${newUrl}`);
    if (!DRY_RUN) {
      user.photoUrl = newUrl;
      await user.save();
    }
  }
}

async function migrerDocumentsChauffeur() {
  const profiles = await ChauffeurProfile.find({});
  console.log(`\n--- Documents chauffeur (${profiles.length} profils) ---`);
  for (const profile of profiles) {
    let profileModifie = false;
    for (const [field, docType] of Object.entries(DOCUMENT_TYPE_BY_FIELD)) {
      const localPath = resolveLocalPath(profile[field]);
      if (!localPath) continue;

      const newUrl = await uploadToCloudinary(localPath, "takataka/documents-chauffeur");
      if (!newUrl) continue;

      console.log(`  ChauffeurProfile ${profile._id} [${field}] : ${profile[field]} → ${newUrl}`);
      if (!DRY_RUN) {
        profile[field] = newUrl;
        profileModifie = true;
        // updateMany plutôt que updateOne : couvre les doublons déjà présents
        // dans la collection Document pour un même (chauffeur, type).
        await Document.updateMany({ chauffeur: profile._id, type: docType }, { fichier: newUrl });
      }
    }
    if (profileModifie) await profile.save();
  }
}

async function migrerPhotosVehiculesLocation() {
  const vehicules = await VehiculeLocation.find({ photos: { $regex: "uploads" } });
  console.log(`\n--- Photos véhicules de location (${vehicules.length} candidats) ---`);
  for (const vehicule of vehicules) {
    let vehiculeModifie = false;
    const nouvellesPhotos = [];

    for (const photo of vehicule.photos || []) {
      const localPath = resolveLocalPath(photo);
      if (!localPath) {
        nouvellesPhotos.push(photo); // déjà une URL externe, on la garde telle quelle
        continue;
      }
      const newUrl = await uploadToCloudinary(localPath, "takataka/locations");
      if (!newUrl) {
        nouvellesPhotos.push(photo);
        continue;
      }
      console.log(`  VehiculeLocation ${vehicule._id} : ${photo} → ${newUrl}`);
      nouvellesPhotos.push(newUrl);
      vehiculeModifie = true;
    }

    if (vehiculeModifie && !DRY_RUN) {
      vehicule.photos = nouvellesPhotos;
      await vehicule.save();
    }
  }
}

function afficherResume() {
  console.log("\n=== Résumé ===");
  console.log(`Fichiers uploadés vers Cloudinary : ${stats.uploaded}`);
  console.log(`Fichiers introuvables sur le disque (ignorés) : ${stats.missingFile}`);

  if (!DRY_RUN && localFilesMigrated.length > 0) {
    console.log(
      `\n${localFilesMigrated.length} fichiers locaux migrés avec succès — PAS supprimés automatiquement.`
    );
    console.log("Vérifie que tout s'affiche bien en production, puis supprime-les manuellement :\n");
    localFilesMigrated.forEach((f) => console.log(`  ${f}`));
  }
}

async function main() {
  console.log(
    DRY_RUN
      ? "🔍 MODE DRY-RUN — aucune écriture en base ni suppression de fichier (relancer avec --execute pour appliquer)"
      : "🚀 MODE EXÉCUTION RÉELLE"
  );

  await mongoose.connect(process.env.MONGODB_URI);

  await migrerPhotosUtilisateurs();
  await migrerDocumentsChauffeur();
  await migrerPhotosVehiculesLocation();

  afficherResume();

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
