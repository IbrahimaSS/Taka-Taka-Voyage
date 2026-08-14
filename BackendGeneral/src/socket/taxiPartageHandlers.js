const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");
const Reservation = require("../models/Reservations");
const Trajet = require("../models/Trajets");
const Utilisateurs = require("../models/Utilisateurs");
const TaxiPartageService = require("../services/taxiPartageService");

// ==================== ÉVÉNEMENTS TAXI PARTAGÉ (BACKEND-DRIVEN) ====================
//
// ⚠️ Note découpage : la plupart de ces handlers ne sont plus déclenchés par aucun
// client (web ou mobile) — le flux réel passe désormais par l'API REST
// (src/routes/taxiPartageRoutes.js -> src/controllers/taxiPartageControllers.js),
// qui émet les mêmes événements directement via `io`. Seul "taxipartage:rejoindre_groupe"
// est encore utilisé côté client (pour rejoindre la room et recevoir ces broadcasts).
// Conservés tels quels ici (comportement identique à avant le découpage) ; à discuter
// séparément si on veut les retirer.
function registerTaxiPartageHandlers(io, socket) {
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
}

module.exports = { registerTaxiPartageHandlers };
