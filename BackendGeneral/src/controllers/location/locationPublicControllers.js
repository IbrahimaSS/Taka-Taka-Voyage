const VehiculeLocation = require("../../models/VehiculeLocation");
const Location = require("../../models/Location");
const Utilisateur = require("../../models/Utilisateurs");
const Notification = require("../../models/Notifications");
const Transaction = require("../../models/Transaction");

/**
 * @desc    Lister les véhicules disponibles pour les clients
 * @route   GET /api/public/locations/vehicules
 * @access  Public
 */
exports.getVehiculesPublics = async (req, res) => {
  try {
    const { categorie } = req.query;
    let filtre = { statut: "DISPONIBLE" };

    if (categorie) {
      filtre.categorie = categorie;
    }

    const vehicules = await VehiculeLocation.find(filtre).sort("-createdAt");

    res.status(200).json({
      succes: true,
      nb: vehicules.length,
      donnees: vehicules,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Erreur lors de la récupération des véhicules",
      erreur: error.message,
    });
  }
};

/**
 * @desc    Obtenir les détails d'un véhicule spécifique
 * @route   GET /api/public/locations/vehicules/:id
 * @access  Public
 */
exports.getVehiculeDetails = async (req, res) => {
  try {
    const vehicule = await VehiculeLocation.findById(req.params.id);
    if (!vehicule || vehicule.statut === "RETIRE") {
      return res.status(404).json({
        succes: false,
        message: "Véhicule introuvable ou indisponible",
      });
    }

    res.status(200).json({
      succes: true,
      donnees: vehicule,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      erreur: error.message,
    });
  }
};

/**
 * @desc    Soumettre une demande de réservation de location
 * @route   POST /api/locations/reserver
 * @access  Privé (Passager)
 */
