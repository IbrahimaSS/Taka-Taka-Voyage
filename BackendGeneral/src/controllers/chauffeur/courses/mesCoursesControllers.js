const Reservation = require("../../../models/Reservations");
const Notification = require("../../../models/Notifications");
const TaxiPartageService = require("../../../services/taxiPartageService");

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
            // 🚕 TAXI_PARTAGE : Logique spéciale pour taxi partagé
            $or: [
                // Courses normales : sans chauffeur ou assignées à ce chauffeur
                {
                    $and: [
                        { typeVehicule: { $ne: "TAXI_PARTAGE" } },
                        {
                            $or: [
                                { chauffeur: null },
                                { chauffeur: chauffeurId }
                            ]
                        }
                    ]
                },
                // 🚕 TAXI_PARTAGE : TOUTES les réservations TAXI_PARTAGE en attente
                // (même celles avec d'autres chauffeurs, pour permettre les groupes)
                {
                    typeVehicule: "TAXI_PARTAGE",
                    chauffeur: { $in: [null, chauffeurId] } // Seulement sans chauffeur ou ce chauffeur
                }
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
            // 🚕 TAXI_PARTAGE : Logique spéciale pour acceptation
            $or: [
                // Courses normales : sans chauffeur ou assignées à ce chauffeur
                {
                    $and: [
                        { typeVehicule: { $ne: "TAXI_PARTAGE" } },
                        {
                            $or: [
                                { chauffeur: null },
                                { chauffeur: chauffeurId }
                            ]
                        }
                    ]
                },
                // 🚕 TAXI_PARTAGE : Peut être acceptée même si déjà assignée à ce chauffeur
                // (pour ajouter au groupe existant)
                {
                    typeVehicule: "TAXI_PARTAGE",
                    $or: [
                        { chauffeur: null },
                        { chauffeur: chauffeurId }
                    ]
                }
            ]
        });


        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Cette réservation n'est plus disponible ou a déjà été acceptée par un autre chauffeur."
            });
        }

        // 🚕 TAXI_PARTAGE : Ne pas écraser le chauffeur si déjà assigné (pour les groupes)
        if (reservation.typeVehicule !== "TAXI_PARTAGE" || !reservation.chauffeur) {
            reservation.chauffeur = chauffeurId;
        }
        reservation.statut = "ACCEPTEE";

        // Ajouter à l'historique des offres
        reservation.offresEnvoyees.push({
            chauffeur: chauffeurId,
            statut: 'ACCEPTEE',
            envoyeeA: new Date()
        });

        await reservation.save();

        // 🚕 TAXI PARTAGÉ : Si c'est une réservation de taxi partagé, créer/gérer le groupe
        if (reservation.typeVehicule === "TAXI_PARTAGE") {
            try {
                const resultatGroupe = await TaxiPartageService.creerOuAjouterGroupe(reservation, chauffeurId);

                // Socket.IO pour taxi partagé
                if (io && resultatGroupe.groupe) {
                    // Notifier le chauffeur
                    io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:groupe_cree", {
                        groupe: resultatGroupe.groupe,
                        message: resultatGroupe.message
                    });

                    // Notifier les passagers du groupe
                    io.to(`GROUPE_${resultatGroupe.groupe._id}`).emit("taxipartage:groupe_mis_a_jour", {
                        groupe: resultatGroupe.groupe,
                        type: "creation"
                    });
                }

                console.log(`🚕 Taxi partagé accepté - Groupe ${resultatGroupe.groupe._id}`);
            } catch (error) {
                console.error("❌ Erreur création groupe taxi partagé:", error.message);
                // Ne pas bloquer l'acceptation, mais logger l'erreur
            }
        }

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

        const courses = await Reservation.find({
            chauffeur: chauffeurId,
            // On veut voir les courses en cours mais AUSSI les planifiées acceptées
            $or: [
                { statut: { $in: ["EN_COURS_DE_RECUPERATION", "ASSIGNEE", "ARRIVEE", "EN_COURS"] } },
                { statut: "ACCEPTEE", typeCourse: "PLANIFIEE" }
            ]
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ datePlanifiee: 1, createdAt: -1 });

        // Ajouter aussi les courses IMMEDIATE acceptées (qui entrent directement dans la file)
        const coursesImmediate = await Reservation.find({
            chauffeur: chauffeurId,
            statut: "ACCEPTEE",
            typeCourse: "IMMEDIATE",
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ createdAt: -1 });

        const toutesLesCourses = [...coursesImmediate, ...courses];

        res.json({ succes: true, courses: toutesLesCourses });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};

