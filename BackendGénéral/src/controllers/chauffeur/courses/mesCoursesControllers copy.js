const Reservation = require("../../../models/Reservations");
const Notification = require("../../../models/Notifications");

// ==================== LISTE DE RAMASSAGE (Mes Courses) ====================
exports.listeRamassage = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        const courses = await Reservation.find({
            chauffeur: chauffeurId,
            statut: { $in: ["ACCEPTEE", "ASSIGNEE"] }, // ou "VERS_PASSAGER" si tu veux
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ createdAt: -1 });

        res.json({ succes: true, courses });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};

// ==================== REJOINDRE (aller chercher le passager) ====================
exports.rejoindreCourse = async (req, res) => {
    const { reservationId } = req.params;
    const chauffeurId = req.utilisateur._id;

    const reservation = await Reservation.findOne({
        _id: reservationId,
        chauffeur: chauffeurId,
        statut: "ACCEPTEE",
    });

    if (!reservation) return res.status(400).json({ succes: false, message: "Course non trouvée ou déjà prise" });

    reservation.statut = "ASSIGNEE"; // ou "VERS_PASSAGER"
    await reservation.save();

    // Notification passager
    await Notification.create({
        utilisateur: reservation.passager,
        message: `Le chauffeur est en route pour vous récupérer 📍`,
    });

    const pid = String(reservation.passager);
    req.app.get("io").to(`PASSAGER_${pid}`).emit("course:chauffeur_en_route", {
        reservationId,
        message: "Le chauffeur arrive",
    });

    res.json({ succes: true, message: "Vous êtes en route vers le passager" });
};

// ==================== SIGNALER ARRIVÉE ====================
exports.signalerArrivee = async (req, res) => {
    const { reservationId } = req.params;
    const chauffeurId = req.utilisateur._id;

    const reservation = await Reservation.findOne({
        _id: reservationId,
        chauffeur: chauffeurId,
        statut: "ASSIGNEE",
    });

    if (!reservation) return res.status(400).json({ succes: false, message: "Impossible" });

    reservation.statut = "ARRIVEE"; // nouveau statut (ajoute-le dans le modèle)
    await reservation.save();

    const pid = String(reservation.passager);
    req.app.get("io").to(`PASSAGER_${pid}`).emit("course:chauffeur_arrive", { reservationId });

    res.json({ succes: true, message: "Arrivée signalée au passager" });
};

// ==================== DÉMARRER LE TRAJET ====================
exports.demarrerTrajet = async (req, res) => {
    const { reservationId } = req.params;
    const chauffeurId = req.utilisateur._id;

    const reservation = await Reservation.findOne({
        _id: reservationId,
        chauffeur: chauffeurId,
        statut: "ARRIVEE",
    });

    if (!reservation) return res.status(400).json({ succes: false, message: "Impossible de démarrer" });

    reservation.statut = "EN_COURS";
    reservation.dateDebut = new Date();
    await reservation.save();

    // Créer le Trajet réel si tu veux (optionnel)
    // await Trajet.create({ reservation: reservation._id, ... });

    const pid = String(reservation.passager);
    req.app.get("io").to(`PASSAGER_${pid}`).emit("course:demarre", { reservationId });
    req.app.get("io").to(`CHAUFFEUR_${chauffeurId}`).emit("course:demarre", { reservationId });

    res.json({ succes: true, message: "Trajet démarré – tracking activé" });
};