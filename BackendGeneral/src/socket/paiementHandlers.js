const mongoose = require("mongoose");
const Reservation = require("../models/Reservations");
const Utilisateurs = require("../models/Utilisateurs");
const Trajet = require("../models/Trajets");
const Paiement = require("../models/Paiements");
const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");
const { releaseReservationLock } = require("./state");

function registerPaiementHandlers(io, socket) {
  // ✅ NOUVEAU: Confirmer Paiement (Passager -> Chauffeur)
  socket.on("paiement:confirmer_envoi", async ({ reservationId, method = "CASH" } = {}) => {
    try {
      if (!socket.user?.id || socket.user.role !== "PASSAGER") return;

      if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
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

      if (!reservationId || !mongoose.Types.ObjectId.isValid(reservationId)) {
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
}

module.exports = { registerPaiementHandlers };
