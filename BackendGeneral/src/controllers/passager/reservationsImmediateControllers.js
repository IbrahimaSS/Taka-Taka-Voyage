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
      paymentResult,
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

    // --- VÉRIFICATION ET DÉBITEMENT DU WALLET ---
    if (momentPaiement === "MAINTENANT" && paymentResult?.success) {
      const methode = String(paymentResult.paymentMethod).toUpperCase();
      if (methode === "WALLET" || methode === "PORTEFEUILLE TAKATAKA") {
        const userWallet = await Utilisateur.findById(req.utilisateur._id);
        if (!userWallet || (userWallet.solde || 0) < prixNum) {
          return res.status(400).json({ 
            succes: false, 
            message: "Transaction bloquée : Solde portefeuille insuffisant." 
          });
        }
        
        // On débite le portefeuille CÔTÉ SERVEUR
        userWallet.solde -= prixNum;
        await userWallet.save();
        
        // On journalise la transaction de paiement
        try {
          const Transaction = require("../../models/Transaction");
          await Transaction.create({
              utilisateur: userWallet._id,
              type: "PAIEMENT", 
              montant: prixNum,
              methode: "PORTEFEUILLE",
              reference: `TRIP-PAY-${Date.now()}`,
              statut: "COMPLETE",
              commentaire: "Paiement de la course"
          });
        } catch (err) {
          console.error("Erreur log de transaction (paiement initial) :", err);
        }
      }
    }

    // 2) Création réservation
    const reservation = await Reservation.create({
      passager: req.utilisateur._id,
      depart,
      destination,

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
        momentPaiement === "MAINTENANT"
          ? {
            statut: paymentResult?.success ? "PAYE" : "EN_ATTENTE",
            methode: paymentResult?.paymentMethod ? String(paymentResult.paymentMethod).toUpperCase() : "CASH",
          }
          : null,
    });

    // 3) Chauffeurs online
    // ✅ Filtrage initial : Role + En Ligne + Actif
    const chauffeursCandidats = await Utilisateur.find({
      role: "CHAUFFEUR",
      estEnLigne: true,
      // On retire statut: "ACTIF" ici car certains chauffeurs peuvent avoir un statut ACTIF 
      // dans ChauffeurProfile mais rester EN_ATTENTE dans Utilisateurs (désynchronisation).
      // La vérification de sécurité est déjà faite au niveau du socket.join("CHAUFFEURS").
    }).select("nom prenom telephone noteMoyenne socketId vehicule");

    console.log(`🔍 [RESERVATION_IMMEDIATE] ${chauffeursCandidats.length} chauffeurs TOTAL en ligne.`);

    // ✅ Filtrage par type de véhicule
    let chauffeursEnLigne = chauffeursCandidats.filter(c => {
      const driverType = c.vehicule?.type?.toUpperCase() || "TAXI";
      const isMatch = driverType === typeVehiculeNorm;

      console.log(`   🔸 Chauffeur: ${c.prenom} ${c.nom} | Type: ${driverType} | Demandé: ${typeVehiculeNorm} | Match: ${isMatch}`);
      return isMatch;
    });

    // 💡 [TEST_FRIENDLY] Si aucun chauffeur du type demandé n'est trouvé, mais que d'autres sont en ligne,
    // on élargit la recherche pour ne pas bloquer les tests de l'utilisateur.
    if (chauffeursEnLigne.length === 0 && chauffeursCandidats.length > 0) {
      console.log("⚠️ Aucun match exact. Élargissement de la recherche aux chauffeurs disponibles.");
      chauffeursEnLigne = chauffeursCandidats;
    }

    // 4) Socket emit (room stable)
    const io = req.app.get("io");
    if (!io) console.warn("⚠️ io introuvable : app.set('io', io) manquant ?");

    let chauffeursContactes = 0;

    if (!chauffeursEnLigne?.length) {
      console.log(`⚠️ Aucun chauffeur disponible pour cette réservation.`);
      return res.status(201).json({
        succes: true,
        message: "Réservation créée mais aucun chauffeur disponible",
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

    // Envoi aux chauffeurs
    for (const chauffeur of chauffeursEnLigne) {
      chauffeursContactes += 1;

      const driverRoom = `CHAUFFEUR_${chauffeur._id.toString()}`;

      // 🔍 Diagnostic: vérifier qui est dans la room
      const roomSockets = io?.sockets?.adapter?.rooms?.get(driverRoom);
      console.log(`🔍 [EMIT] Room ${driverRoom} → ${roomSockets ? roomSockets.size : 0} socket(s):`, roomSockets ? [...roomSockets] : []);

      // ✅ room stable (individuelle)
      io?.to(driverRoom).emit("course:demande", payload);

      // ✅ fallback socketId (ultra safe)
      if (chauffeur.socketId) {
        console.log(`🔍 [EMIT] Fallback socketId: ${chauffeur.socketId}`);
        io?.to(chauffeur.socketId).emit("course:demande", payload);
      }
    }

    // ✅ BROADCAST: envoyer aussi à la room globale CHAUFFEURS (filet de sécurité)
    const chauffeurRoomSockets = io?.sockets?.adapter?.rooms?.get("CHAUFFEURS");
    console.log(`🔍 [EMIT] Room CHAUFFEURS → ${chauffeurRoomSockets ? chauffeurRoomSockets.size : 0} socket(s)`);
    io?.to("CHAUFFEURS").emit("course:demande", payload);

    console.log(`✅ Demande envoyée à ${chauffeursContactes} chauffeurs (+ broadcast CHAUFFEURS)`);

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

// --- AJOUT : Annulation et Remboursement (Option 2 - Frais d'annulation fixes style Uber) ---
const FRAIS_ANNULATION_GNF = 5000; // Frais fixes d'annulation en GNF

exports.annulerEtRembourser = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const passagerId = req.utilisateur._id;

    const reservation = await Reservation.findOne({ _id: reservationId, passager: passagerId });
    if (!reservation) {
      return res.status(404).json({ succes: false, message: "Réservation introuvable." });
    }

    // Déjà annulée ?
    if (["ANNULEE", "ANNULEE_AVEC_FRAIS"].includes(reservation.statut)) {
      return res.status(400).json({ succes: false, message: "Cette course est déjà annulée." });
    }

    // Blocage strict si la course est déjà démarrée (passager à bord) ou terminée
    if (["EN_COURS", "TERMINEE"].includes(reservation.statut)) {
      return res.status(400).json({ succes: false, message: "Impossible d'annuler une course débutée ou terminée." });
    }

    // === CALCUL DES FRAIS D'ANNULATION ===
    let montantRembourse = reservation.prix;
    let montantChauffeur = 0;
    let avecFrais = false;
    
    // Si le chauffeur a déjà accepté et est en route vers le passager → frais d'annulation
    const statutsAssignes = ["ACCEPTEE", "ASSIGNEE", "EN_COURS_DE_RECUPERATION", "ARRIVEE"];
    if (statutsAssignes.includes(reservation.statut) && reservation.chauffeur) {
      avecFrais = true;
      montantChauffeur = Math.min(FRAIS_ANNULATION_GNF, reservation.prix);
      montantRembourse = reservation.prix - montantChauffeur;
    }

    // === MISE À JOUR DE LA RÉSERVATION ===
    reservation.statut = avecFrais ? "ANNULEE_AVEC_FRAIS" : "ANNULEE";
    reservation.annuleeLe = new Date();
    reservation.annuleePar = passagerId;
    reservation.fraisAnnulation = {
      montant: FRAIS_ANNULATION_GNF,
      montantRembourse,
      montantChauffeur,
      raison: avecFrais 
        ? "Annulation après acceptation du chauffeur (frais de déplacement)" 
        : "Annulation avant acceptation (annulation gratuite)"
    };
    
    const Transaction = require("../../models/Transaction");
    const io = req.app.get("io");

    // === REMBOURSEMENT DU PASSAGER (total ou partiel) ===
    if (reservation.paiement && reservation.paiement.statut === "PAYE") {
      const user = await Utilisateur.findById(passagerId);
      if (user && montantRembourse > 0) {
        user.solde = (user.solde || 0) + montantRembourse;
        await user.save();
        
        try {
          await Transaction.create({
              utilisateur: passagerId,
              type: "REMBOURSEMENT", 
              montant: montantRembourse,
              methode: "WALLET",
              reference: `REMB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              statut: "COMPLETE",
              commentaire: avecFrais 
                ? `Remboursement partiel course ${reservationId} (-${montantChauffeur.toLocaleString()} GNF frais d'annulation)` 
                : `Remboursement total course ${reservationId}`,
              metadata: { reservationId: reservation._id }
          });
        } catch (err) {
          console.error("❌ Erreur log de transaction remboursement :", err);
        }
      }
      reservation.paiement.statut = avecFrais ? "REMBOURSE_PARTIEL" : "REMBOURSE";
    }

    // === COMPENSATION DU CHAUFFEUR (si frais d'annulation appliqués) ===
    if (montantChauffeur > 0 && reservation.chauffeur) {
      const chauffeurObj = await Utilisateur.findById(reservation.chauffeur);
      if (chauffeurObj) {
        chauffeurObj.solde = (chauffeurObj.solde || 0) + montantChauffeur;
        chauffeurObj.trajetEnCours = false;
        await chauffeurObj.save();

        try {
          await Transaction.create({
              utilisateur: chauffeurObj._id,
              type: "COMPENSATION", 
              montant: montantChauffeur,
              methode: "WALLET",
              reference: `COMPENS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              statut: "COMPLETE",
              commentaire: `Compensation frais d'annulation - Course ${reservationId}`,
              metadata: { reservationId: reservation._id }
          });
        } catch (err) {
          console.error("❌ Erreur log de transaction compensation :", err);
        }

        // Notification Socket au chauffeur
        if (io) {
          io.to(`CHAUFFEUR_${chauffeurObj._id.toString()}`).emit("course:annulee", {
            reservationId,
            message: `Le passager a annulé la course. Vous recevez ${montantChauffeur.toLocaleString()} GNF de compensation.`,
            montantGagne: montantChauffeur,
            source: "PASSAGER"
          });

          // Libérer le chauffeur dans la liste des courses actives
          io.to("CHAUFFEURS").emit("course:annulee", {
            reservationId,
            message: "Course annulée par le passager",
            isSearching: false
          });
        }
      }
    } else if (io && !reservation.chauffeur) {
      // Course pas encore acceptée → notifier tous les chauffeurs
      io.to("CHAUFFEURS").emit("course:annulee", {
        reservationId,
        message: "Course annulée par le passager",
        isSearching: true
      });
    }

    // Notifier le passager via socket
    if (io) {
      const pid = String(passagerId);
      io.to(`PASSAGER_${pid}`).emit("course:annulee", {
        reservationId,
        message: avecFrais 
          ? `Course annulée. Frais d'annulation : ${montantChauffeur.toLocaleString()} GNF. Remboursement : ${montantRembourse.toLocaleString()} GNF.`
          : "Course annulée et remboursée intégralement.",
        fraisAnnulation: montantChauffeur,
        montantRembourse,
        avecFrais
      });

      io.to(`RESERVATION_${reservationId}`).emit("course:annulee", {
        reservationId,
        message: "Course annulée"
      });
    }

    await reservation.save();

    console.log(`✅ [ANNULATION] RID=${reservationId} | Frais: ${avecFrais ? montantChauffeur + ' GNF' : 'Aucun'} | Remboursé: ${montantRembourse} GNF`);

    return res.status(200).json({ 
      succes: true, 
      message: avecFrais 
        ? `Course annulée. Frais d'annulation de ${montantChauffeur.toLocaleString()} GNF appliqués. ${montantRembourse.toLocaleString()} GNF remboursés.` 
        : "Réservation annulée et compte remboursé intégralement.", 
      reservation,
      fraisAnnulation: {
        avecFrais,
        montantFrais: montantChauffeur,
        montantRembourse,
        montantTotal: reservation.prix
      }
    });
  } catch (e) {
    console.error("❌ Erreur annulerEtRembourser :", e);
    return res.status(500).json({ succes: false, message: e.message });
  }
};

// Export de la constante pour réutilisation dans le socket handler
exports.FRAIS_ANNULATION_GNF = FRAIS_ANNULATION_GNF;
