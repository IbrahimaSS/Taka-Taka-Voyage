const Reservation = require("../models/Reservations");

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

module.exports = { checkPlannedReminders };
