exports.rechercherChauffeur = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ succes: false, message: "Réservation introuvable" });
    }

    reservation.statut = "EN_ATTENTE_CHAUFFEUR";
    await reservation.save();

    const io = req.app.get("io");
    if (!io) {
      console.warn("⚠️ io introuvable dans req.app (app.set('io', io) manquant ?)");
    } else {
      io.emit("chauffeur:nouvelle_course", {
        reservationId: reservation._id.toString(),
        depart: reservation.depart,
        destination: reservation.destination,
      });
    }

    return res.json({
      succes: true,
      message: "Recherche de chauffeur lancée",
    });
  } catch (e) {
    return res.status(500).json({ succes: false, message: e.message });
  }
};
