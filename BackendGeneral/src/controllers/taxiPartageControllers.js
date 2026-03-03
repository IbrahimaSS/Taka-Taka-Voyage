const TaxiPartageService = require("../services/taxiPartageService");
const Reservation = require("../models/Reservations");
const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");

// ==================== VALIDER SI LE TRAJET PEUT DÉMARRER (BACKEND OBLIGATOIRE) ====================
exports.validerDemarrageTrajet = async (req, res) => {
    try {
        const { groupeId } = req.params;
        
        if (!groupeId) {
            return res.status(400).json({
                succes: false,
                message: "ID du groupe requis"
            });
        }

        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);
        
        res.json({
            succes: true,
            ...validation
        });

    } catch (error) {
        console.error("❌ validerDemarrageTrajet:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== CRÉER UN GROUPE DE TAXI PARTAGÉ ====================
exports.creerGroupeTaxiPartage = async (req, res) => {
    try {
        const { reservationId } = req.body;
        const chauffeurId = req.utilisateur._id;

        if (!reservationId) {
            return res.status(400).json({
                succes: false,
                message: "ID de réservation requis"
            });
        }

        // Vérifier que la réservation existe et appartient au chauffeur
        const reservation = await Reservation.findOne({
            _id: reservationId,
            chauffeur: chauffeurId,
            typeVehicule: "TAXI_PARTAGE"
        }).populate('passager');

        if (!reservation) {
            return res.status(404).json({
                succes: false,
                message: "Réservation introuvable ou n'est pas un taxi partagé"
            });
        }

        const resultat = await TaxiPartageService.creerOuAjouterGroupe(reservation, chauffeurId);

        // Émettre Socket.IO pour notifier en temps réel
        const io = req.app.get("io");
        if (io && resultat.groupe) {
            // Notifier le chauffeur
            io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:groupe_cree", {
                groupe: resultat.groupe,
                message: resultat.message
            });

            // Notifier les passagers du groupe
            io.to(`GROUPE_${resultat.groupe._id}`).emit("taxipartage:groupe_mis_a_jour", {
                groupe: resultat.groupe,
                type: "creation"
            });
        }

        res.json(resultat);

    } catch (error) {
        console.error("❌ creerGroupeTaxiPartage:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== AJOUTER UN PASSAGER AU GROUPE ====================
exports.ajouterPassagerGroupe = async (req, res) => {
    try {
        const { groupeId, reservationId } = req.body;
        const chauffeurId = req.utilisateur._id;

        if (!groupeId || !reservationId) {
            return res.status(400).json({
                succes: false,
                message: "ID du groupe et de la réservation requis"
            });
        }

        // Vérifier que le groupe appartient au chauffeur
        const groupe = await GroupeTaxiPartage.findOne({
            _id: groupeId,
            chauffeur: chauffeurId
        });

        if (!groupe) {
            return res.status(404).json({
                succes: false,
                message: "Groupe introuvable ou accès non autorisé"
            });
        }

        // Vérifier la réservation
        const reservation = await Reservation.findById(reservationId);
        if (!reservation || reservation.chauffeur.toString() !== chauffeurId.toString()) {
            return res.status(404).json({
                succes: false,
                message: "Réservation introuvable"
            });
        }

        const resultat = await TaxiPartageService.creerOuAjouterGroupe(reservation, chauffeurId);

        // Socket.IO
        const io = req.app.get("io");
        if (io) {
            io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:passager_ajoute", {
                groupe: resultat.groupe,
                message: "Nouveau passager ajouté au groupe"
            });

            io.to(`GROUPE_${groupeId}`).emit("taxipartage:groupe_mis_a_jour", {
                groupe: resultat.groupe,
                type: "passager_ajoute"
            });
        }

        res.json(resultat);

    } catch (error) {
        console.error("❌ ajouterPassagerGroupe:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== SIGNALER ARRIVÉE PASSAGER ====================
exports.signalerArriveePassager = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        if (!reservationId) {
            return res.status(400).json({
                succes: false,
                message: "ID de réservation requis"
            });
        }

        const resultat = await TaxiPartageService.signalerArriveePassager(reservationId, chauffeurId);

        // Socket.IO - Notifications temps réel
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

        res.json(resultat);

    } catch (error) {
        console.error("❌ signalerArriveePassager:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== PASSER EN COURS DE RAMASSAGE ====================
exports.passerEnCoursDeRamassage = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const chauffeurId = req.utilisateur._id;

        if (!reservationId) {
            return res.status(400).json({
                succes: false,
                message: "ID de réservation requis"
            });
        }

        const resultat = await TaxiPartageService.passerEnCoursDeRamassage(reservationId, chauffeurId);

        // Socket.IO
        const io = req.app.get("io");
        if (io) {
            // Notifier le passager concerné
            const reservation = await Reservation.findById(reservationId);
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

        res.json(resultat);

    } catch (error) {
        console.error("❌ passerEnCoursDeRamassage:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== DÉMARRER TRAJET GROUPE ====================
exports.demarrerTrajetGroupe = async (req, res) => {
    try {
        const { groupeId } = req.params;
        const chauffeurId = req.utilisateur._id;

        if (!groupeId) {
            return res.status(400).json({
                succes: false,
                message: "ID du groupe requis"
            });
        }

        // Validation BACKEND OBLIGATOIRE avant de démarrer
        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);
        
        if (!validation.peutDemarrer) {
            return res.status(400).json({
                succes: false,
                message: validation.message || "Impossible de démarrer - passagers en attente"
            });
        }

        const resultat = await TaxiPartageService.demarrerTrajetGroupe(groupeId, chauffeurId);

        // Socket.IO - Basculement mode tracking pour tout le monde
        const io = req.app.get("io");
        if (io) {
            // Notifier tous les passagers du groupe - BASCULEMENT MODE TRACKING
            io.to(`GROUPE_${groupeId}`).emit("taxipartage:trajet_demarre", {
                groupeId: groupeId,
                message: "🚀 Le trajet commence ! Suivez le véhicule en temps réel",
                groupe: resultat.groupe
            });

            // Notifier le chauffeur
            io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:trajet_demarre", {
                groupeId: groupeId,
                message: "Trajet démarré - Mode tracking activé",
                groupe: resultat.groupe
            });

            console.log(`🚀 Socket.IO: Trajet démarré pour groupe ${groupeId} - Basculement mode tracking`);
        }

        res.json(resultat);

    } catch (error) {
        console.error("❌ demarrerTrajetGroupe:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== TERMINER TRAJET GROUPE ====================
exports.terminerTrajetGroupe = async (req, res) => {
    try {
        const { groupeId } = req.params;
        const chauffeurId = req.utilisateur._id;

        if (!groupeId) {
            return res.status(400).json({
                succes: false,
                message: "ID du groupe requis"
            });
        }

        const resultat = await TaxiPartageService.terminerTrajetGroupe(groupeId, chauffeurId);

        // Socket.IO
        const io = req.app.get("io");
        if (io) {
            io.to(`GROUPE_${groupeId}`).emit("taxipartage:trajet_termine", {
                groupeId: groupeId,
                message: "🎉 Trajet terminé ! Merci d'avoir utilisé Taka-Taka Voyage"
            });

            io.to(`CHAUFFEUR_${chauffeurId}`).emit("taxipartage:trajet_termine", {
                groupeId: groupeId,
                message: "Trajet terminé avec succès"
            });
        }

        res.json(resultat);

    } catch (error) {
        console.error("❌ terminerTrajetGroupe:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== OBTENIR FILE D'ATTENTE RAMASSAGE ====================
exports.getFileRamassage = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        const resultat = await TaxiPartageService.getFileRamassage(chauffeurId);

        res.json(resultat);

    } catch (error) {
        console.error("❌ getFileRamassage:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== OBTENIR DÉTAILS GROUPE ====================
exports.getDetailsGroupe = async (req, res) => {
    try {
        const { groupeId } = req.params;
        const chauffeurId = req.utilisateur._id;

        if (!groupeId) {
            return res.status(400).json({
                succes: false,
                message: "ID du groupe requis"
            });
        }

        const groupe = await GroupeTaxiPartage.findOne({
            _id: groupeId,
            chauffeur: chauffeurId
        }).populate({
            path: 'reservations.reservation',
            populate: {
                path: 'passager',
                select: 'nom prenom telephone photoUrl noteMoyenne'
            }
        });

        if (!groupe) {
            return res.status(404).json({
                succes: false,
                message: "Groupe introuvable"
            });
        }

        // Valider si peut démarrer
        const validation = await TaxiPartageService.validerDemarrageTrajet(groupeId);

        res.json({
            succes: true,
            groupe: groupe,
            peutDemarrer: validation.peutDemarrer,
            validation: validation
        });

    } catch (error) {
        console.error("❌ getDetailsGroupe:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

// ==================== LISTE DES GROUPES ACTIFS DU CHAUFFEUR ====================
exports.getGroupesActifs = async (req, res) => {
    try {
        const chauffeurId = req.utilisateur._id;

        const groupes = await GroupeTaxiPartage.trouverGroupesActifs(chauffeurId);

        res.json({
            succes: true,
            groupes: groupes
        });

    } catch (error) {
        console.error("❌ getGroupesActifs:", error.message);
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};
