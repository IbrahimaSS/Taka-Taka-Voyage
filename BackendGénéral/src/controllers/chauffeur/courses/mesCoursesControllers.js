const Reservation = require("../../../models/Reservations");
const Notification = require("../../../models/Notifications");

// ==================== LISTE DES RÉSERVATIONS DISPONIBLES (EN ATTENTE) ====================
exports.listeDisponible = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        // On récupère les réservations en attente :
        // - soit celles qui n'ont pas encore de chauffeur (ouvertes à tous)
        // - soit celles qui lui sont spécifiquement assignées mais non encore acceptées
        // ET que ce chauffeur n'a pas explicitement REFUSÉES
        // Calcul de la date limite pour J-1 (24h avant ou demain)
        const demain = new Date();
        demain.setDate(demain.getDate() + 1);
        demain.setHours(23, 59, 59, 999); // Jusqu'à la fin de la journée de demain

        const courses = await Reservation.find({
            statut: "EN_ATTENTE",
            $or: [
                { chauffeur: null },
                { chauffeur: chauffeurId }
            ],
            // ✅ FILTRE J-1 : Si c'est planifié, on n'affiche que si c'est pour aujourd'hui ou demain
            $or: [
                { typeCourse: "IMMEDIATE" },
                {
                    typeCourse: "PLANIFIEE",
                    datePlanifiee: { $lte: demain }
                }
            ],
            // On n'exclut que s'il y a une offre avec statut 'REFUSEE' pour ce chauffeur
            offresEnvoyees: {
                $not: {
                    $elemMatch: { chauffeur: chauffeurId, statut: "REFUSEE" }
                }
            }
        })
            .populate("passager", "nom prenom photoUrl noteMoyenne")
            .sort({ createdAt: -1 });


        res.json({ succes: true, courses });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};

// ==================== ACCEPTER UNE RÉSERVATION ====================
exports.accepterReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        const reservation = await Reservation.findOne({
            _id: reservationId,
            statut: "EN_ATTENTE",
            $or: [
                { chauffeur: null },
                { chauffeur: chauffeurId }
            ]
        });


        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Cette réservation n'est plus disponible ou a déjà été acceptée par un autre chauffeur."
            });
        }

        // Assigner le chauffeur et changer le statut
        reservation.chauffeur = chauffeurId;
        reservation.statut = "ACCEPTEE";

        // Ajouter à l'historique des offres
        reservation.offresEnvoyees.push({
            chauffeur: chauffeurId,
            statut: 'ACCEPTEE',
            envoyeeA: new Date()
        });

        await reservation.save();

        // Notification au passager
        await Notification.create({
            utilisateur: reservation.passager,
            message: `Un chauffeur a accepté votre course ! 🚗`,
        });

        const pid = String(reservation.passager);
        const io = req.app.get("io");
        if (io) {
            // Notification standard
            io.to(`PASSAGER_${pid}`).emit("course:chauffeur_trouve", {
                reservationId,
                chauffeurId
            });

            // Notification spécifique Planning si c'est une course planifiée
            if (reservation.typeCourse === "PLANIFIEE") {
                io.to(`PASSAGER_${pid}`).emit("reservation:planifiee_acceptee", {
                    reservationId,
                    chauffeur: {
                        id: chauffeurId,
                        nom: req.utilisateur.nom,
                        prenom: req.utilisateur.prenom
                    }
                });
                // On informe aussi les autres chauffeurs que cette course n'est plus dispo dans le marketplace planning
                io.to("CHAUFFEURS").emit("reservation:planifiee_prise", { reservationId });
            }
        }

        res.json({ succes: true, message: "Vous avez accepté la course avec succès !" });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};

// ==================== REFUSER UNE RÉSERVATION ====================
exports.refuserReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) return res.status(404).json({ succes: false, message: "Réservation introuvable" });

        // Marquer comme refusée par ce chauffeur pour ne plus lui montrer
        reservation.offresEnvoyees.push({
            chauffeur: chauffeurId,
            statut: 'REFUSEE',
            envoyeeA: new Date()
        });

        await reservation.save();

        res.json({ succes: true, message: "Demande ignorée" });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};

// ==================== LISTE DE RAMASSAGE (Mes Courses Acceptées) ====================
exports.listeRamassage = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        const demain = new Date();
        demain.setDate(demain.getDate() + 1);
        demain.setHours(23, 59, 59, 999);

        const courses = await Reservation.find({
            chauffeur: chauffeurId,
            statut: { $in: ["ACCEPTEE", "ASSIGNEE", "ARRIVEE", "EN_COURS"] },
            // ✅ FILTRE J-1 : Un trajet planifié n'entre dans la "liste de ramassage" qu'à J-1
            $or: [
                { typeCourse: "IMMEDIATE" },
                {
                    typeCourse: "PLANIFIEE",
                    datePlanifiee: { $lte: demain }
                }
            ]
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ datePlanifiee: 1, createdAt: -1 });

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

// ==================== TERMINER LE TRAJET ====================
exports.terminerTrajet = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        const reservation = await Reservation.findOne({
            _id: reservationId,
            chauffeur: chauffeurId,
            statut: "EN_COURS",
        });

        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Impossible de terminer (course non trouvée ou statut incorrect)"
            });
        }

        reservation.statut = "TERMINEE";
        reservation.dateFin = new Date();
        await reservation.save();

        const pid = String(reservation.passager);
        req.app.get("io").to(`PASSAGER_${pid}`).emit("course:terminee", { reservationId });
        req.app.get("io").to(`CHAUFFEUR_${chauffeurId}`).emit("course:terminee", { reservationId });

        res.json({ succes: true, message: "Course terminée avec succès" });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};
// ==================== LISTE DES PLANNINGS (Réservations Planifiées Acceptées) ====================
exports.listePlannings = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        const plannings = await Reservation.find({
            chauffeur: chauffeurId,
            typeCourse: "PLANIFIEE",
            statut: { $in: ["ACCEPTEE", "ASSIGNEE", "ARRIVEE", "EN_COURS"] },
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ datePlanifiee: 1 });

        res.json({ succes: true, plannings });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};