exports.creerReservation = async (req, res) => {
  try {
    const { vehiculeId, date_debut, date_fin, type_usage } = req.body;
    const clientId = req.utilisateur.id;

    // 1. Charger les infos du client et du véhicule
    const client = await Utilisateur.findById(clientId);
    const vehicule = await VehiculeLocation.findById(vehiculeId);

    if (!vehicule) {
      return res.status(404).json({ succes: false, message: "Véhicule introuvable" });
    }

    if (vehicule.statut === "RETIRE") {
      return res.status(400).json({ succes: false, message: "Ce véhicule n'est plus disponible dans notre flotte." });
    }

    // 1b. VÉRIFICATION DE DISPONIBILITÉ PAR DATES (Anti-chevauchement)
    const debut = new Date(date_debut);
    const fin = new Date(date_fin);

    const conflit = await Location.findOne({
      vehicule: vehiculeId,
      statut: { $in: ["EN_ATTENTE", "APPROUVÉE", "EN_COURS"] },
      $or: [
        { date_debut: { $lte: fin }, date_fin_prevue: { $gte: debut } }
      ]
    });

    if (conflit) {
      return res.status(400).json({
        succes: false,
        message: "Ce véhicule est déjà réservé ou loué pour cette période. Veuillez choisir d'autres dates ou un autre véhicule."
      });
    }

    // 2. Calculer la durée (en jours)
    const diffTemps = Math.abs(fin - debut);
    const nbJours = Math.ceil(diffTemps / (1000 * 60 * 60 * 24)) || 1;

    // 3. Calculer les montants
    const montant_total = nbJours * vehicule.prix_jour;
    const cautionNecessaire = vehicule.caution || 0;
    const montantGlobal = montant_total + cautionNecessaire;

    // 4. VÉRIFICATION FINANCIÈRE (Location + Caution)
    if (client.solde < montantGlobal) {
      return res.status(400).json({
        succes: false,
        message: `Solde insuffisant. Il vous faut ${new Intl.NumberFormat('fr-GN').format(montantGlobal)} GNF (Location: ${new Intl.NumberFormat('fr-GN').format(montant_total)} GNF + Caution: ${new Intl.NumberFormat('fr-GN').format(cautionNecessaire)} GNF).`
      });
    }

    // 6. Générer une référence unique
    const dateRef = new Date();
    const timestamp = dateRef.getFullYear().toString() + (dateRef.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const reference = `LOC-${timestamp}-${random}`;

    // 7. Créer la location
    const nouvelleLocation = new Location({
      reference,
      client: clientId,
      vehicule: vehiculeId,
      date_debut: debut,
      date_fin_prevue: fin,
      type_usage,
      montant_total,
      caution_bloquee: cautionNecessaire,
      statut: "EN_ATTENTE"
    });

    await nouvelleLocation.save();

    // 8. PAIEMENT ET BLOCAGE DE LA CAUTION
    client.solde -= montantGlobal; // On prélève le coût de la location + la caution
    client.soldeGele += cautionNecessaire; // Seule la caution est gelée (pour être remboursée)
    await client.save();

    // 8b. ENREGISTRER LA TRANSACTION DANS L'HISTORIQUE
    await Transaction.create({
      utilisateur: clientId,
      type: "PAIEMENT_LOCATION",
      montant: -montantGlobal, // Négatif car c'est une sortie du solde principal
      methode: "WALLET",
      statut: "COMPLETE",
      commentaire: `Paiement location (${montant_total} GNF) et blocage caution (${cautionNecessaire} GNF) pour ${reference}`,
      metadata: {
        reservationId: nouvelleLocation._id
      }
    });

    // 7. NOTIFICATIONS (Temps Réel + Base de données)
    const io = req.app.get("io");
    if (io) {
      // Envoyer à tous les admins connectés
      io.to("ADMINS").emit("location:nouvelle_demande", {
        message: `🚗 Nouvelle demande de location pour le véhicule ${vehicule.marque} ${vehicule.modele}`,
        locationId: nouvelleLocation._id,
        client: `${client.prenom} ${client.nom}`,
        reference: nouvelleLocation.reference
      });
    }

    // Enregistrer la notification en base pour tous les admins
    const admins = await Utilisateur.find({ role: "ADMIN" });
    const notifications = admins.map(admin => ({
      utilisateur: admin._id,
      message: `Nouvelle demande de location ${nouvelleLocation.reference} par ${client.prenom} ${client.nom}`
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({
      succes: true,
      message: "Demande de réservation envoyée ! Votre caution a été sécurisée sur votre Wallet.",
      donnees: nouvelleLocation
    });

  } catch (error) {
    res.status(500).json({
      succes: false,
      message: error.message || "Erreur technique lors de la réservation",
      erreur: error
    });
  }
};

/**
 * @desc    Signaler le retour d'un véhicule par le client
 * @route   POST /api/public/locations/:id/signaler-retour
 */
exports.signalerRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findOne({ _id: id, client: req.utilisateur.id });

    if (!location) {
      return res.status(404).json({ succes: false, message: "Location introuvable" });
    }

    if (location.statut !== "EN_COURS") {
      return res.status(400).json({ succes: false, message: "Impossible de signaler le retour pour une location qui n'est pas en cours." });
    }

    location.statut = "RETOUR_SIGNALÉ";
    await location.save();

    // Notifier les admins en temps réel
    const io = req.app.get("io");
    if (io) {
      io.to("ADMINS").emit("location:retour_signale", {
        message: `🏁 Retour signalé pour la location ${location.reference}`,
        locationId: location._id,
        reference: location.reference
      });
    }

    res.status(200).json({ 
      succes: true, 
      message: "Retour signalé avec succès. L'administrateur va vérifier le véhicule." 
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};

/**
 * @desc    Lister les réservations du passager connecté
 * @route   GET /api/public/locations/mes-reservations
 */
exports.getMesReservations = async (req, res) => {
  try {
    const reservations = await Location.find({ client: req.utilisateur.id })
      .populate("vehicule")
      .sort("-createdAt");

    res.status(200).json({
      succes: true,
      donnees: reservations
    });
  } catch (error) {
    res.status(500).json({ succes: false, erreur: error.message });
  }
};
