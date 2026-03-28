const Reservation = require("../../../models/Reservations");
const Paiement = require("../../../models/Paiements");

exports.accepterCourse = async (req, res) => {
  try {
    const chauffeurId = req.utilisateur._id;
    const { reservationId } = req.body;
    const io = req.app.get("io");

    const reservation = await Reservation.findOne({
      _id: reservationId,
      statut: "EN_ATTENTE_CHAUFFEUR",
    });

    if (!reservation) {
      return res.status(400).json({
        succes: false,
        message: "Course déjà prise ou introuvable",
      });
    }

    // 1. Assigner le chauffeur à la réservation
    reservation.chauffeur = chauffeurId;
    reservation.statut = "CHAUFFEUR_ASSIGNE";
    await reservation.save();

    // 2. 🎯 LIER LE PAIEMENT AU CHAUFFEUR RÉEL (Crucial pour l'Auto-Payout)
    // On met à jour le champ chauffeur du paiement existant créé par l'IA ou le formulaire
    await Paiement.findOneAndUpdate(
      { reservation: reservationId },
      { chauffeur: chauffeurId }
    );

    console.log(`✅ [COURSES] Course ${reservationId} acceptée par le chauffeur ${chauffeurId}. Paiement lié.`);

    // 🔔 prévenir le passager
    if (io) {
      io.to(`passager_${reservation.passager}`).emit(
        "chauffeur:assigne",
        {
          chauffeurId,
          reservationId,
        }
      );
    }

    return res.json({
      succes: true,
      message: "Course acceptée",
    });
  } catch (error) {
    console.error("❌ [COURSES] Erreur lors de l'acceptation:", error);
    return res.status(500).json({ succes: false, message: error.message });
  }
};
