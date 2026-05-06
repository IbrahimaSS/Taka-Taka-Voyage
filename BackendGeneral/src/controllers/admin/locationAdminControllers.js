const VehiculeLocation = require("../../models/VehiculeLocation");
const Location = require("../../models/Location");
const Utilisateur = require("../../models/Utilisateurs");
const Notification = require("../../models/Notifications");
const Transaction = require("../../models/Transaction");

/**
 * @desc    Ajouter un nouveau véhicule à la flotte
 * @route   POST /api/admin/locations/vehicules
 */
exports.ajouterVehicule = async (req, res) => {
  try {
    const donneesForm = req.body;

    // Si la photo a été téléchargée
    if (req.file) {
      donneesForm.photos = [req.file.path.replace(/\\/g, "/")];
    }

    // Gérer les objets imbriqués si envoyés en string (commun en multipart)
    if (typeof donneesForm.caracteristiques === 'string') {
      donneesForm.caracteristiques = JSON.parse(donneesForm.caracteristiques);
    }

    const nouveauVehicule = new VehiculeLocation(donneesForm);
    await nouveauVehicule.save();

    // Notification Temps Réel via Socket.io (Diffusion Globale)
    const io = req.app.get("io");
    if (io) {
      io.emit("vehicule:nouveau", {
        message: " ✨ Nouveau véhicule ajouté au Garage !",
        vehicule: nouveauVehicule
      });
    }

    res.status(201).json({
      succes: true,
      message: "Véhicule ajouté avec succès à la flotte Baraka Trans",
      donnees: nouveauVehicule,
    });
  } catch (error) {
    res.status(400).json({
      succes: false,
      message: "Erreur lors de l'ajout du véhicule",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Lister tous les véhicules de la flotte
 * @route   GET /api/admin/locations/vehicules
 */
exports.getTousLesVehicules = async (req, res) => {
  try {
    const { categorie, statut } = req.query;
    let filtre = {};

    if (categorie) filtre.categorie = categorie;
    if (statut) filtre.statut = statut;

    const vehicules = await VehiculeLocation.find(filtre).sort("-createdAt");

    res.status(200).json({
      succes: true,
      nb: vehicules.length,
      donnees: vehicules,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la récupération de la flotte",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Obtenir les détails d'un véhicule
 * @route   GET /api/admin/locations/vehicules/:id
 */
exports.getVehiculeById = async (req, res) => {
  try {
    const vehicule = await VehiculeLocation.findById(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ succes: false, message: "Véhicule introuvable" });
    }
    res.status(200).json({ succes: true, donnees: vehicule });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Modifier un véhicule (prix, statut, etc.)
 * @route   PUT /api/admin/locations/vehicules/:id
 */
exports.modifierVehicule = async (req, res) => {
  try {
    const donneesUpdate = req.body;

    if (req.file) {
      donneesUpdate.photos = [req.file.path.replace(/\\/g, "/")];
    }

    if (typeof donneesUpdate.caracteristiques === 'string') {
      donneesUpdate.caracteristiques = JSON.parse(donneesUpdate.caracteristiques);
    }

    const vehicule = await VehiculeLocation.findByIdAndUpdate(
      req.params.id,
      donneesUpdate,
      { new: true, runValidators: true }
    );

    if (!vehicule) {
      return res.status(404).json({ succes: false, message: "Véhicule introuvable" });
    }

    res.status(200).json({
      succes: true,
      message: "Véhicule mis à jour",
      donnees: vehicule,
    });
  } catch (error) {
    res.status(400).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Supprimer un véhicule de la flotte
 * @route   DELETE /api/admin/locations/vehicules/:id
 */
exports.supprimerVehicule = async (req, res) => {
  try {
    const vehicule = await VehiculeLocation.findById(req.params.id);
    if (!vehicule) {
      return res.status(404).json({ succes: false, message: "Véhicule introuvable" });
    }

    // On pourrait vérifier si le véhicule est actuellement loué avant de supprimer
    if (vehicule.statut === "EN_LOCATION") {
      return res.status(400).json({
        succes: false,
        message: "Impossible de supprimer un véhicule actuellement en location",
      });
    }

    await vehicule.deleteOne();
    res.status(200).json({ succes: true, message: "Véhicule supprimé de la flotte" });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/* ╔════════════════════════════════════════════════════════════╗
   ║         GESTION DES RÉSERVATIONS (ADMIN)                 ║
   ╚════════════════════════════════════════════════════════════╝ */

/**
 * @desc    Lister toutes les réservations de location
 * @route   GET /api/admin/locations/reservations
 */
exports.getReservations = async (req, res) => {
  try {
    const { statut } = req.query;
    let filtre = {};
    if (statut) filtre.statut = statut;

    const reservations = await Location.find(filtre)
      .populate("client", "nom prenom email telephone photoUrl")
      .populate("vehicule", "marque modele categorie photos prix_jour immatriculation")
      .sort("-createdAt");

    res.status(200).json({
      succes: true,
      nb: reservations.length,
      donnees: reservations,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la récupération des réservations",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Approuver une réservation de location
 * @route   PUT /api/admin/locations/reservations/:id/approuver
 */
exports.approuverReservation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate("vehicule", "marque modele");

    if (!location) {
      return res.status(404).json({ succes: false, message: "Réservation introuvable" });
    }

    if (location.statut !== "EN_ATTENTE") {
      return res.status(400).json({ succes: false, message: "Cette réservation a déjà été traitée" });
    }

    // 1. Mettre à jour le statut de la réservation
    location.statut = "APPROUVÉE";
    await location.save();

    // 2. Passer le véhicule en statut "EN_LOCATION"
    await VehiculeLocation.findByIdAndUpdate(location.vehicule._id || location.vehicule, {
      statut: "EN_LOCATION"
    });

    // 3. Notifier le client en temps réel
    const io = req.app.get("io");
    if (io) {
      io.to(`USER_${location.client}`).emit("location:statut_change", {
        message: `✅ Votre réservation ${location.reference} a été approuvée !`,
        locationId: location._id,
        statut: "APPROUVÉE"
      });
    }

    // 4. Enregistrer la notification en base
    await Notification.create({
      utilisateur: location.client,
      message: `Votre réservation ${location.reference} pour ${location.vehicule.marque} ${location.vehicule.modele} a été approuvée. Vous pouvez récupérer le véhicule.`
    });

    res.status(200).json({
      succes: true,
      message: "Réservation approuvée avec succès",
      donnees: location,
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Marquer le début de la location (remise des clés)
 * @route   PUT /api/admin/locations/reservations/:id/demarrer
 */
exports.demarrerLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ succes: false, message: "Location introuvable" });
    }

    if (location.statut !== "APPROUVÉE") {
      return res.status(400).json({ succes: false, message: "Seule une réservation approuvée peut être démarrée." });
    }

    location.statut = "EN_COURS";
    location.date_debut_reelle = new Date();
    await location.save();

    // --- AUTOMATISATION CHAUFFEUR ---
    // Si c'est un chauffeur, on lie automatiquement le véhicule à son profil de travail
    const client = await Utilisateur.findById(location.client);
    if (client && client.role === "CHAUFFEUR") {
      const vehiculeData = await VehiculeLocation.findById(location.vehicule);
      if (vehiculeData) {
        client.vehicule = {
          type: "VOITURE", // Par défaut, ou mapper selon la catégorie
          marque: vehiculeData.marque,
          modele: vehiculeData.modele,
          immatriculation: vehiculeData.immatriculation,
          couleur: "Inconnue", // Pas dans le modèle de location par défaut
          places: vehiculeData.capacite || 4
        };
        await client.save();
      }
    }
    // -------------------------------

    // Notifier le client
    const io = req.app.get("io");
    if (io) {
      const clientId = location.client._id || location.client;
      io.to(`USER_${clientId}`).emit("location:statut_change", {
        message: `🚗 Votre location ${location.reference} a démarré. Bonne route !`,
        locationId: location._id,
        statut: "EN_COURS"
      });
    }

    res.status(200).json({
      succes: true,
      message: "La location a démarré avec succès",
      donnees: location,
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Confirmer le retour, clôturer la location et rembourser la caution
 * @route   PUT /api/admin/locations/:id/confirmer-retour
 */
exports.confirmerRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id).populate("client");

    if (!location) {
      return res.status(404).json({ succes: false, message: "Location introuvable" });
    }

    // Vérifier le statut
    if (location.statut === "TERMINÉE") {
      return res.status(400).json({ succes: false, message: "Cette location est déjà terminée." });
    }

    if (location.statut !== "EN_COURS" && location.statut !== "RETOUR_SIGNALÉ") {
      return res.status(400).json({ 
        succes: false, 
        message: "Impossible de confirmer le retour : la location doit être 'En cours' ou 'Retour signalé'." 
      });
    }

    // 1. Rembourser la caution (soldeGelé -> solde)
    const client = await Utilisateur.findById(location.client._id);
    if (client && location.caution_bloquee > 0) {
      client.soldeGele -= location.caution_bloquee;
      client.solde += location.caution_bloquee;
      await client.save();

      // Enregistrer la transaction de remboursement
      await Transaction.create({
        utilisateur: client._id,
        type: "CAUTION_LOCATION",
        montant: location.caution_bloquee,
        methode: "WALLET",
        statut: "COMPLETE",
        commentaire: `Remboursement caution - Retour confirmé pour ${location.reference}`,
        metadata: { reservationId: location._id }
      });
    }

    // 2. Mettre à jour la location
    location.statut = "TERMINÉE";
    location.date_retour_reelle = new Date();
    await location.save();

    // --- NETTOYAGE CHAUFFEUR ---
    // Si c'est un chauffeur, on retire le véhicule de son profil de travail via $unset
    const clientIdToUpdate = location.client._id || location.client;
    await Utilisateur.findByIdAndUpdate(clientIdToUpdate, { 
      $unset: { vehicule: 1 } 
    });
    // --------------------------

    // 3. Remettre le véhicule en DISPONIBLE
    await VehiculeLocation.findByIdAndUpdate(location.vehicule, { statut: "DISPONIBLE" });

    // 4. Notifier le client
    const io = req.app.get("io");
    if (io) {
      io.to(`USER_${location.client._id}`).emit("location:statut_change", {
        message: `✅ Votre retour pour ${location.reference} a été confirmé. La caution a été remboursée sur votre solde.`,
        locationId: location._id,
        statut: "TERMINÉE"
      });
    }

    res.status(200).json({ 
      succes: true, 
      message: "Location terminée et caution remboursée avec succès" 
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Refuser une réservation et rembourser la caution
 * @route   PUT /api/admin/locations/reservations/:id/refuser
 */
exports.refuserReservation = async (req, res) => {
  try {
    const { motif } = req.body;
    const location = await Location.findById(req.params.id)
      .populate("vehicule", "marque modele");

    if (!location) {
      return res.status(404).json({ succes: false, message: "Réservation introuvable" });
    }

    if (location.statut !== "EN_ATTENTE") {
      return res.status(400).json({ succes: false, message: "Cette réservation a déjà été traitée" });
    }

    // 1. Rembourser la caution (soldeGelé → solde) ET le montant de location
    const client = await Utilisateur.findById(location.client);
    if (client) {
      // Remboursement de la caution
      if (location.caution_bloquee > 0) {
        client.soldeGele -= location.caution_bloquee;
        client.solde += location.caution_bloquee;
      }

      // Remboursement du prix de la location (déjà prélevé lors de la réservation)
      if (location.montant_total > 0) {
        client.solde += location.montant_total;
      }

      await client.save();

      // Enregistrer la transaction de remboursement globale
      const remboursementTotal = (location.caution_bloquee || 0) + (location.montant_total || 0);
      if (remboursementTotal > 0) {
        await Transaction.create({
          utilisateur: client._id,
          type: "REMBOURSEMENT_LOCATION",
          montant: remboursementTotal,
          methode: "WALLET",
          statut: "COMPLETE",
          commentaire: `Remboursement complet (Caution + Location) - Réservation ${location.reference} refusée`,
          metadata: { reservationId: location._id }
        });
      }
    }

    // 2. Mettre à jour le statut
    location.statut = "ANNULÉE";
    location.notes_admin = motif || "Refusée par l'administrateur";
    await location.save();

    // 3. Notifier le client en temps réel
    const io = req.app.get("io");
    if (io) {
      const clientId = location.client._id || location.client;
      io.to(`USER_${clientId}`).emit("location:statut_change", {
        message: `❌ Votre réservation ${location.reference} a été refusée. Votre caution a été remboursée.`,
        locationId: location._id,
        statut: "ANNULÉE"
      });
    }

    // 4. Enregistrer la notification en base
    await Notification.create({
      utilisateur: location.client._id || location.client,
      message: `Votre réservation ${location.reference} a été refusée. ${location.caution_bloquee > 0 ? 'Votre caution a été remboursée sur votre Wallet.' : ''}`
    });

    res.status(200).json({
      succes: true,
      message: "Réservation refusée et caution remboursée",
      donnees: location,
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

exports.supprimerReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({ succes: false, message: "Réservation introuvable" });
    }

    res.status(200).json({
      succes: true,
      message: "Réservation supprimée avec succès",
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};