// ==================== COMMENCER UNE RÉSERVATION PLANIFIÉE ====================
// C'est le déclencheur officiel : transfère la réservation planifiée dans la file de ramassage
exports.commencerPlanifiee = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        const reservation = await Reservation.findOne({
            _id: reservationId,
            chauffeur: chauffeurId,
            typeCourse: "PLANIFIEE",
            statut: "ACCEPTEE",
        });

        if (!reservation) {
            return res.status(400).json({
                succes: false,
                message: "Réservation planifiée introuvable ou déjà en cours.",
            });
        }

        // Vérification de l'heure : marge de 15 minutes avant l'heure prévue
        if (reservation.datePlanifiee) {
            const scheduledTime = new Date(reservation.datePlanifiee);
            const now = new Date();
            const EARLY_MARGIN_MS = 15 * 60 * 1000; // 15 minutes

            if (scheduledTime - now > EARLY_MARGIN_MS) {
                const heures = scheduledTime.getHours().toString().padStart(2, '0');
                const minutes = scheduledTime.getMinutes().toString().padStart(2, '0');
                return res.status(400).json({
                    succes: false,
                    message: `Trop tôt ! Ce trajet est prévu à ${heures}:${minutes}. Vous pourrez le démarrer 15 min avant l'heure.`,
                });
            }
        }

        // ✅ Transition : ACCEPTEE → EN_COURS_DE_RECUPERATION
        // C'est ici que le passager entre officiellement dans la file de ramassage
        reservation.statut = "EN_COURS_DE_RECUPERATION";
        await reservation.save();

        // On ne notifie pas encore le passager par socket (il le sera au "Rejoindre" manuel)
        // Mais on crée une notification interne pour son historique
        await Notification.create({
            utilisateur: reservation.passager,
            message: `Votre course planifiée est prête ! Le chauffeur va bientôt se mettre en route.`,
        });

        res.json({
            succes: true,
            message: "Course planifiée activée ! Elle est maintenant dans votre file de ramassage.",
            reservation: reservation
        });
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
        // ✅ FIX: Accepter aussi EN_COURS_DE_RECUPERATION (après "Commencer" sur une planifiée)
        statut: { $in: ["ACCEPTEE", "EN_COURS_DE_RECUPERATION"] },
    });

    if (!reservation) return res.status(400).json({ succes: false, message: "Course non trouvée ou déjà prise" });

    // 🚕 TAXI PARTAGÉ : Si c'est un taxi partagé, utiliser la logique de groupe
    if (reservation.typeVehicule === "TAXI_PARTAGE") {
        try {
            const resultat = await TaxiPartageService.passerEnCoursDeRamassage(reservationId, chauffeurId);

            // Socket.IO pour taxi partagé
            const io = req.app.get("io");
            if (io) {
                // Notifier le passager concerné
                io.to(`PASSAGER_${reservation.passager}`).emit("taxipartage:chauffeur_en_route", {
                    reservationId: reservationId,
                    message: "Le chauffeur est en route pour vous récupérer"
                });

                // Notifier le chauffeur
                io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:en_route_passager", {
                    reservationId: reservationId,
                    message: "En route vers le passager"
                });
            }

            return res.json({ succes: true, message: "En route vers le passager (taxi partagé)" });
        } catch (error) {
            return res.status(400).json({ succes: false, message: error.message });
        }
    }

    // Logique normale pour course individuelle
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

    // 🚕 TAXI PARTAGÉ : Si c'est un taxi partagé, utiliser la logique de groupe
    if (reservation.typeVehicule === "TAXI_PARTAGE") {
        try {
            const resultat = await TaxiPartageService.signalerArriveePassager(reservationId, chauffeurId);

            // Socket.IO pour taxi partagé
            const io = req.app.get("io");
            if (io) {
                // Notifier le chauffeur
                io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:passager_ramasse", {
                    groupeId: resultat.groupeId,
                    reservationId: reservationId,
                    passagersRestants: resultat.passagersEnAttente,
                    peutDemarrer: resultat.peutDemarrer,
                    message: "Passager ramassé"
                });

                // Notifier tous les passagers du groupe
                io.to(`GROUPE_${resultat.groupeId}`).emit("taxipartage:passager_ramasse", {
                    groupeId: resultat.groupeId,
                    reservationId: reservationId,
                    passagersRestants: resultat.passagersEnAttente,
                    peutDemarrer: resultat.peutDemarrer,
                    message: "Un passager a été ramassé"
                });

                // Si tout le monde est ramassé, notifier que le trajet peut démarrer
                if (resultat.peutDemarrer) {
                    io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:peut_demarrer", {
                        groupeId: resultat.groupeId,
                        message: "✅ Tous les passagers sont à bord - prêt à démarrer !"
                    });
                }
            }

            return res.json(resultat);
        } catch (error) {
            return res.status(400).json({ succes: false, message: error.message });
        }
    }

    // Logique normale pour course individuelle
    reservation.statut = "ARRIVEE"; // nouveau statut (ajoute-le dans le modèle)
    await reservation.save();

    const pid = String(reservation.passager);
    // req.app.get("io").to(`PASSAGER_${pid}`).emit("course:chauffeur_arrive", { reservationId });

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

    // 🚕 TAXI PARTAGÉ : Validation BACKEND OBLIGATOIRE avant démarrage
    if (reservation.typeVehicule === "TAXI_PARTAGE") {
        try {
            // Validation backend obligatoire
            if (!reservation.groupeTaxiPartage) {
                return res.status(400).json({
                    succes: false,
                    message: "Cette réservation n'est pas associée à un groupe de taxi partagé"
                });
            }

            const validation = await TaxiPartageService.validerDemarrageTrajet(reservation.groupeTaxiPartage);

            if (!validation.peutDemarrer) {
                return res.status(400).json({
                    succes: false,
                    message: validation.message || "Impossible de démarrer - passagers en attente"
                });
            }

            // Démarrer le trajet pour tout le groupe
            const resultat = await TaxiPartageService.demarrerTrajetGroupe(reservation.groupeTaxiPartage, chauffeurId);

            // Socket.IO - BASCULEMENT MODE TRACKING POUR TOUT LE MONDE
            const io = req.app.get("io");
            if (io) {
                // Notifier tous les passagers du groupe - BASCULEMENT MODE TRACKING
                io.to(`GROUPE_${reservation.groupeTaxiPartage}`).emit("taxipartage:trajet_demarre", {
                    groupeId: reservation.groupeTaxiPartage,
                    message: "🚀 Le trajet commence ! Suivez le véhicule en temps réel",
                    groupe: resultat.groupe
                });

                // Notifier le chauffeur
                io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:trajet_demarre", {
                    groupeId: reservation.groupeTaxiPartage,
                    message: "Trajet démarré - Mode tracking activé",
                    groupe: resultat.groupe
                });

                console.log(`🚀 Socket.IO: Trajet démarré pour groupe ${reservation.groupeTaxiPartage} - Basculement mode tracking`);
            }

            return res.json(resultat);
        } catch (error) {
            return res.status(400).json({ succes: false, message: error.message });
        }
    }

    // Logique normale pour course individuelle
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
            return res.status(404).json({
                succes: false,
                message: "Impossible de terminer (course non trouvée ou statut incorrect)"
            });
        }

        // 🚕 TAXI PARTAGÉ : Si c'est un taxi partagé, utiliser la logique de groupe
        if (reservation.typeVehicule === "TAXI_PARTAGE" || reservation.groupeTaxiPartage) {
            try {
                const gid = reservation.groupeTaxiPartage;
                if (!gid) throw new Error("ID de groupe manquant pour taxi partagé");

                const result = await TaxiPartageService.terminerTrajetGroupe(gid, chauffeurId);

                // Socket.IO
                const io = req.app.get("io");
                if (io) {
                    io.to(`GROUPE_${gid}`).emit("taxipartage:trajet_termine", {
                        groupeId: gid,
                        message: "🏁 Trajet terminé ! Merci.",
                        result
                    });

                    // Notifier individuellement chaque passager pour le basculement d'interface (redondance)
                    for (const rid of result.reservationIds) {
                        io.to(`RESERVATION_${rid.toString()}`).emit("course:finit_avec_paiement", {
                            reservationId: rid.toString(),
                            message: "Trajet terminé !",
                            paymentStatus: "PAYE"
                        });
                    }
                }

                return res.json(result);
            } catch (error) {
                return res.status(400).json({ succes: false, message: error.message });
            }
        }

        // --- Cas Standard (Individuelle) ---
        reservation.statut = "TERMINEE";
        reservation.dateFin = new Date();
        await reservation.save();

        // 1. Persister dans Trajet model
        await Trajet.findOneAndUpdate(
            { reservation: reservationId },
            {
                statut: "TERMINEE",
                dateFin: reservation.dateFin,
                passager: reservation.passager,
                chauffeur: chauffeurId,
                depart: reservation.depart,
                destination: reservation.destination,
                distanceKm: reservation.distanceKm,
                dureeMin: reservation.dureeMin,
                prix: reservation.prix
            },
            { upsert: true, new: true }
        );

        // 2. Créer Paiement record
        try {
            const commissionRate = 0.20;
            const commissionPlateforme = Math.round(reservation.prix * commissionRate);
            const montantChauffeur = reservation.prix - commissionPlateforme;

            await Paiement.findOneAndUpdate(
                { reservation: reservationId },
                {
                    passager: reservation.passager,
                    chauffeur: chauffeurId,
                    statut: reservation.paiement?.statut === "PAYE" ? "PAYE" : "EN_ATTENTE",
                    montantTotal: reservation.prix,
                    commissionPlateforme,
                    montantChauffeur,
                    methode: reservation.paiement?.methode || "CASH",
                    verse: false
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (pErr) {
            console.error("❌ Erreur Paiement REST (Standard):", pErr.message);
        }

        // 3. Libérer chauffeur
        await Utilisateurs.findByIdAndUpdate(chauffeurId, { trajetEnCours: false });

        const pid = String(reservation.passager);
        const io = req.app.get("io");
        if (io) {
            // Unifier l'événement socket avec celui du socket.js
            io.to(`PASSAGER_${pid}`).emit("course:finit_avec_paiement", {
                reservationId,
                paymentStatus: reservation.paiement?.statut || "EN_ATTENTE"
            });
            io.to(`CHAUFFEUR_${chauffeurId}`).emit("course:finit_avec_paiement", { reservationId });
        }

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
            // ✅ FIX: Ne montrer que les ACCEPTEE (pas encore commencées)
            // Les EN_COURS_DE_RECUPERATION et + sont dans la file de ramassage
            statut: "ACCEPTEE",
        })
            .populate("passager", "nom prenom telephone photoUrl")
            .sort({ datePlanifiee: 1 });

        res.json({ succes: true, plannings });
    } catch (err) {
        res.status(500).json({ succes: false, message: err.message });
    }
};
