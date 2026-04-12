const Notification = require("./models/Notifications");
const Reservation = require("./models/Reservations");
const Utilisateurs = require("./models/Utilisateurs");
const ChauffeurProfile = require("./models/ChauffeurProfile");
const Trajet = require("./models/Trajets");
const Paiement = require("./models/Paiements");
const TaxiPartageService = require("./services/taxiPartageService");
const GroupeTaxiPartage = require("./models/GroupeTaxiPartage");
const ticketController = require("./controllers/common/ticketController");
const { logActivity } = require("./utils/logger");

// Anti double accept (mémoire)
// ⚠️ TODO [PRODUCTION] : Ces locks mémoire sont perdus au redémarrage du serveur
// et ne fonctionnent pas en multi-instance. → Migrer vers Redis (SET/GET) pour
// un lock distribué fiable en production.
const coursesPrises = new Set();   // reservationId acceptée (lock mémoire)
const courseChauffeur = new Map(); // reservationId -> socket.id chauffeur
const socketToReservations = new Map(); // socket.id -> Set(reservationId)
const lastKnownPositions = new Map(); // reservationId -> { lat, lng, heading, speed, timestamp }

function trackReservationForSocket(socketId, reservationId) {
  if (!socketToReservations.has(socketId)) socketToReservations.set(socketId, new Set());
  socketToReservations.get(socketId).add(String(reservationId));
}

function untrackReservationForSocket(socketId, reservationId) {
  const set = socketToReservations.get(socketId);
  if (!set) return;
  set.delete(String(reservationId));
  if (set.size === 0) socketToReservations.delete(socketId);
}

function releaseReservationLock(reservationId) {
  const rid = String(reservationId);
  coursesPrises.delete(rid);
  lastKnownPositions.delete(rid);
  const sId = courseChauffeur.get(rid);
  courseChauffeur.delete(rid);
  if (sId) untrackReservationForSocket(sId, rid);
}

// ✅ [SYNC] Rappel J-1 automatique
async function checkPlannedReminders(io) {
  try {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);

    const checkTime = new Date();

    // On cherche les réservations :
    // - Planifiées et Acceptées
    // - Date prévue <= Demain
    // - Pas encore de rappel envoyé
    const upcoming = await Reservation.find({
      typeCourse: "PLANIFIEE",
      statut: "ACCEPTEE",
      datePlanifiee: { $lte: demain, $gt: checkTime },
      notificationJ1Envoyee: false
    });

    if (upcoming.length > 0) {
      console.log(`⏰ [RAPPEL J-1] Envoi de ${upcoming.length} rappels...`);
    }

    for (const res of upcoming) {
      const cid = String(res.chauffeur);
      const driverRoom = `CHAUFFEUR_${cid}`;

      // 1. Notification visuelle/sonore via course:demande (réutilisée pour le modal)
      // On personnalise un peu le message si besoin
      io.to(driverRoom).emit("course:demande", {
        id: res._id.toString(),
        reservationId: res._id.toString(),
        isRappel: true,
        message: "🔔 Rappel : Votre course planifiée approche (J-1)",
        pickupAddress: res.depart,
        destinationAddress: res.destination,
        datePlanifiee: res.datePlanifiee,
        typeCourse: "PLANIFIEE"
      });

      // 2. Notif spécifique pour l'alerte sonore si besoin d'un autre canal
      io.to(driverRoom).emit("reservation:rappel_j1", {
        reservationId: res._id,
        message: "Votre trajet planifié est maintenant dans votre liste de ramassage."
      });

      // 3. Marquer comme envoyé
      res.notificationJ1Envoyee = true;
      await res.save();
    }
  } catch (err) {
    console.error("❌ checkPlannedReminders:", err.message);
  }
}

