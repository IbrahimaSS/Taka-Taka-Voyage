exports.accepterCourse = async (req, res) => {
  const chauffeurId = req.utilisateur._id;
  const { reservationId } = req.body;

  const reservation = await Reservation.findOne({
    _id: reservationId,
    statut: "EN_ATTENTE_CHAUFFEUR",
  });

  if (!reservation) {
    return res.status(400).json({
      succes: false,
      message: "Course déjà prise",
    });
  }

  reservation.chauffeur = chauffeurId;
  reservation.statut = "CHAUFFEUR_ASSIGNE";
  await reservation.save();

  // 🔔 prévenir le passager
  io.to(`passager_${reservation.passager}`).emit(
    "chauffeur:assigne",
    {
      chauffeurId,
      reservationId,
    }
  );

  return res.json({
    succes: true,
    message: "Course acceptée",
  });
};
