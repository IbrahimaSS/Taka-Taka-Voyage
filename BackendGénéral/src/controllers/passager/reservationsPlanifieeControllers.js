const Reservation = require("../../models/Reservations");

// CREER RESERVATION PLANIFIEE
exports.creerReservationPlanifiee = async (req, res) => {
    try {
        const {
            depart,
            destination,
            departLat,
            departLng,
            destinationLat,
            destinationLng,
            distanceKm,
            dureeMin,
            typeVehicule,
            prix,
            date,
            heure,
            momentPaiement
        } = req.body;

        const dLat = Number(departLat);
        const dLng = Number(departLng);
        const aLat = Number(destinationLat);
        const aLng = Number(destinationLng);

        const datePlanifiee = new Date(`${date}T${heure}`);
        if (isNaN(datePlanifiee) || datePlanifiee <= new Date()) {
            return res.status(400).json({
                succes: false,
                message: "Date planifiée invalide"
            });
        }

        const reservation = await Reservation.create({
            passager: req.utilisateur._id,
            depart,
            departLat: isNaN(dLat) ? null : dLat,
            departLng: isNaN(dLng) ? null : dLng,
            departCoords: !isNaN(dLat) && !isNaN(dLng) ? { type: "Point", coordinates: [dLng, dLat] } : undefined,
            destination,
            destinationLat: isNaN(aLat) ? null : aLat,
            destinationLng: isNaN(aLng) ? null : aLng,
            destinationCoords: !isNaN(aLat) && !isNaN(aLng) ? { type: "Point", coordinates: [aLng, aLat] } : undefined,
            distanceKm,
            dureeMin,
            typeVehicule,
            prix,

            typeCourse: "PLANIFIEE",
            statut: "EN_ATTENTE", // ✅ IMPORTANT
            datePlanifiee,

            paiement:
                momentPaiement === "AVANT"
                    ? { statut: "EN_ATTENTE" }
                    : null,
        });

        res.status(201).json({
            succes: true,
            message: "Réservation planifiée créée avec succès",
            reservation,
        });
    } catch (e) {
        res.status(500).json({ succes: false, message: e.message });
    }
};

