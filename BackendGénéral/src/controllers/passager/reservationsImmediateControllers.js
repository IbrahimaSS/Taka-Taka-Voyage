const Reservation = require("../../models/Reservations");
const Utilisateur = require("../../models/Utilisateurs");

// (optionnel) util distance Haversine si tu veux filtrer côté backend
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

exports.confirmerReservationImmediate = async (req, res) => {
  try {
    // ✅ sécurité: seul PASSAGER peut confirmer
    if (!req.utilisateur || req.utilisateur.role !== "PASSAGER") {
      return res.status(403).json({
        succes: false,
        message: "Accès refusé : seul un PASSAGER peut réserver une course.",
      });
    }

    const {
      depart,
      destination,
      departLat,
      departLng,
      destinationLat,
      destinationLng,
      distanceKm,
      dureeMin,
      typeVehicule,
      prix,
      momentPaiement = "MAINTENANT",
    } = req.body;

    // 1) validations minimales
    if (!depart || !destination || !typeVehicule || prix == null) {
      return res.status(400).json({
        succes: false,
        message:
          "Champs requis manquants (depart, destination, typeVehicule, prix)",
      });
    }

    const dLat = Number(departLat);
    const dLng = Number(departLng);
    const aLat = Number(destinationLat);
    const aLng = Number(destinationLng);

    if (
      Number.isNaN(dLat) ||
      Number.isNaN(dLng) ||
      Number.isNaN(aLat) ||
      Number.isNaN(aLng)
    ) {
      return res.status(400).json({
        succes: false,
        message: "Coordonnées GPS invalides (lat/lng doivent être numériques)",
      });
    }

    const prixNum = Number(prix);
    if (Number.isNaN(prixNum) || prixNum <= 0) {
      return res.status(400).json({ succes: false, message: "Prix invalide" });
    }

    const distanceNum = distanceKm != null ? Number(distanceKm) : 0;
    const dureeNum = dureeMin != null ? Number(dureeMin) : 0;

    const typeVehiculeNorm = String(typeVehicule).trim().toUpperCase();

    // 2) Création réservation
    const reservation = await Reservation.create({
      passager: req.utilisateur._id,
      depart: depart,
      departLat: dLat,
      departLng: dLng,
      destination: destination,
      destinationLat: aLat,
      destinationLng: aLng,

      // ✅ GeoJSON = [lng,lat]
      departCoords: { type: "Point", coordinates: [dLng, dLat] },
      destinationCoords: { type: "Point", coordinates: [aLng, aLat] },

      distanceKm: Number.isNaN(distanceNum) ? 0 : distanceNum,
      dureeMin: Number.isNaN(dureeNum) ? 0 : Math.round(dureeNum),

      typeVehicule: typeVehiculeNorm,
      prix: prixNum,
      typeCourse: "IMMEDIATE",
      statut: "EN_ATTENTE",

      paiement:
        momentPaiement === "MAINTENANT" ? { statut: "EN_ATTENTE" } : null,
    });

    // 3) Chauffeurs online
    const chauffeursEnLigne = await Utilisateur.find({
      role: "CHAUFFEUR",
      estEnLigne: true,
      statut: "ACTIF",
    }).select("nom prenom telephone noteMoyenne socketId");

    // 4) Socket emit (room stable)
    const io = req.app.get("io");
    if (!io) console.warn("⚠️ io introuvable : app.set('io', io) manquant ?");

    let chauffeursContactes = 0;

    if (!chauffeursEnLigne?.length) {
      console.log("⚠️ Aucun chauffeur en ligne trouvé pour cette réservation");
      return res.status(201).json({
        succes: true,
        message: "Réservation créée mais aucun chauffeur en ligne",
        reservation,
        chauffeursContactes: 0,
      });
    }

    // ✅ payload EXACT compatible TripNotificationToast + DriverContext
    const payload = {
      id: reservation._id.toString(),
      reservationId: reservation._id.toString(),

      // TripNotificationToast
      passengerName:
        `${req.utilisateur.nom || ""} ${req.utilisateur.prenom || ""}`.trim() ||
        "Passager",
      passengerRating: req.utilisateur.noteMoyenne ?? 4.5,
      passengerPhone: req.utilisateur.telephone || null,

      pickupAddress: depart,
      destinationAddress: destination,

      // DriverContext normalizeCoords() -> Leaflet [lat,lng]
      pickupCoords: [dLat, dLng],
      destinationCoords: [aLat, aLng],

      // TripNotificationToast
      distance: reservation.distanceKm ?? distanceNum ?? 0,
      estimatedTime: `${reservation.dureeMin ?? dureeNum ?? 0} min`,
      estimatedFare: reservation.prix,

      typeVehicule: typeVehiculeNorm,
      nombrePlaces: 1,
      expiresIn: 60,
      createdAt: new Date().toISOString(),
    };

    // Envoi aux chauffeurs et enregistrement des offres
    const offers = [];
    for (const chauffeur of chauffeursEnLigne) {
      chauffeursContactes += 1;
      const chauffeurId = chauffeur._id.toString();

      offers.push({
        chauffeur: chauffeur._id,
        statut: 'ENVOYEE',
        expireLe: new Date(Date.now() + 60000)
      });

      const driverRoom = `CHAUFFEUR_${chauffeurId}`;

      // ✅ room stable
      io?.to(driverRoom).emit("course:demande", payload);

      // ✅ fallback socketId (ultra safe)
      if (chauffeur.socketId) {
        io?.to(chauffeur.socketId).emit("course:demande", payload);
      }
    }

    reservation.offresEnvoyees = offers;
    await reservation.save();

    console.log(`✅ Demande envoyée à ${chauffeursContactes} chauffeurs`);

    return res.status(201).json({
      succes: true,
      message: "Réservation créée, recherche de chauffeur lancée",
      reservation,
      chauffeursContactes,
    });
  } catch (e) {
    console.error("❌ Erreur création réservation immédiate :", e);

    if (e?.name === "ValidationError") {
      return res.status(400).json({
        succes: false,
        message: e.message,
        errors: e.errors,
      });
    }

    return res.status(500).json({
      succes: false,
      message: "Erreur serveur lors de la création de la réservation",
      error: e.message,
    });
  }
};

// ⚠️ optionnel / à supprimer si inutile
exports.rechercherChauffeur = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res
        .status(404)
        .json({ succes: false, message: "Réservation introuvable" });
    }

    reservation.statut = "EN_ATTENTE";
    await reservation.save();

    const io = req.app.get("io");
    if (!io) {
      console.warn("⚠️ io introuvable dans req.app (app.set('io', io) manquant ?)");
    } else {
      // ⚠️ ton front n'écoute pas "chauffeur:nouvelle_course"
      io.emit("chauffeur:nouvelle_course", {
        reservationId: reservation._id.toString(),
        depart: reservation.depart,
        destination: reservation.destination,
      });
    }

    return res.json({
      succes: true,
      message: "Recherche de chauffeur relancée",
    });
  } catch (e) {
    return res.status(500).json({ succes: false, message: e.message });
  }
};
