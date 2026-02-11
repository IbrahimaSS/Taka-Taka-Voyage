const ChauffeurProfile = require("../../models/ChauffeurProfile");
const Document = require("../../models/Documents");
const Utilisateurs = require("../../models/Utilisateurs");
const { deleteFile } = require("../../utils/fileUtils");

const mapTypeVehicule = (type) => {
  const v = String(type || "").toLowerCase();
  if (v === "moto") return "MOTO";
  if (v === "taxi" || v === "taxi_partage" || v === "taxi partagé") return "TAXI_PARTAGE";
  if (v === "voiture" || v === "voiture_privee" || v === "voiture privé" || v === "voiture privée") {
    return "VOITURE";
  }
  return "TAXI_PARTAGE";
};

const ensureProfile = async (userId, typeVehicule) => {
  let profile = await ChauffeurProfile.findOne({ utilisateur: userId });
  if (!profile) {
    profile = await ChauffeurProfile.create({
      utilisateur: userId,
      typeVehicule: typeVehicule || "TAXI_PARTAGE",
    });
  }
  return profile;
};

/* ===================== PROFIL ===================== */

// Afficher mon profil chauffeur
exports.getProfil = async (req, res) => {
  try {
    const utilisateur = req.utilisateur;
    const chauffeurProfile = await ChauffeurProfile.findOne({ utilisateur: utilisateur._id });

    return res.status(200).json({
      succes: true,
      profil: {
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        genre: utilisateur.genre,
        photoUrl: utilisateur.photoUrl || null,
        localisation: utilisateur.localisation || "",

        // Infos véhicule (depuis le profil lié)
        vehicule: {
          type: utilisateur.vehicule?.type || chauffeurProfile?.typeVehicule || "TAXI",
          marque: chauffeurProfile?.marqueVehicule || "",
          modele: chauffeurProfile?.modeleVehicule || "",
          plaque: chauffeurProfile?.plaque || "",
          couleur: chauffeurProfile?.couleurVehicule || "",
          capacite: chauffeurProfile?.capaciteVehicule || 1,
        },

        // Notifications
        notifications: utilisateur.notifications || {
          trajet: true,
          promotionnelles: true,
          sms: false,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

// Modifier le profil chauffeur
exports.updateProfil = async (req, res) => {
  try {
    const userId = req.utilisateur._id;

    const champsAutorises = [
      "nom",
      "prenom",
      "email",
      "telephone",
      "genre",
      "localisation"
    ];

    const donnees = {};
    champsAutorises.forEach((champ) => {
      if (req.body[champ] !== undefined) {
        donnees[champ] = req.body[champ];
      }
    });

    // Gestion de la photo de profil si elle est envoyée
    if (req.file) {
      if (req.utilisateur.photoUrl) {
        deleteFile(req.utilisateur.photoUrl);
      }
      donnees.photoUrl = `/uploads/profiles/${req.file.filename}`;
    }

    // Unicité email / téléphone
    if (donnees.email || donnees.telephone) {
      const existe = await Utilisateurs.findOne({
        _id: { $ne: userId },
        $or: [
          donnees.email ? { email: donnees.email } : null,
          donnees.telephone ? { telephone: donnees.telephone } : null,
        ].filter(Boolean),
      });

      if (existe) {
        return res.status(400).json({
          succes: false,
          message: "Email ou numéro déjà utilisé",
        });
      }
    }

    const utilisateurMisAJour = await Utilisateurs.findByIdAndUpdate(
      userId,
      donnees,
      { new: true, runValidators: true }
    ).select("-motDePasse");

    return res.status(200).json({
      succes: true,
      message: "Profil mis à jour avec succès",
      utilisateur: {
        id: utilisateurMisAJour._id,
        nom: utilisateurMisAJour.nom,
        prenom: utilisateurMisAJour.prenom,
        email: utilisateurMisAJour.email,
        telephone: utilisateurMisAJour.telephone,
        role: utilisateurMisAJour.role,
        genre: utilisateurMisAJour.genre,
        photoUrl: utilisateurMisAJour.photoUrl,
        avatar: utilisateurMisAJour.photoUrl,
        photoProfil: utilisateurMisAJour.photoUrl,
        localisation: utilisateurMisAJour.localisation
      },
    });
  } catch (erreur) {
    return res.status(500).json({
      succes: false,
      message: erreur.message,
    });
  }
};

exports.updateVehicule = async (req, res) => {
  try {
    const { typeVehicule, marque, modele, plaque, couleur, capacite, annee } = req.body || {};

    if (!marque || !plaque) {
      return res.status(400).json({
        succes: false,
        message: "Marque et plaque sont obligatoires",
      });
    }

    const typeFinal = mapTypeVehicule(typeVehicule);
    const profile = await ensureProfile(req.utilisateur._id, typeFinal);

    profile.typeVehicule = typeFinal;
    profile.marqueVehicule = marque;
    profile.modeleVehicule = modele || profile.modeleVehicule;
    profile.plaque = plaque;
    profile.couleurVehicule = couleur || profile.couleurVehicule;
    if (capacite !== undefined && capacite !== null) {
      profile.capaciteVehicule = Number(capacite);
    }
    if (annee !== undefined && annee !== null) {
      profile.anneeVehicule = Number(annee);
    }

    await profile.save();

    await Utilisateurs.findByIdAndUpdate(req.utilisateur._id, {
      vehicule: {
        type: typeFinal === "TAXI_PARTAGE" ? "TAXI" : typeFinal,
        places: profile.capaciteVehicule || 1,
      },
    });

    return res.json({
      succes: true,
      message: "Informations véhicule mises à jour",
      profil: profile,
    });
  } catch (error) {
    return res.status(500).json({ succes: false, message: error.message });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    const files = req.files || {};
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const toUrl = (file) => `${baseUrl}/uploads/${file.filename}`;

    const profile = await ensureProfile(req.utilisateur._id);

    const docsToCreate = [];

    if (files.photo?.[0]) {
      const url = toUrl(files.photo[0]);
      profile.photoVehicule = url;
      docsToCreate.push({ type: "PHOTO_VEHICULE", fichier: url });
    }
    if (files.license?.[0]) {
      const url = toUrl(files.license[0]);
      profile.permisConduire = url;
      docsToCreate.push({ type: "PERMIS", fichier: url });
    }
    if (files.idCard?.[0]) {
      const url = toUrl(files.idCard[0]);
      profile.pieceIdentite = url;
      docsToCreate.push({ type: "IDENTITE", fichier: url });
    }
    if (files.carRegistration?.[0]) {
      const url = toUrl(files.carRegistration[0]);
      profile.carteGrise = url;
      docsToCreate.push({ type: "CARTE_GRISE", fichier: url });
    }
    if (files.insurance?.[0]) {
      const url = toUrl(files.insurance[0]);
      profile.assurance = url;
      docsToCreate.push({ type: "ASSURANCE", fichier: url });
    }

    await profile.save();

    if (docsToCreate.length > 0) {
      await Promise.all(
        docsToCreate.map((doc) =>
          Document.findOneAndUpdate(
            { chauffeur: profile._id, type: doc.type },
            { fichier: doc.fichier, statut: "VERIFIER" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          )
        )
      );
    }

    return res.json({
      succes: true,
      message: "Documents enregistrés",
      profil: profile,
    });
  } catch (error) {
    return res.status(500).json({ succes: false, message: error.message });
  }
};