//LISTES DES RESERVATIONS PLANIFIEES POUR LE PASSAGER (pagination + filtre)
exports.listerPlanningPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur?._id;
        if (!passagerId) {
            return res.status(401).json({ succes: false, message: "Non authentifié" });
        }
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
        const skip = (page - 1) * limit;
        const filtre = {
            passager: passagerId,
            typeCourse: "PLANIFIEE",
            datePlanifiee: { $ne: null },
        };
        if (req.query.statut) filtre.statut = req.query.statut;
        if (req.query.typeVehicule) filtre.typeVehicule = req.query.typeVehicule;
        // Recherche simple depart/destination
        if (req.query.q) {
            const q = String(req.query.q).trim();
            filtre.$or = [
                { depart: { $regex: q, $options: "i" } },
                { destination: { $regex: q, $options: "i" } },
            ];
        }
        // Filtre par dates (sur datePlanifiee)
        if (req.query.dateFrom || req.query.dateTo) {
            const from = req.query.dateFrom ? new Date(`${req.query.dateFrom}T00:00:00.000Z`) : null;
            const to = req.query.dateTo ? new Date(`${req.query.dateTo}T23:59:59.999Z`) : null;

            filtre.datePlanifiee = { $ne: null };
            if (from) filtre.datePlanifiee.$gte = from;
            if (to) filtre.datePlanifiee.$lte = to;
        }

        const total = await Reservation.countDocuments(filtre);
        const items = await Reservation.find(filtre)
            .populate("chauffeur", "nom prenom telephone vehicule")
            .sort({ datePlanifiee: 1 }) // planning = du + proche au + loin
            .skip(skip)
            .limit(limit)
            .lean();

        // Stats (pour tes 3 cards)
        const [totalPlanifies, confirms, enAttente] = await Promise.all([
            Reservation.countDocuments({ passager: passagerId, typeCourse: "PLANIFIEE", datePlanifiee: { $ne: null } }),
            Reservation.countDocuments({ passager: passagerId, typeCourse: "PLANIFIEE", datePlanifiee: { $ne: null }, statut: "ACCEPTEE" }),
            Reservation.countDocuments({ passager: passagerId, typeCourse: "PLANIFIEE", datePlanifiee: { $ne: null }, statut: "EN_ATTENTE" }),
        ]);

        return res.status(200).json({
            succes: true,
            stats: {
                totalTrajets: totalPlanifies,
                confirmes: confirms,
                enAttente: enAttente,
            },
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            plannings: items,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// DÉTAIL D'UNE RÉSERVATION PLANIFIÉE POUR LE PASSAGER

exports.detailPlanningPassager = async (req, res) => {
    try {
        const passagerId = req.utilisateur?._id;
        const { reservationId } = req.params;

        if (!passagerId) {
            return res.status(401).json({ succes: false, message: "Non authentifié" });
        }
        const reservation = await Reservation.findOne({
            _id: reservationId,
            passager: passagerId,
            typeCourse: "PLANIFIEE",
        })
            .populate("chauffeur", "nom prenom telephone")
            .lean();

        if (!reservation) {
            return res.status(404).json({
                succes: false,
                message: "Programmation introuvable",
            });
        }

        return res.status(200).json({
            succes: true,
            planning: {
                id: reservation._id,
                typeVehicule: reservation.typeVehicule,
                prixEstime: reservation.prix,
                depart: reservation.depart,
                destination: reservation.destination,
                date: reservation.datePlanifiee,
                heure: reservation.datePlanifiee
                    ? new Date(reservation.datePlanifiee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                    : null,
                distanceKm: reservation.distanceKm,
                statut: reservation.statut,
                chauffeur: reservation.chauffeur
                    ? {
                        nom: reservation.chauffeur.nom,
                        prenom: reservation.chauffeur.prenom,
                        telephone: reservation.chauffeur.telephone,
                    }
                    : null,
            },
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// ANNULER UNE RÉSERVATION PLANIFIÉE PAR LE PASSAGER
exports.annulerReservationPlanifiee = async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        const { reservationId } = req.params;
        const reservation = await Reservation.findOne({
            _id: reservationId,
            passager: userId,
            typeCourse: "PLANIFIEE",
            statut: { $in: ["EN_ATTENTE", "ASSIGNEE"] },
        });

        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Réservation non annulable",
            });
        }

        reservation.statut = "ANNULEE";
        reservation.annuleeLe = new Date();
        reservation.annuleePar = userId;
        reservation.chauffeur = null;

        await reservation.save();

        res.json({
            succes: true,
            message: "Réservation planifiée annulée",
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// MODIFIER UNE RÉSERVATION PLANIFIÉE PAR LE PASSAGER
exports.modifierReservationPlanifiee = async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        const { reservationId } = req.params;
        const reservation = await Reservation.findOne({
            _id: reservationId,
            passager: userId,
            typeCourse: "PLANIFIEE",
            statut: "EN_ATTENTE",
        });

        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Modification impossible",
            });
        }

        // ⏱️ blocage si trop proche
        const diffMinutes =
            (reservation.datePlanifiee - new Date()) / 60000;

        if (diffMinutes < 30) {
            return res.status(400).json({
                succes: false,
                message: "Modification impossible à moins de 30 minutes",
            });
        }

        const champsAutorises = [
            "depart",
            "destination",
            "datePlanifiee",
            "typeVehicule",
        ];

        champsAutorises.forEach((champ) => {
            if (req.body[champ] !== undefined) {
                reservation[champ] = req.body[champ];
            }
        });

        await reservation.save();

        res.json({
            succes: true,
            message: "Réservation modifiée",
            reservation,
        });
    } catch (error) {
        res.status(500).json({ succes: false, message: error.message });
    }
};