module.exports = (io) => {
  // Lancer le timer de rappel toutes les 5 minutes
  setInterval(() => checkPlannedReminders(io), 5 * 60 * 1000);

  io.on("connection", async (socket) => {
    console.log(`🟢 Socket connecté : ${socket.id}`);
    console.log("   → Auth:", socket.handshake.auth);

    // ✅ FIX MAJEUR: join rooms IMMÉDIATEMENT (évite de rater course:acceptee)
    try {
      const { userId, role, nom = "", prenom = "" } = socket.handshake.auth || {};
      if (userId && role) {
        const ROLE = String(role).toUpperCase();
        socket.user = { id: userId, role: ROLE, nom, prenom };

        const sid = String(userId);
        const roomMain = `${ROLE}_${sid}`;
        const roomUser = `USER_${sid}`;

        socket.join(roomMain);
        socket.join(roomUser);
        
        // Room individuelle additionnelle pour compatibilité backend
        if (ROLE === "CHAUFFEUR") {
          socket.join(`CHAUFFEUR_${sid}`);
        } else if (ROLE === "PASSAGER") {
          socket.join(`PASSAGER_${sid}`);
          socket.join("PASSAGERS"); // ✅ Pour les diffusions de groupe
        }

        // ✅ Join specific functional rooms based on role
        if (ROLE === "CHAUFFEUR") {
          try {
            const profil = await ChauffeurProfile.findOne({ utilisateur: userId }).select("statut");
            if (profil && profil.statut === "ACTIF") {
              socket.join("CHAUFFEURS");
              console.log(`✅ [SOCKET_CONNECT] Chauffeur ACTIF (${userId}) a rejoint la room CHAUFFEURS`);
            } else {
              socket.join(`ATTENTE_${sid}`);
              // Alerter immédiatement le client qu'il est connecté mais bloqué
              socket.emit("client:online:blocked", {
                message: "Votre compte est en attente de validation. Accès aux courses bloqué.",
                statut: profil?.statut || "EN_ATTENTE"
              });
              console.log(`⏳ [SOCKET_CONNECT] Chauffeur EN_ATTENTE (${userId}) - accès aux courses bloqué`);
            }
          } catch (profileErr) {
            console.error("❌ [SOCKET_CONNECT] Erreur vérification profil chauffeur:", profileErr.message);
          }
        } else if (ROLE === "ADMIN") {
          socket.join("ADMINS");
        }

        console.log(`✅ [SOCKET_CONNECT] Rooms jointes pour ${ROLE} (${userId}): ${roomMain}, ${roomUser}`);
      }
    } catch (e) {
      console.error("❌ join rooms on connect:", e.message);
    }

    // ────────────────────────────────────────────────
    // 0) Online / identification + DB update + rooms
    // ────────────────────────────────────────────────
    socket.on("client:online", async ({ role, userId, nom, prenom }) => {
      try {
        if (!role || !userId) return;

        const ROLE = String(role).toUpperCase();
        socket.user = { id: userId, role: ROLE, nom, prenom };

        // Rooms personnelles stables (idempotent)
        const sid = String(userId);
        socket.join(`${ROLE}_${sid}`);
        socket.join(`USER_${sid}`);
        
        if (ROLE === "PASSAGER") {
          socket.join("PASSAGERS");
        } else if (ROLE === "ADMIN") {
          socket.join("ADMINS");
        }

        const updated = await Utilisateurs.findByIdAndUpdate(
          userId,
          { estEnLigne: true, socketId: socket.id, derniereConnexion: new Date() },
          { new: true }
        );

        // Si c'est un chauffeur, on initialise son temps de session dans ChauffeurProfile
        if (ROLE === "CHAUFFEUR") {
          // 🔒 Vérifier le statut avant d'autoriser dans la room des courses
          const profil = await ChauffeurProfile.findOne({ utilisateur: userId }).select("statut");
          if (profil && profil.statut === "ACTIF") {
            socket.join("CHAUFFEURS");
            await ChauffeurProfile.findOneAndUpdate(
              { utilisateur: userId },
              { disponibilite: "EN_LIGNE", disponibiliteDepuis: new Date() },
              { upsert: true }
            );
          } else {
            // Chauffeur EN_ATTENTE : ne pas rejoindre la room des courses
            socket.join(`ATTENTE_${sid}`);
            socket.emit("client:online:blocked", {
              message: "Votre compte est en attente de validation. Accès aux courses bloqué.",
              statut: profil?.statut || "EN_ATTENTE"
            });
            console.log(`⏳ [SOCKET] Chauffeur EN_ATTENTE (${userId}) - room CHAUFFEURS refusée`);
          }
        }

        console.log("✅ client online DB:", {
          userId,
          role: ROLE,
          estEnLigne: updated?.estEnLigne,
          socketId: updated?.socketId,
        });

        socket.emit("client:online:ok", {
          message: "Connecté avec succès",
          room: `${ROLE}_${userId}`,
          socketId: socket.id,
        });
      } catch (e) {
        console.error("❌ Erreur client:online:", e.message);
      }
    });

    // ────────────────────────────────────────────────
    // 0b) Join room de suivi reservation
    // ────────────────────────────────────────────────
    socket.on("reservation:join", async ({ reservationId } = {}) => {
      try {
        if (!reservationId) return;

        const reservation = await Reservation.findById(reservationId).select("passager chauffeur statut");
        if (!reservation) return;

        const uid = socket.user?.id;
        const role = socket.user?.role;

        const isPassengerOwner =
          uid && String(reservation.passager) === String(uid) && role === "PASSAGER";

        const isDriverOwner =
          uid && reservation.chauffeur && String(reservation.chauffeur) === String(uid) && role === "CHAUFFEUR";

        const isAdmin = role === "ADMIN";

        if (!isPassengerOwner && !isDriverOwner && !isAdmin) {
          console.log(`🚫 [SOCKET] Join refused for rid=${reservationId} (uid=${uid}, role=${role})`);
          return socket.emit("reservation:join:refused", { reservationId, message: "Non autorisé" });
        }

        // ✅ FIX Tracking: S'assurer que le chauffeur est tjrs lié à cette course dans la map
        if (isDriverOwner) {
          console.log(`🔗 [SOCKET] Link chauffeur ${uid} to reservation ${reservationId}`);
          courseChauffeur.set(String(reservationId), socket.id);
        }

        socket.log_prefix = `[SOCKET][${role}][${uid}]`;
        socket.join(`RESERVATION_${reservationId}`);
        console.log(`${socket.log_prefix} joined room RESERVATION_${reservationId}`);

        // ✅ FIX TRACKING: Envoyer la dernière position connue immédiatement (utile pour l'admin qui se connecte en retard)
        const lastPos = lastKnownPositions.get(String(reservationId));
        if (lastPos) {
          console.log(`${socket.log_prefix} sending last known position for room join`);
          socket.emit("position:chauffeur", {
            ...lastPos,
            reservationId: String(reservationId)
          });
        }

        // Check room status
        const room = io.sockets.adapter.rooms.get(`RESERVATION_${reservationId}`);
        const count = room ? room.size : 0;
        console.log(`ℹ️ [SOCKET] Room RESERVATION_${reservationId} size: ${count}`);

        socket.emit("reservation:join:ok", { reservationId });
      } catch (e) {
        console.error("❌ reservation:join error:", e.message);
        socket.emit("reservation:join:refused", { reservationId, message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 1) Chauffeur accepte
    // ────────────────────────────────────────────────
    socket.on("course:accepter", async ({ reservationId } = {}) => {
      const rid = String(reservationId || "");
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") {
          return socket.emit("course:acceptee_echec", { message: "Chauffeur non authentifié" });
        }
        if (!rid) {
          return socket.emit("course:acceptee_echec", { message: "reservationId manquant" });
        }

        if (coursesPrises.has(rid)) {
          return socket.emit("course:deja_prise", { message: "Course déjà acceptée" });
        }

        // Lock mémoire
        coursesPrises.add(rid);
        courseChauffeur.set(rid, socket.id);
        trackReservationForSocket(socket.id, rid);

        const reservation = await Reservation.findById(rid).populate("passager");
        if (!reservation || reservation.statut !== "EN_ATTENTE") {
          releaseReservationLock(rid);
          return socket.emit("course:acceptee_echec", { message: "Course non disponible" });
        }

        // DB update
        reservation.chauffeur = socket.user.id;
        reservation.statut = "ACCEPTEE";
        await reservation.save();
        await Utilisateurs.findByIdAndUpdate(socket.user.id, { trajetEnCours: true });

        // Room de suivi
        socket.join(`RESERVATION_${rid}`);

        await Notification.create({
          utilisateur: reservation.passager._id,
          message: "✅ Un chauffeur a accepté votre course ! 🚖",
        });

        const pid = String(reservation.passager._id);
        const chauffeurDoc = await Utilisateurs.findById(socket.user.id);
        const chauffeurProfile = await ChauffeurProfile.findOne({ utilisateur: socket.user.id });

        // ✅ Gérer le taxi partagé si nécessaire (Liaison à un groupe)
        let groupeId = null;
        if (reservation.typeVehicule === "TAXI_PARTAGE" || reservation.typeCourse === "TAXI_PARTAGE") {
          try {
            const tpResult = await TaxiPartageService.creerOuAjouterGroupe(reservation, socket.user.id);
            if (tpResult.succes) {
              groupeId = tpResult.groupe._id;
              console.log(`🚕 Passager ${pid} ajouté au groupe ${groupeId}`);
            }
          } catch (tpErr) {
            console.error("⚠️ Erreur ajout groupe taxi partagé:", tpErr.message);
            // On continue quand même l'acceptation simple
          }
        }

        // Normalisation ultra-robuste du véhicule (Backend -> Frontend)
        const vehicleInfo = {
          marque: chauffeurDoc?.vehicule?.marque || chauffeurProfile?.marqueVehicule || "N/A",
          modele: chauffeurDoc?.vehicule?.modele || chauffeurProfile?.modeleVehicule || "N/A",
          immatriculation: chauffeurDoc?.vehicule?.immatriculation || chauffeurProfile?.plaque || "N/A",
          couleur: chauffeurDoc?.vehicule?.couleur || chauffeurProfile?.couleurVehicule || "N/A",
          type: chauffeurDoc?.vehicule?.type || chauffeurProfile?.typeVehicule || "TAXI"
        };

        // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
        await logActivity({
          utilisateurId: socket.user.id,
          nomUtilisateur: `${chauffeurDoc?.prenom || socket.user.prenom} ${chauffeurDoc?.nom || socket.user.nom}`,
          role: "CHAUFFEUR",
          action: "ACCEPTATION_TRAJET",
          module: "TRAJETS",
          details: { reservationId: rid, passager: `${reservation.passager?.prenom} ${reservation.passager?.nom}`, depart: reservation.depart },
          ip: socket.handshake.address,
        });

        const payload = {
          reservationId: rid,
          groupeTaxiPartage: groupeId,
          chauffeur: {
            id: socket.user.id,
            nom: chauffeurDoc?.nom || socket.user.nom,
            prenom: chauffeurDoc?.prenom || socket.user.prenom,
            telephone: chauffeurDoc?.telephone || "",
            phone: chauffeurDoc?.telephone || "",
            email: chauffeurDoc?.email || "",
            photo: chauffeurDoc?.photoUrl || chauffeurDoc?.photo || "",
            vehicle: vehicleInfo,
            vehicule: vehicleInfo,
            rating: chauffeurProfile?.noteMoyenne || chauffeurDoc?.noteMoyenne || 5.0,
            tripsCount: chauffeurProfile?.nombreTrajets || chauffeurDoc?.nombreTrajets || 0
          },
        };

        console.log(`📡 Émission course:acceptee vers PASSAGER_${pid}`);

        // ✅ Notifier passager (room stable — ne PAS émettre aussi à RESERVATION_ pour éviter doublon)
        io.to(`PASSAGER_${pid}`).emit("course:acceptee", payload);

        // 🎫 GÉNÉRATION DU TICKET QR (Automatique après acceptation)
        try {
          const ticket = await ticketController.genererTicketInterne(reservation, chauffeurDoc, chauffeurProfile);
          io.to(`PASSAGER_${pid}`).emit("ticket:genere", {
            success: true,
            ticket: ticket
          });
          console.log(`📡 Ticket QR envoyé au passager ${pid}`);
        } catch (ticketErr) {
          console.error("⚠️ Échec génération ticket (non bloquant):", ticketErr.message);
        }

        socket.emit("course:acceptee_confirmation", {
          reservationId: rid,
          typeCourse: reservation.typeCourse, // ✅ Indispensable pour le frontend
          message: "Course acceptée avec succès",
        });

        // ✅ SYNC: Informer TOUS les autres chauffeurs que la course est prise
        io.to("CHAUFFEURS").emit("course:deja_prise", {
          reservationId: rid,
          message: "Cette course a été acceptée par un autre chauffeur"
        });

        console.log(`✅ Course ${rid} acceptée par ${socket.user.id}`);
      } catch (err) {
        console.error("❌ Erreur acceptation course:", err);
        if (rid) releaseReservationLock(rid);
        socket.emit("course:acceptee_echec", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 2) Chauffeur refuse
    // ────────────────────────────────────────────────
    socket.on("course:refuser", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") {
          return socket.emit("course:erreur", { message: "Non autorisé" });
        }
        if (!reservationId) {
          return socket.emit("course:erreur", { message: "reservationId manquant" });
        }

        const reservation = await Reservation.findById(reservationId).populate("passager");
        if (!reservation) {
          return socket.emit("course:erreur", { message: "Réservation introuvable" });
        }

        if (reservation.statut !== "EN_ATTENTE") {
          return socket.emit("course:refusee_confirmation", {
            reservationId,
            message: "Trop tard : la course n'est plus disponible",
          });
        }

        // ✅ 1. Marquer cette offre comme REFUSEE en DB (pour filtrage futur du chauffeur)
        const hasOffer = reservation.offresEnvoyees.some(o => String(o.chauffeur) === String(socket.user.id));
        const tempsReponseMs = Date.now() - new Date(reservation.createdAt).getTime();

        if (hasOffer) {
          await Reservation.updateOne(
            { _id: reservationId, "offresEnvoyees.chauffeur": socket.user.id },
            { $set: { "offresEnvoyees.$.statut": "REFUSEE", "offresEnvoyees.$.tempsReponseMs": tempsReponseMs } }
          );
        } else {
          await Reservation.updateOne(
            { _id: reservationId },
            { $push: { offresEnvoyees: { chauffeur: socket.user.id, statut: "REFUSEE", tempsReponseMs } } }
          );
        }

        socket.emit("course:refusee_confirmation", {
          reservationId,
          message: "Course refusée",
        });

        // ✅ 2. Vérifier s'il reste d'autres chauffeurs ENVOYEE
        const updatedRes = await Reservation.findById(reservationId);
        const stillWaiting = updatedRes.offresEnvoyees.some(o => o.statut === "ENVOYEE");

        const pid = String(reservation.passager?._id || reservation.passager);

        if (!stillWaiting) {
          console.log(`🚫 Plus aucun chauffeur disponible pour RID=${reservationId}`);
          io.to(`PASSAGER_${pid}`).emit("course:aucune_disponibilite", {
            reservationId,
            message: "Désolé, aucun chauffeur n'est disponible pour le moment."
          });
        } else {
          // Si d'autres attendent, on notifie juste le refus individuel
          io.to(`PASSAGER_${pid}`).emit("course:refusee_par_chauffeur", {
            reservationId,
            message: "Un chauffeur a décliné. Recherche toujours en cours..."
          });
        }
      } catch (err) {
        console.error("❌ Erreur course:refuser:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 3) Position chauffeur
    // ────────────────────────────────────────────────
    socket.on("position:update", (data = {}) => {
      const { reservationId, groupeId, lat, lng, heading = 0, speed = 0, isSimulation } = data;

      if ((!reservationId && !groupeId) || lat == null || lng == null) {
        return;
      }

      // Si c'est un taxi partagé (via groupeId), on diffuse à tout le groupe
      if (groupeId) {
        console.log(`📡 [SOCKET] Broadcast position vers GROUPE_${groupeId} (Sim:${!!isSimulation})`);
        io.to(`GROUPE_${String(groupeId)}`).emit("position:chauffeur", {
          ...data,
          timestamp: Date.now(),
        });
      }

      // Toujours diffuser à la room de réservation spécifique
      if (reservationId) {
        const rid = String(reservationId);
        lastKnownPositions.set(rid, { ...data, timestamp: Date.now() });

        console.log(`📡 [SOCKET] Broadcast position vers RESERVATION_${rid} (Sim:${!!isSimulation})`);
        io.to(`RESERVATION_${rid}`).emit("position:chauffeur", {
          ...data,
          reservationId: rid,
          timestamp: Date.now(),
        });
      }
    });

    // ────────────────────────────────────────────────
    // 4) Chauffeur "en route"
    // ────────────────────────────────────────────────
    socket.on("course:rejoindre", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") {
          return socket.emit("course:erreur", { message: "Non authentifié" });
        }
        if (!reservationId) return socket.emit("course:erreur", { message: "reservationId manquant" });

        const reservation = await Reservation.findOne({
          _id: reservationId,
          chauffeur: socket.user.id,
          statut: { $in: ["ACCEPTEE", "ASSIGNEE", "EN_COURS_DE_RECUPERATION"] }
        }).populate("passager");

        if (!reservation) {
          return socket.emit("course:erreur", { message: "Action non autorisée" });
        }

        if (reservation.statut !== "ASSIGNEE") {
          reservation.statut = "ASSIGNEE";
          await reservation.save();

          // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
          await logActivity({
            utilisateurId: socket.user.id,
            nomUtilisateur: `${socket.user.prenom || ''} ${socket.user.nom || ''}`,
            role: "CHAUFFEUR",
            action: "CHAUFFEUR_EN_ROUTE",
            module: "TRAJETS",
            details: { reservationId, info: "Le chauffeur commence la récupération du passager" },
            ip: socket.handshake.address,
          });
        }

        // ✅ FIX Map population
        courseChauffeur.set(String(reservationId), socket.id);

        // ✅ FIX: s'assurer que le chauffeur rejoint la room de la réservation pour les updates (dont annulation)
        socket.join(`RESERVATION_${reservationId}`);

        const chauffeurDoc = await Utilisateurs.findById(socket.user.id);
        const chauffeurProfile = await ChauffeurProfile.findOne({ utilisateur: socket.user.id });

        const vehicleInfo = {
          marque: chauffeurDoc?.vehicule?.marque || chauffeurProfile?.marqueVehicule || "N/A",
          modele: chauffeurDoc?.vehicule?.modele || chauffeurProfile?.modeleVehicule || "N/A",
          immatriculation: chauffeurDoc?.vehicule?.immatriculation || chauffeurProfile?.plaque || "N/A",
          couleur: chauffeurDoc?.vehicule?.couleur || chauffeurProfile?.couleurVehicule || "N/A",
          type: chauffeurDoc?.vehicule?.type || chauffeurProfile?.typeVehicule || "TAXI"
        };

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:chauffeur_en_route", {
          reservationId,
          message: "Le chauffeur est en route pour vous récupérer",
          chauffeur: {
            id: socket.user.id,
            nom: chauffeurDoc?.nom || socket.user.nom,
            prenom: chauffeurDoc?.prenom || socket.user.prenom,
            telephone: chauffeurDoc?.telephone || "",
            phone: chauffeurDoc?.telephone || "",
            photo: chauffeurDoc?.photoUrl || chauffeurDoc?.photo || "",
            vehicle: vehicleInfo,
            vehicule: vehicleInfo,
            rating: chauffeurProfile?.noteMoyenne || chauffeurDoc?.noteMoyenne || 5.0,
          }
        });

        socket.emit("course:rejoint_confirmation", { reservationId });
      } catch (err) {
        console.error("❌ course:rejoindre:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 5) Arrivée
    // ────────────────────────────────────────────────
    socket.on("course:signaler_arrivee", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;

        const reservation = await Reservation.findOne({
          _id: reservationId,
          chauffeur: socket.user.id,
          statut: { $in: ["ASSIGNEE", "ARRIVEE"] }
        }).populate("passager");

        if (!reservation) return;

        if (reservation.statut !== "ARRIVEE") {
          reservation.statut = "ARRIVEE";
          await reservation.save();

          // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
          await logActivity({
            utilisateurId: socket.user.id,
            nomUtilisateur: `${socket.user.prenom || ''} ${socket.user.nom || ''}`,
            role: "CHAUFFEUR",
            action: "CHAUFFEUR_ARRIVE_POINT_DEPART",
            module: "TRAJETS",
            details: { reservationId, info: "Le chauffeur est arrivé au point de récupération" },
            ip: socket.handshake.address,
          });
        }

        // ✅ FIX Map
        courseChauffeur.set(String(reservationId), socket.id);

        const chauffeurDoc = await Utilisateurs.findById(socket.user.id);
        const chauffeurProfile = await ChauffeurProfile.findOne({ utilisateur: socket.user.id });

        const vehicleInfo = {
          marque: chauffeurDoc?.vehicule?.marque || chauffeurProfile?.marqueVehicule || "N/A",
          modele: chauffeurDoc?.vehicule?.modele || chauffeurProfile?.modeleVehicule || "N/A",
          immatriculation: chauffeurDoc?.vehicule?.immatriculation || chauffeurProfile?.plaque || "N/A",
          couleur: chauffeurDoc?.vehicule?.couleur || chauffeurProfile?.couleurVehicule || "N/A",
          type: chauffeurDoc?.vehicule?.type || chauffeurProfile?.typeVehicule || "TAXI"
        };

        // ✅ Notifier passager
        const payloadArrive = {
          reservationId,
          message: "Votre chauffeur est arrivé, prêt pour le voyage !",
          chauffeur: {
            id: socket.user.id,
            nom: chauffeurDoc?.nom || socket.user.nom,
            prenom: chauffeurDoc?.prenom || socket.user.prenom,
            telephone: chauffeurDoc?.telephone || "",
            phone: chauffeurDoc?.telephone || "",
            photo: chauffeurDoc?.photoUrl || chauffeurDoc?.photo || "",
            vehicle: vehicleInfo,
            vehicule: vehicleInfo,
            rating: chauffeurProfile?.noteMoyenne || chauffeurDoc?.noteMoyenne || 5.0,
          }
        };
        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:chauffeur_arrive", payloadArrive);

        console.log(`📡 [SOCKET] Chauffeur arrivé RID=${reservationId} (Emitted to PASSAGER)`);

        socket.emit("course:arrivee_signalee", { reservationId });
      } catch (err) {
        console.error("❌ course:signaler_arrivee:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 6) Démarrer (Individuel ou Global)
    // ────────────────────────────────────────────────
    socket.on("course:demarrer", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;

        const reservation = await Reservation.findOne({
          _id: reservationId,
          chauffeur: socket.user.id,
          statut: "ARRIVEE",
        }).populate("passager");

        if (!reservation) {
          return socket.emit("course:demarrage_refuse", { message: "Impossible de démarrer" });
        }

        reservation.statut = "EN_COURS";
        reservation.dateDebut = new Date();
        await reservation.save();

        // ✅ PERSISTANCE DU TRAJET
        try {
          await Trajet.findOneAndUpdate(
            { reservation: reservationId },
            {
              reservation: reservationId,
              passager: reservation.passager._id,
              chauffeur: socket.user.id,
              depart: reservation.depart,
              destination: reservation.destination,
              distanceKm: reservation.distanceKm,
              dureeMin: reservation.dureeMin,
              prix: reservation.prix,
              statut: "EN_COURS",
              dateDebut: reservation.dateDebut
            },
            { upsert: true, new: true }
          );
          console.log(`✅ Trajet créé/mis à jour pour RID=${reservationId}`);
        } catch (tErr) {
          console.error("❌ Erreur création Trajet:", tErr.message);
        }

        socket.join(`RESERVATION_${reservationId}`);

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:demarre", {
          reservationId,
          message: "Trajet démarré – suivi en temps réel activé",
          chauffeurId: socket.user.id,
          pickupCoords: [reservation.departLat, reservation.departLng],
          destinationCoords: [reservation.destinationLat, reservation.destinationLng],
          depart: reservation.depart,
          destination: reservation.destination,
          distanceKm: reservation.distanceKm,
          dureeMin: reservation.dureeMin
        });

        // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
        await logActivity({
          utilisateurId: socket.user.id,
          nomUtilisateur: `${socket.user.prenom || ''} ${socket.user.nom || ''}`,
          role: "CHAUFFEUR",
          action: "DEMARRAGE_TRAJET",
          module: "TRAJETS",
          details: { reservationId, passager: `${reservation.passager?.prenom} ${reservation.passager?.nom}` },
          ip: socket.handshake.address,
        });

        socket.emit("course:demarre_confirmation", { reservationId });
      } catch (err) {
        console.error("❌ course:demarrer:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    socket.on("course:demarrer_global", async ({ reservationIds } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationIds || !Array.isArray(reservationIds)) return;

        console.log(`🚀 [SOCKET] Démarrage global pour: ${reservationIds.join(", ")}`);

        for (const rid of reservationIds) {
          const reservation = await Reservation.findOne({
            _id: rid,
            chauffeur: socket.user.id
          }).populate("passager");

          if (reservation) {
            reservation.statut = "EN_COURS";
            reservation.statutRecuperation = "RAMASSE";
            reservation.dateDebut = new Date();
            await reservation.save();

            // ✅ PERSISTANCE DU TRAJET (Carpooling)
            try {
              await Trajet.findOneAndUpdate(
                { reservation: rid },
                {
                  reservation: rid,
                  passager: reservation.passager._id,
                  chauffeur: socket.user.id,
                  depart: reservation.depart,
                  destination: reservation.destination,
                  distanceKm: reservation.distanceKm,
                  dureeMin: reservation.dureeMin,
                  prix: reservation.prix,
                  statut: "EN_COURS",
                  dateDebut: reservation.dateDebut
                },
                { upsert: true, new: true }
              );
            } catch (tErr) {
              console.error(`❌ Erreur Trajet RID=${rid}:`, tErr.message);
            }

            socket.join(`RESERVATION_${rid}`);

            const passagerId = String(reservation.passager?._id || reservation.passager);
            const startPayload = {
              reservationId: rid,
              message: "Le trajet global commence ! Redirection vers le suivi...",
              chauffeurId: socket.user.id
            };

            // Notifier via son ID passager perso
            io.to(`PASSAGER_${passagerId}`).emit("course:demarre_global", startPayload);

            // Notifier via la room de la réservation (Plus robuste)
            io.to(`RESERVATION_${rid}`).emit("course:demarre_global", startPayload);
          }
        }

        socket.emit("course:demarrer_global_ok", { reservationIds });
      } catch (err) {
        console.error("❌ course:demarrer_global:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // Terminer / Annuler
    // ────────────────────────────────────────────────
    const handleTerminerCourse = async (reservationId, chauffeurId) => {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        chauffeur: chauffeurId,
        statut: "EN_COURS",
      }).populate("passager");

      if (!reservation) {
        console.warn(`⚠️ [SOCKET] handleTerminerCourse: RID=${reservationId} introuvable ou pas EN_COURS`);
        return;
      }

      // (Retiré : GESTION TAXI PARTAGÉ (GLOBAL) - on laisse le flow standard gérer l'arrivée individuelle)

      // --- Cas Standard (Individuel) ---
      const estDejaPaye = reservation.paiement?.statut === "PAYE";

      if (estDejaPaye) {
        reservation.statut = "TERMINEE";
        reservation.dateFin = new Date();
        await reservation.save();

        await Trajet.findOneAndUpdate(
          { reservation: reservationId },
          { statut: "TERMINEE", dateFin: reservation.dateFin },
          { upsert: true, new: true }
        );

        // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
        await logActivity({
          utilisateurId: chauffeurId,
          nomUtilisateur: `${reservation.chauffeur_prenom || 'Chauffeur'}`,
          role: "CHAUFFEUR",
          action: "FIN_TRAJET",
          module: "TRAJETS",
          details: { reservationId, prix: reservation.prix, info: "Trajet terminé avec succès" },
          statut: "REUSSI"
        });

        // ✅ PERSISTANCE PAIEMENT 
        try {
          const commissionRate = 0.20; // 20% par défaut
          const commissionPlateforme = Math.round(reservation.prix * commissionRate);
          const montantChauffeur = reservation.prix - commissionPlateforme;

          await Paiement.findOneAndUpdate(
            { reservation: reservationId },
            {
              passager: reservation.passager._id,
              chauffeur: reservation.chauffeur,
              statut: "PAYE",
              montantTotal: reservation.prix,
              commissionPlateforme,
              montantChauffeur,
              methode: reservation.paiement?.methode || "CASH",
              verse: false
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (pErr) {
          console.error("❌ Erreur persistance Paiement (Terminer course):", pErr.message);
        }

        await Utilisateurs.findByIdAndUpdate(chauffeurId, { trajetEnCours: false });

        io.to(`RESERVATION_${reservationId}`).emit("course:finit_avec_paiement", {
          reservationId,
          message: "Course terminée et déjà payée.",
          paymentStatus: "PAYE"
        });
        releaseReservationLock(reservationId);
      } else {
        // Signaler l'arrivée au passager et au chauffeur (pour redirection)
        io.to(`RESERVATION_${reservationId}`).emit("course:arrive_destination", {
          reservationId,
          message: "Le trajet est arrivé à destination. En attente du paiement."
        });
      }
    };

    socket.on("course:terminer", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;
        await handleTerminerCourse(reservationId, socket.user.id);
      } catch (e) {
        console.error("❌ course:terminer:", e);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ✅ NOUVEAU: Terminer Auto (Triggeré par progression 100%)
    socket.on("course:terminer_auto", async ({ reservationId, reservationIds } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;

        const idsToProcess = Array.isArray(reservationIds) ? reservationIds : (reservationId ? [reservationId] : []);
        console.log(`📡 [SOCKET] Terminaison auto pour RIDs=[${idsToProcess.join(', ')}]`);

        for (const rid of idsToProcess) {
          await handleTerminerCourse(rid, socket.user.id);
        }
      } catch (e) {
        console.error("❌ course:terminer_auto:", e);
      }
    });

    // ✅ NOUVEAU: Confirmer Paiement (Passager -> Chauffeur)
    socket.on("paiement:confirmer_envoi", async ({ reservationId, method = "CASH" } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "PASSAGER") return;

        if (!reservationId || !require("mongoose").Types.ObjectId.isValid(reservationId)) {
          return console.error("❌ paiement:confirmer_envoi: ID invalide", reservationId);
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation || String(reservation.passager) !== String(socket.user.id)) return;

        // ✅ Sauvegarder la méthode de paiement dans la réservation avec normalisation
        if (!reservation.paiement) reservation.paiement = {};
        let normalizedMethod = method.toUpperCase();
        if (normalizedMethod === 'ORANGE') normalizedMethod = 'ORANGE_MONEY';
        if (normalizedMethod === 'MTN') normalizedMethod = 'MTN_MONEY';
        if (normalizedMethod === 'ESPECES') normalizedMethod = 'CASH';

        reservation.paiement.methode = normalizedMethod;
        await reservation.save();

        const label = method.toUpperCase() === "CASH" || method.toUpperCase() === "ESPECES" ? "en espèces" : `via ${method.toUpperCase()}`;
        console.log(`💰 [PAYMENT] Passager ${socket.user.id} confirme envoi ${label} pour RID=${reservationId}`);

        const notificationMessage = `Le passager a déclaré avoir payé ${label}. Veuillez confirmer la réception.`;

        // On notifie le chauffeur via sa room privée ET la room de réservation
        io.to(`CHAUFFEUR_${String(reservation.chauffeur)}`).emit("paiement:reception_a_confirmer", {
          reservationId,
          montant: reservation.prix,
          method,
          message: notificationMessage
        });

        // Redondance sur la room de réservation (le client filtrera par rôle)
        io.to(`RESERVATION_${reservationId}`).emit("paiement:reception_a_confirmer", {
          reservationId,
          montant: reservation.prix,
          method,
          message: notificationMessage
        });

      } catch (e) {
        console.error("❌ paiement:confirmer_envoi:", e.message);
      }
    });

    // ✅ NOUVEAU: Confirmer Réception (Chauffeur -> Serveur)
    socket.on("paiement:confirmer_reception", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;

        if (!reservationId || !require("mongoose").Types.ObjectId.isValid(reservationId)) {
          return console.error("❌ paiement:confirmer_reception: ID invalide", reservationId);
        }

        const reservation = await Reservation.findOne({
          _id: reservationId,
          chauffeur: socket.user.id
        }).populate("passager");

        if (!reservation) return;

        console.log(`✅ [PAYMENT] Chauffeur ${socket.user.id} confirme réception pour RID=${reservationId}`);

        // ✅ 1. Toujours mettre à jour la réservation courante à PAYE
        if (!reservation.paiement) {
          reservation.paiement = {};
        }
        reservation.paiement.statut = "PAYE";
        reservation.statut = "TERMINEE";
        reservation.dateFin = new Date();
        await reservation.save();

        // ✅ 2. Mettre à jour le Trajet
        await Trajet.findOneAndUpdate(
          { reservation: reservationId },
          { statut: "TERMINEE", dateFin: reservation.dateFin },
          { upsert: true, new: true }
        );

        // ✅ 3. Créer ou Mettre à jour le Paiement
        const commissionRate = 0.20;
        const commissionPlateforme = Math.round(reservation.prix * commissionRate);
        const montantChauffeur = reservation.prix - commissionPlateforme;

        await Paiement.findOneAndUpdate(
          { reservation: reservationId },
          {
            passager: reservation.passager._id,
            chauffeur: reservation.chauffeur,
            statut: "PAYE",
            montantTotal: reservation.prix,
            commissionPlateforme,
            montantChauffeur,
            methode: reservation.paiement?.methode || "CASH",
            verse: false
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // ✅ GESTION TAXI PARTAGÉ (GLOBAL) - Si c'est un taxi partagé on ne fait que libérer pour cet ID
        if (reservation.groupeTaxiPartage || reservation.typeVehicule === "TAXI_PARTAGE") {
          const gid = reservation.groupeTaxiPartage;
          if (gid) {
            console.log(`🚕 [PAYMENT] Taxi Partagé: Confirmation individuelle pour RID=${reservationId}`);

            // On vérifie s'il y a d'autres réservations non payées dans le groupe pour savoir si on libère le chauffeur
            const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");
            const groupe = await GroupeTaxiPartage.findById(gid).populate('reservations.reservation');

            let allPaidOrDone = true;
            if (groupe) {
              for (const r of groupe.reservations) {
                if (r.reservation && String(r.reservation._id) !== String(reservationId)) {
                  const resToCheck = await Reservation.findById(r.reservation._id);
                  if (resToCheck && resToCheck.statut !== "TERMINEE" && resToCheck.paiement?.statut !== "PAYE") {
                    allPaidOrDone = false;
                  }
                }
              }
            }

            if (allPaidOrDone) {
              await groupe.terminerTrajet();
              await Utilisateurs.findByIdAndUpdate(socket.user.id, { trajetEnCours: false });
              socket.emit("paiement:confirme_global", { groupeId: gid });
            }

            io.to(`RESERVATION_${reservationId}`).emit("course:finit_avec_paiement", {
              reservationId: reservationId,
              message: "Paiement confirmé, merci !",
              paymentStatus: "PAYE"
            });
            releaseReservationLock(reservationId);
            return;
          }
        }

        // --- Cas Standard (Individuel) ---
        await Utilisateurs.findByIdAndUpdate(socket.user.id, { trajetEnCours: false });

        // Notification de fin de flux pour ce passager
        io.to(`RESERVATION_${reservationId}`).emit("course:finit_avec_paiement", {
          reservationId,
          message: "Paiement confirmé, trajet terminé !",
          paymentStatus: "PAYE"
        });
        releaseReservationLock(reservationId);

      } catch (e) {
        console.error("❌ paiement:confirmer_reception:", e.message);
      }
    });

    socket.on("course:annuler", async ({ reservationId, source = "SYSTEM", message } = {}) => {
      console.log(`📡 [SOCKET] Reception course:annuler pour RID=${reservationId}`, { source, message });
      try {
        if (!reservationId) {
          console.warn("⚠️ [SOCKET] course:annuler annulé: reservationId manquant");
          return;
        }

        const reservation = await Reservation.findById(reservationId).populate("passager");
        if (!reservation) {
          console.warn(`⚠️ [SOCKET] course:annuler annulé: reservation ${reservationId} introuvable`);
          return;
        }

        const uid = socket.user?.id;
        const role = socket.user?.role;
        console.log(`🔍 [SOCKET] Auth check: User=${uid}, Role=${role}, ResaPassager=${reservation.passager?._id}, ResaChauffeur=${reservation.chauffeur}`);

        const allowedPassenger = role === "PASSAGER" && String(reservation.passager?._id) === String(uid);
        const allowedDriver = role === "CHAUFFEUR" && reservation.chauffeur && String(reservation.chauffeur) === String(uid);

        if (!allowedPassenger && !allowedDriver) {
          console.warn("❌ [SOCKET] course:annuler REJETE: Non autorisé", { uid, role, passager: reservation.passager?._id, chauffeur: reservation.chauffeur });
          return socket.emit("course:erreur", { message: "Non autorisé" });
        }

        console.log(`✅ [SOCKET] course:annuler AUTORISE par ${role}`);

        const isAlreadyCancelled = ["TERMINEE", "ANNULEE", "ANNULEE_AVEC_FRAIS"].includes(reservation.statut);

        if (!isAlreadyCancelled) {
          // ════════════════════════════════════════════════════
          // 💰 GESTION GÉNÉRALE DES FRAIS D'ANNULATION
          // ════════════════════════════════════════════════════
          const FRAIS_ANNULATION_GNF = 5000;
          let montantRembourse = reservation.prix;
          let montantChauffeur = 0;
          let avecFrais = false;

          // Calcul de la durée depuis l'acceptation
          const now = new Date();
          const updatedAt = new Date(reservation.updatedAt);
          const diffMinutes = Math.floor((now - updatedAt) / (1000 * 60));

          // Statuts où le chauffeur est mobilisé
          const statutsMobilises = ["ACCEPTEE", "ASSIGNEE", "EN_COURS_DE_RECUPERATION", "ARRIVEE", "EN_COURS"];
          
          if (allowedPassenger && statutsMobilises.includes(reservation.statut) && reservation.chauffeur) {
            // Règle : Frais si > 2 min après acceptation OU si le chauffeur est déjà arrivé
            if (diffMinutes >= 2 || reservation.statut === "ARRIVEE") {
              avecFrais = true;
              montantChauffeur = FRAIS_ANNULATION_GNF;
              // Si déjà payé (Wallet), on calcule le remboursement
              if (reservation.paiement?.statut === "PAYE") {
                montantRembourse = Math.max(0, reservation.prix - FRAIS_ANNULATION_GNF);
              } else {
                montantRembourse = 0; // Rien à rembourser si pas payé
              }
              console.log(`💰 [ANNULATION] Frais appliqués (${diffMinutes} min): ${montantChauffeur} GNF`);
            }
          }

          // Mettre à jour le statut
          reservation.statut = avecFrais ? "ANNULEE_AVEC_FRAIS" : "ANNULEE";
          reservation.annuleeLe = now;
          if (uid) reservation.annuleePar = uid;
          
          const nomCeluiQuiAnnule = role === "PASSAGER" ? "le Passager" : "le Chauffeur";

          // Enregistrer les détails des frais
          reservation.fraisAnnulation = {
            montant: avecFrais ? montantChauffeur : 0,
            montantRembourse,
            montantChauffeur,
            raison: message || (avecFrais ? `Annulation tardive par ${nomCeluiQuiAnnule}` : `Annulation gratuite par ${nomCeluiQuiAnnule}`)
          };

          try {
            const Transaction = require("./models/Transaction");

            // --- CAS 1 : C'ÉTAIT PAYÉ PAR WALLET (Remboursement partiel/total) ---
            if (reservation.paiement?.methode === "WALLET" && reservation.paiement?.statut === "PAYE") {
              const passagerId = reservation.passager._id;
              const passagerUser = await Utilisateurs.findById(passagerId);

              if (passagerUser) {
                // On rend ce qui reste après frais
                passagerUser.solde = (passagerUser.solde || 0) + montantRembourse;
                await passagerUser.save();

                await Transaction.create({
                  utilisateur: passagerId,
                  type: "REMBOURSEMENT",
                  montant: montantRembourse,
                  methode: "WALLET",
                  reference: `REMB-${Date.now()}`,
                  statut: "COMPLETE",
                  commentaire: avecFrais 
                    ? `Remboursement partiel - Frais d'annulation ${montantChauffeur.toLocaleString()} GNF déduits`
                    : `Remboursement total - Annulation gratuite`,
                  metadata: { reservationId: reservation._id }
                });
              }
              reservation.paiement.statut = avecFrais ? "REMBOURSE_PARTIEL" : "REMBOURSE";
            } 
            // --- CAS 2 : CASH OU WALLET NON PAYÉ (Prélever les frais quand même) ---
            else if (avecFrais) {
              const passagerId = reservation.passager._id;
              const passagerUser = await Utilisateurs.findById(passagerId);

              if (passagerUser) {
                // On force le prélèvement des frais (peut passer en négatif)
                passagerUser.solde = (passagerUser.solde || 0) - montantChauffeur;
                await passagerUser.save();

                await Transaction.create({
                  utilisateur: passagerId,
                  type: "RETRAIT", // Ou un nouveau type "PENALITE"
                  montant: montantChauffeur,
                  methode: "WALLET",
                  reference: `PENAL-${Date.now()}`,
                  statut: "COMPLETE",
                  commentaire: `Frais d'annulation tardive (Course ${reservationId})`,
                  metadata: { reservationId: reservation._id }
                });
                console.log(`📉 [DETTE] Solde passager ${passagerId} mis à jour : ${passagerUser.solde} GNF`);
              }
            }

            // --- COMPENSATION DU CHAUFFEUR ---
            if (montantChauffeur > 0 && reservation.chauffeur) {
              const chauffeurUser = await Utilisateurs.findById(reservation.chauffeur);
              if (chauffeurUser) {
                chauffeurUser.solde = (chauffeurUser.solde || 0) + montantChauffeur;
                chauffeurUser.trajetEnCours = false;
                await chauffeurUser.save();

                await Transaction.create({
                  utilisateur: chauffeurUser._id,
                  type: "COMPENSATION",
                  montant: montantChauffeur,
                  methode: "WALLET",
                  reference: `COMPENS-${Date.now()}`,
                  statut: "COMPLETE",
                  commentaire: `Compensation annulation passager - Course ${reservationId}`,
                  metadata: { reservationId: reservation._id }
                });
                console.log(`💰 [COMPENSATION] ${montantChauffeur} GNF versés au chauffeur ${chauffeurUser._id}`);
              }
            }

            await reservation.save();
            console.log(`✅ [SOCKET] Reservation ${reservationId} marquée ${reservation.statut} en base`);
          } catch (saveErr) {
            console.error("❌ [SOCKET] Erreur lors du traitement financier de l'annulation:", saveErr.message);
          }

          // ════════════════════════════════════════════════════
          // 📡 NOTIFICATIONS TEMPS RÉEL
          // ════════════════════════════════════════════════════
          const cancelMsg = avecFrais
            ? `Course annulée. Frais d'annulation : ${montantChauffeur.toLocaleString()} GNF. ${montantRembourse > 0 ? `Remboursement : ${montantRembourse.toLocaleString()} GNF.` : ''}`
            : message || "Course annulée par le passager";

          // 1. Notifier le passager
          console.log(`📡 [SOCKET] Emission course:annulee vers PASSAGER_${reservation.passager._id}`);
          io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:annulee", {
            reservationId,
            message: cancelMsg,
            fraisAnnulation: montantChauffeur,
            montantRembourse,
            avecFrais
          });

          // 2. Notifier le chauffeur
          if (reservation.chauffeur) {
            const chauffeurId = String(reservation.chauffeur);
            console.log(`📡 [SOCKET] Emission course:annulee vers CHAUFFEUR_${chauffeurId}`);

            // Libérer le chauffeur seulement s'il n'a plus aucune course active
            const activeOtherReservations = await Reservation.countDocuments({
              chauffeur: chauffeurId,
              _id: { $ne: reservationId },
              statut: { $in: ["ACCEPTEE", "ASSIGNEE", "ARRIVEE", "EN_COURS"] }
            });

            if (activeOtherReservations === 0) {
              console.log(`🧹 [SOCKET] Libération chauffeur ${chauffeurId}`);
              await Utilisateurs.findByIdAndUpdate(chauffeurId, { trajetEnCours: false });
            }

            io.to(`CHAUFFEUR_${chauffeurId}`).emit("course:annulee", {
              reservationId,
              message: avecFrais
                ? `Le passager a annulé la course. Vous recevez ${montantChauffeur.toLocaleString()} GNF de compensation.`
                : (message || "Course annulée par le passager"),
              source: source || role,
              montantGagne: montantChauffeur
            });
          }

          // Notifier la room globale CHAUFFEURS
          console.log("📡 [SOCKET] Emission course:annulee vers CHAUFFEURS");
          io.to("CHAUFFEURS").emit("course:annulee", {
            reservationId,
            message: cancelMsg,
            isSearching: !reservation.chauffeur
          });

          // 3. Notifier la room de la réservation
          console.log(`📡 [SOCKET] Emission course:annulee vers RESERVATION_${reservationId}`);
          io.to(`RESERVATION_${reservationId}`).emit("course:annulee", {
            reservationId,
            message: cancelMsg
          });
        }

        socket.emit("course:annulee_confirmation", {
          reservationId,
          fraisAnnulation: reservation.fraisAnnulation || null
        });
        releaseReservationLock(reservationId);
      } catch (e) {
        console.error("❌ course:annuler:", e);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // Déconnexion
    // ────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`🔴 Socket déconnecté : ${socket.id}`);

      try {
        const reservations = socketToReservations.get(socket.id);
        if (reservations && reservations.size > 0) {
          for (const rid of reservations) {
            if (courseChauffeur.get(rid) === socket.id) {
              releaseReservationLock(rid);
            }
          }
        }
      } catch (e) {
        console.error("❌ Cleanup locks on disconnect:", e.message);
      }

      try {
        if (socket.user?.id) {
          const userId = socket.user.id;
          const ROLE = socket.user.role;

          // Si c'est un chauffeur, on clôture sa session de temps en ligne
          if (ROLE === "CHAUFFEUR") {
            try {
              const profile = await ChauffeurProfile.findOne({ utilisateur: userId });
              if (profile && profile.disponibiliteDepuis) {
                const sessionDuration = new Date() - profile.disponibiliteDepuis;

                await ChauffeurProfile.updateOne(
                  { _id: profile._id },
                  {
                    $inc: { tempsEnLigneCumule: sessionDuration },
                    $set: {
                      disponibilite: "HORS_LIGNE",
                      disponibiliteDepuis: null
                    }
                  }
                );
                console.log(`⏱️ Session chauffeur ${userId} terminée : +${Math.round(sessionDuration / 1000)}s`);
              }
            } catch (err) {
              console.error("❌ Erreur update temps en ligne chauffeur:", err.message);
            }
          }

          await Utilisateurs.updateOne(
            { _id: userId, socketId: socket.id },
            { $set: { estEnLigne: false }, $unset: { socketId: "" } }
          );
        } else {
          await Utilisateurs.updateOne(
            { socketId: socket.id },
            { $set: { estEnLigne: false }, $unset: { socketId: "" } }
          );
        }
      } catch (e) {
        console.error("❌ Erreur update offline:", e.message);
      }
    });

    // ==================== ÉVÉNEMENTS TAXI PARTAGÉ (BACKEND-DRIVEN) ====================

    // 🚕 Rejoindre la room du groupe (passager ou chauffeur)
    socket.on("taxipartage:rejoindre_groupe", async ({ groupeId } = {}) => {
      try {
        if (!groupeId || !socket.user?.id) return;

        const groupe = await GroupeTaxiPartage.findById(groupeId)
          .populate({ path: 'reservations.reservation', populate: { path: 'passager', select: 'nom prenom telephone photoUrl' } });

        if (!groupe) return socket.emit("taxipartage:erreur", { message: "Groupe introuvable" });

        const isChauffeur = String(groupe.chauffeur) === String(socket.user.id);
        const isPassager = groupe.reservations.some(
          r => String(r.reservation?.passager?._id || r.reservation?.passager) === String(socket.user.id)
        );

        if (!isChauffeur && !isPassager) {
          return socket.emit("taxipartage:erreur", { message: "Non autorisé pour ce groupe" });
        }

        socket.join(`GROUPE_${groupeId}`);
        console.log(`🚕 [SOCKET] Socket ${socket.id} a rejoint GROUPE_${groupeId}`);

        const room = io.sockets.adapter.rooms.get(`GROUPE_${groupeId}`);
        console.log(`📊 [SOCKET] Room GROUPE_${groupeId} contient maintenant ${room ? room.size : 0} membres`);

        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);

        socket.emit("taxipartage:groupe_rejoint", {
          groupeId,
          groupe,
          peutDemarrer: validation.peutDemarrer,
          passagersRamasses: validation.passagersRamasses,
          passagersEnAttente: validation.passagersEnAttente,
          message: validation.message
        });

        console.log(`🚕 [TAXI_PARTAGE] ${socket.user.role} ${socket.user.id} a rejoint le groupe ${groupeId}`);
      } catch (e) {
        console.error("❌ taxipartage:rejoindre_groupe:", e.message);
        socket.emit("taxipartage:erreur", { message: "Erreur serveur" });
      }
    });

    // 🚗 Chauffeur en route vers un passager (EN_ATTENTE → EN_COURS_DE_RAMASSAGE)
    socket.on("taxipartage:en_route_passager", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;

        const resultat = await TaxiPartageService.passerEnCoursDeRamassage(reservationId, socket.user.id);

        const reservation = await Reservation.findById(reservationId).populate('groupeTaxiPartage');
        const groupeId = reservation?.groupeTaxiPartage?._id || reservation?.groupeTaxiPartage;

        if (groupeId) {
          io.to(`PASSAGER_${String(reservation.passager)}`).emit("taxipartage:chauffeur_en_route", {
            reservationId,
            groupeId: String(groupeId),
            message: "Le chauffeur est en route pour vous récupérer 📍"
          });

          io.to(`GROUPE_${String(groupeId)}`).emit("taxipartage:statut_mis_a_jour", {
            groupeId: String(groupeId),
            reservationId,
            nouveauStatut: "EN_COURS_DE_RAMASSAGE",
            message: "Chauffeur en route vers un passager"
          });
        }

        socket.emit("taxipartage:en_route_ok", { reservationId, ...resultat });
        console.log(`🚗 [TAXI_PARTAGE] Chauffeur en route vers passager RID=${reservationId}`);
      } catch (e) {
        console.error("❌ taxipartage:en_route_passager:", e.message);
        socket.emit("taxipartage:erreur", { message: e.message });
      }
    });

    // 📍 Chauffeur signale son arrivée et ramasse le passager (→ RAMASSE)
    socket.on("taxipartage:signaler_ramassage", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;

        const resultat = await TaxiPartageService.signalerArriveePassager(reservationId, socket.user.id);

        const reservation = await Reservation.findById(reservationId);
        if (reservation) {
          io.to(`PASSAGER_${String(reservation.passager)}`).emit("taxipartage:passager_ramasse", {
            reservationId,
            groupeId: String(resultat.groupeId),
            message: "Vous avez été pris en charge par le chauffeur 🚗"
          });
        }

        io.to(`GROUPE_${String(resultat.groupeId)}`).emit("taxipartage:statut_mis_a_jour", {
          groupeId: String(resultat.groupeId),
          reservationId,
          nouveauStatut: "RAMASSE",
          passagersRamasses: resultat.passagersRamasses,
          passagersEnAttente: resultat.passagersEnAttente,
          peutDemarrer: resultat.peutDemarrer,
          message: resultat.peutDemarrer
            ? "✅ Tous les passagers sont à bord - prêt à démarrer !"
            : `⏳ En attente de ${resultat.passagersEnAttente} passager(s)`
        });

        socket.emit("taxipartage:ramassage_ok", {
          reservationId,
          ...resultat,
          prochainPassager: resultat.passagersEnAttente > 0
        });

        if (resultat.peutDemarrer) {
          io.to(`CHAUFFEUR_${socket.user.id}`).emit("taxipartage:peut_demarrer", {
            groupeId: String(resultat.groupeId),
            message: "✅ Tous les passagers sont à bord - prêt à démarrer !"
          });
        }

        console.log(`📍 [TAXI_PARTAGE] Passager ramassé RID=${reservationId} - Restants: ${resultat.passagersEnAttente}`);
      } catch (e) {
        console.error("❌ taxipartage:signaler_ramassage:", e.message);
        socket.emit("taxipartage:erreur", { message: e.message });
      }
    });

    // 🚀 Démarrer le trajet du groupe (VALIDATION BACKEND OBLIGATOIRE)
    socket.on("taxipartage:demarrer_trajet", async ({ groupeId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!groupeId) return;

        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);

        if (!validation.peutDemarrer) {
          return socket.emit("taxipartage:demarrage_refuse", {
            groupeId,
            message: validation.message || "Impossible de démarrer - passagers en attente",
            passagersEnAttente: validation.passagersEnAttente
          });
        }

        const resultat = await TaxiPartageService.demarrerTrajetGroupe(groupeId, socket.user.id);

        const groupe = await GroupeTaxiPartage.findById(groupeId)
          .populate({ path: 'reservations.reservation', populate: { path: 'passager', select: 'nom prenom telephone' } });

        if (groupe) {
          for (const r of groupe.reservations) {
            const resa = r.reservation;
            if (resa) {
              try {
                await Trajet.findOneAndUpdate(
                  { reservation: resa._id },
                  {
                    reservation: resa._id,
                    passager: resa.passager._id || resa.passager,
                    chauffeur: socket.user.id,
                    depart: resa.depart,
                    destination: resa.destination,
                    distanceKm: resa.distanceKm,
                    dureeMin: resa.dureeMin,
                    prix: resa.prix,
                    statut: "EN_COURS",
                    dateDebut: new Date()
                  },
                  { upsert: true, new: true }
                );
              } catch (tErr) {
                console.error(`❌ Trajet RID=${resa._id}:`, tErr.message);
              }

              const passagerId = String(resa.passager._id || resa.passager);
              const startPayload = {
                groupeId,
                reservationId: String(resa._id),
                message: "🚀 Le trajet commence ! Suivez le véhicule en temps réel",
                chauffeurId: socket.user.id,
                depart: resa.depart,
                destination: resa.destination
              };

              io.to(`PASSAGER_${passagerId}`).emit("taxipartage:trajet_demarre", startPayload);
              io.to(`RESERVATION_${String(resa._id)}`).emit("taxipartage:trajet_demarre", startPayload);
            }
          }
        }

        io.to(`GROUPE_${groupeId}`).emit("taxipartage:trajet_demarre", {
          groupeId,
          message: "🚀 Le trajet commence ! Suivez le véhicule en temps réel",
          groupe: resultat.groupe
        });

        socket.emit("taxipartage:demarrage_ok", {
          groupeId,
          message: "Trajet démarré - Mode tracking activé",
          groupe: resultat.groupe
        });

        console.log(`🚀 [TAXI_PARTAGE] Trajet démarré pour groupe ${groupeId}`);
      } catch (e) {
        console.error("❌ taxipartage:demarrer_trajet:", e.message);
        socket.emit("taxipartage:erreur", { message: e.message });
      }
    });

    // 🏁 Terminer le trajet du groupe
    socket.on("taxipartage:terminer_trajet", async ({ groupeId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!groupeId) return;

        const resultat = await TaxiPartageService.terminerTrajetGroupe(groupeId, socket.user.id);

        io.to(`GROUPE_${groupeId}`).emit("taxipartage:trajet_termine", {
          groupeId,
          message: "🎉 Trajet terminé ! Merci d'avoir utilisé Taka-Taka Voyage"
        });

        socket.emit("taxipartage:trajet_termine_ok", { groupeId, ...resultat });
        await Utilisateurs.findByIdAndUpdate(socket.user.id, { trajetEnCours: false });

        console.log(`🏁 [TAXI_PARTAGE] Trajet terminé pour groupe ${groupeId}`);
      } catch (e) {
        console.error("❌ taxipartage:terminer_trajet:", e.message);
        socket.emit("taxipartage:erreur", { message: e.message });
      }
    });

    // 📡 Position du chauffeur pour le groupe (broadcast à tous)
    socket.on("taxipartage:position", ({ groupeId, lat, lng, heading = 0, speed = 0 } = {}) => {
      if (!groupeId || lat == null || lng == null) return;
      socket.to(`GROUPE_${groupeId}`).emit("taxipartage:position_mise_a_jour", {
        groupeId, lat, lng, heading, speed, timestamp: Date.now()
      });
    });

    // 📊 Obtenir l'état actuel du groupe
    socket.on("taxipartage:get_etat", async ({ groupeId } = {}) => {
      try {
        if (!groupeId || !socket.user?.id) return;

        const groupe = await GroupeTaxiPartage.findById(groupeId)
          .populate({ path: 'reservations.reservation', populate: { path: 'passager', select: 'nom prenom telephone photoUrl' } });

        if (!groupe) return socket.emit("taxipartage:erreur", { message: "Groupe introuvable" });

        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);

        socket.emit("taxipartage:etat", {
          groupeId,
          groupe,
          statut: groupe.statut,
          peutDemarrer: validation.peutDemarrer,
          passagersRamasses: validation.passagersRamasses,
          passagersEnAttente: validation.passagersEnAttente,
          fileRamassage: groupe.reservations.sort((a, b) => a.ordre - b.ordre)
        });
      } catch (e) {
        console.error("❌ taxipartage:get_etat:", e.message);
        socket.emit("taxipartage:erreur", { message: "Erreur serveur" });
      }
    });

    console.log(`🚕 [TAXI_PARTAGE] Écouteurs backend-driven activés pour socket ${socket.id}`);
  });
};
