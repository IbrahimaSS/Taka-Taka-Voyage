const Utilisateurs = require("../models/Utilisateurs");
const ChauffeurProfile = require("../models/ChauffeurProfile");
const { socketToReservations, courseChauffeur, releaseReservationLock } = require("./state");

// ✅ [SOCKET_CONNECT] Gestion des identités (Passager, Chauffeur, Admin ou Invité)
function joinRoomsOnConnect(socket) {
  try {
    const { userId, role, nom = "", prenom = "" } = socket.handshake.auth || {};

    if (userId && role) {
      const ROLE = String(role).toUpperCase();
      socket.user = { id: userId, role: ROLE, nom, prenom };

      const sid = String(userId);
      socket.join(`${ROLE}_${sid}`);
      socket.join(`USER_${sid}`);

      // Room individuelle additionnelle pour compatibilité backend
      if (ROLE === "CHAUFFEUR") {
        socket.join(`CHAUFFEUR_${sid}`);
        socket.join("CHAUFFEURS");
      } else if (ROLE === "PASSAGER") {
        socket.join(`PASSAGER_${sid}`);
        socket.join("PASSAGERS"); // ✅ Pour les diffusions de groupe
        socket.join("CLIENTS"); // Nouveau: room pour tous les clients (loggués ou non)
      }
      else if (ROLE === "ADMIN") socket.join("ADMINS");

      console.log(`✅ [SOCKET_CONNECT] Utilisateur connecté : ${ROLE} (${userId})`);
    } else {
      // C'est un simple visiteur (GUEST)
      socket.join("GUESTS");
      socket.join("CLIENTS"); // Ils font aussi partie des clients à notifier
      console.log(`👤 [SOCKET_CONNECT] Visiteur anonyme connecté (ID: ${socket.id})`);
    }
  } catch (e) {
    console.error("❌ join rooms on connect:", e.message);
  }
}

function registerPresenceHandlers(io, socket) {
  console.log(`🟢 Socket connecté : ${socket.id}`);
  console.log("   → Auth:", socket.handshake.auth);

  joinRoomsOnConnect(socket);

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
}

module.exports = { registerPresenceHandlers };
