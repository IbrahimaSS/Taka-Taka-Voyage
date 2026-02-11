const Notification = require("./models/Notifications");
const Reservation = require("./models/Reservations");
const Utilisateurs = require("./models/Utilisateurs");

// Anti double accept (mémoire)
// ⚠️ TODO [PRODUCTION] : Ces locks mémoire sont perdus au redémarrage du serveur
// et ne fonctionnent pas en multi-instance. → Migrer vers Redis (SET/GET) pour
// un lock distribué fiable en production.
const coursesPrises = new Set();   // reservationId acceptée (lock mémoire)
const courseChauffeur = new Map(); // reservationId -> socket.id chauffeur
const socketToReservations = new Map(); // socket.id -> Set(reservationId)

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
  const sId = courseChauffeur.get(rid);
  courseChauffeur.delete(rid);
  if (sId) untrackReservationForSocket(sId, rid);
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Socket connecté : ${socket.id}`);
    console.log("   → Auth:", socket.handshake.auth);

    // ✅ FIX MAJEUR: join rooms IMMÉDIATEMENT (évite de rater course:acceptee)
    try {
      const { userId, role, nom = "", prenom = "" } = socket.handshake.auth || {};
      if (userId && role) {
        const ROLE = String(role).toUpperCase();
        socket.user = { id: userId, role: ROLE, nom, prenom };

        const roomMain = `${ROLE}_${String(userId)}`;
        const roomUser = `USER_${String(userId)}`;
        const roomPassager = `PASSAGER_${String(userId)}`;
        socket.join(roomMain);
        socket.join(roomUser);
        socket.join(roomPassager);

        console.log(`✅ [SOCKET_CONNECT] Rooms jointes pour ${ROLE} (${userId}): ${roomMain}, ${roomUser}, ${roomPassager}`);
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
        socket.join(`PASSAGER_${sid}`);

        const updated = await Utilisateurs.findByIdAndUpdate(
          userId,
          { estEnLigne: true, socketId: socket.id, derniereConnexion: new Date() },
          { new: true }
        );

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

        if (!isPassengerOwner && !isDriverOwner) {
          return socket.emit("reservation:join:refused", { reservationId, message: "Non autorisé" });
        }

        socket.join(`RESERVATION_${reservationId}`);
        socket.emit("reservation:join:ok", { reservationId });
      } catch (e) {
        console.error("❌ reservation:join:", e.message);
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

        // Room de suivi
        socket.join(`RESERVATION_${rid}`);

        await Notification.create({
          utilisateur: reservation.passager._id,
          message: "✅ Un chauffeur a accepté votre course ! 🚖",
        });

        const pid = String(reservation.passager._id);
        const payload = {
          reservationId: rid,
          chauffeur: {
            id: socket.user.id,
            nom: socket.user.nom,
            prenom: socket.user.prenom,
          },
        };

        console.log(`📡 Émission course:acceptee vers PASSAGER_${pid} et RESERVATION_${rid}`);

        // ✅ Notifier passager (room stable)
        io.to(`PASSAGER_${pid}`).emit("course:acceptee", payload);

        // ✅ BONUS ROBUSTE: notifier aussi la room reservation
        io.to(`RESERVATION_${rid}`).emit("course:acceptee", payload);

        socket.emit("course:acceptee_confirmation", {
          reservationId: rid,
          message: "Course acceptée avec succès",
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

        const pid = String(reservation.passager._id);
        io.to(`PASSAGER_${pid}`).emit("course:refusee_par_chauffeur", {
          reservationId,
          chauffeurId: socket.user.id,
          message: "Un chauffeur a refusé. Recherche en cours...",
        });

        socket.emit("course:refusee_confirmation", {
          reservationId,
          message: "Course refusée",
        });
      } catch (err) {
        console.error("❌ Erreur course:refuser:", err);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    // ────────────────────────────────────────────────
    // 3) Position chauffeur
    // ────────────────────────────────────────────────
    socket.on("position:update", ({ reservationId, lat, lng, heading = 0, speed = 0 } = {}) => {
      if (!reservationId || lat == null || lng == null) return;

      const rid = String(reservationId);
      if (courseChauffeur.get(rid) !== socket.id) return;

      io.to(`RESERVATION_${rid}`).emit("position:chauffeur", {
        reservationId: rid,
        lat,
        lng,
        heading,
        speed,
        timestamp: Date.now(),
      });
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
          statut: "ACCEPTEE",
        }).populate("passager");

        if (!reservation) {
          return socket.emit("course:erreur", { message: "Action non autorisée" });
        }

        reservation.statut = "ASSIGNEE";
        await reservation.save();

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:chauffeur_en_route", {
          reservationId,
          message: "Le chauffeur est en route pour vous récupérer",
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
          statut: "ASSIGNEE",
        }).populate("passager");

        if (!reservation) return;

        reservation.statut = "ARRIVEE";
        await reservation.save();

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:chauffeur_arrive", {
          reservationId,
          message: "Votre chauffeur est arrivé",
        });

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

        socket.join(`RESERVATION_${reservationId}`);

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:demarre", {
          reservationId,
          message: "Trajet démarré – suivi en temps réel activé",
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
            reservation.dateDebut = new Date();
            await reservation.save();

            socket.join(`RESERVATION_${rid}`);

            io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:demarre_global", {
              reservationId: rid,
              message: "Le trajet global commence ! Redirection vers le suivi...",
            });
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
    socket.on("course:terminer", async ({ reservationId } = {}) => {
      try {
        if (!socket.user?.id || socket.user.role !== "CHAUFFEUR") return;
        if (!reservationId) return;

        const reservation = await Reservation.findOne({
          _id: reservationId,
          chauffeur: socket.user.id,
          statut: "EN_COURS",
        }).populate("passager");

        if (!reservation) return;

        reservation.statut = "TERMINEE";
        reservation.dateFin = new Date();
        await reservation.save();

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:terminee", {
          reservationId,
          message: "Course terminée",
        });

        socket.emit("course:terminee_confirmation", { reservationId });
        releaseReservationLock(reservationId);
      } catch (e) {
        console.error("❌ course:terminer:", e);
        socket.emit("course:erreur", { message: "Erreur serveur" });
      }
    });

    socket.on("course:annuler", async ({ reservationId, source = "SYSTEM" } = {}) => {
      try {
        if (!reservationId) return;

        const reservation = await Reservation.findById(reservationId).populate("passager");
        if (!reservation) return;

        const uid = socket.user?.id;
        const role = socket.user?.role;

        const allowedPassenger = role === "PASSAGER" && String(reservation.passager?._id) === String(uid);
        const allowedDriver = role === "CHAUFFEUR" && reservation.chauffeur && String(reservation.chauffeur) === String(uid);

        if (!allowedPassenger && !allowedDriver) {
          return socket.emit("course:erreur", { message: "Non autorisé" });
        }

        if (["TERMINEE", "ANNULEE"].includes(reservation.statut)) {
          return socket.emit("course:annulation_refusee", { reservationId, message: "Déjà terminée/annulée" });
        }

        reservation.statut = "ANNULEE";
        reservation.dateAnnulation = new Date();
        reservation.annuleePar = source || role || "SYSTEM";
        await reservation.save();

        io.to(`PASSAGER_${String(reservation.passager._id)}`).emit("course:annulee", {
          reservationId,
          message: "Course annulée",
        });

        if (reservation.chauffeur) {
          io.to(`CHAUFFEUR_${reservation.chauffeur}`).emit("course:annulee", {
            reservationId,
            message: "Course annulée",
          });
        }

        socket.emit("course:annulee_confirmation", { reservationId });
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
          await Utilisateurs.updateOne(
            { _id: socket.user.id, socketId: socket.id },
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
  });
};
