const Ticket = require("../../models/Ticket");
const Reservation = require("../../models/Reservations");
const { logActivity } = require("../../utils/logger");
const ChauffeurProfile = require("../../models/ChauffeurProfile");
const Utilisateurs = require("../../models/Utilisateurs");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

/**
 * Génère un ticket QR pour une réservation acceptée
 * (Utilisé en interne par Socket.io ou le contrôleur de réservation)
 */
exports.genererTicketInterne = async (reservation, chauffeurDoc, chauffeurProfile) => {
    try {
        const codeUnique = `TKT-${uuidv4()}`;
        
        // Génération de l'image QR en Base64
        const qrCodeBase64 = await QRCode.toDataURL(codeUnique, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            width: 400,
            margin: 1
        });

        // Préparation des infos véhicule
        const vehicleInfo = {
            marque: chauffeurProfile?.marqueVehicule || chauffeurDoc?.vehicule?.marque || "N/A",
            modele: chauffeurProfile?.modeleVehicule || chauffeurDoc?.vehicule?.modele || "N/A",
            immatriculation: chauffeurProfile?.plaque || chauffeurDoc?.vehicule?.immatriculation || "N/A",
            couleur: chauffeurProfile?.couleurVehicule || chauffeurDoc?.vehicule?.couleur || "N/A",
        };

        const nouveauTicket = new Ticket({
            reservation: reservation._id,
            passager: reservation.passager?._id || reservation.passager,
            chauffeur: reservation.chauffeur,
            codeUnique,
            qrCodeBase64,
            depart: reservation.depart,
            destination: reservation.destination,
            distanceKm: reservation.distanceKm,
            dureeMin: reservation.dureeMin,
            prix: reservation.prix,
            methodePaiement: reservation.paiement?.methode || "N/A",
            vehicule: vehicleInfo,
            statut: "GENERE"
        });

        await nouveauTicket.save();
        console.log(`🎫 Ticket généré avec succès pour la réservation ${reservation._id}`);
        return nouveauTicket;
    } catch (error) {
        console.error("🚨 Erreur lors de la génération du ticket:", error);
        throw error;
    }
};

/**
 * Récupère tous les tickets du passager connecté (Pour la section Profil)
 */
exports.getMesTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ passager: req.utilisateur.id || req.utilisateur._id })
                                    .populate("chauffeur", "nom prenom photoUrl")
                                    .sort({ createdAt: -1 })
                                    .limit(50);
        
        res.status(200).json({
            succes: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        res.status(500).json({ succes: false, erreur: error.message });
    }
};

/**
 * Récupère le ticket spécifique d'une réservation (Pour l'écran de suivi)
 */
exports.getTicketParReservation = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ 
            reservation: req.params.reservationId,
            passager: req.utilisateur.id || req.utilisateur._id 
        }).populate("chauffeur", "nom prenom photoUrl");

        if (!ticket) {
            return res.status(404).json({ succes: false, message: "Ticket introuvable" });
        }

        res.status(200).json({ succes: true, data: ticket });
    } catch (error) {
        res.status(500).json({ succes: false, erreur: error.message });
    }
};

/**
 * Valide un ticket via son code QR (Action du chauffeur)
 */
exports.validerScannerTicket = async (req, res) => {
    try {
        const { codeUnique } = req.body;

        if (!codeUnique) {
            return res.status(400).json({ succes: false, message: "Code QR manquant" });
        }

        const ticket = await Ticket.findOne({ codeUnique });

        if (!ticket) {
            return res.status(404).json({ succes: false, message: "Ticket invalide" });
        }

        if (ticket.statut !== "GENERE") {
            return res.status(400).json({ succes: false, message: `Ce ticket est déjà ${ticket.statut.toLowerCase()}` });
        }

        // Vérifier si c'est bien le chauffeur assigné qui scanne
        if (ticket.chauffeur.toString() !== (req.utilisateur.id || req.utilisateur._id).toString()) {
            return res.status(403).json({ succes: false, message: "Ce ticket ne correspond pas à votre course" });
        }

        // Validation du ticket
        ticket.statut = "VALIDE";
        ticket.scanneLe = new Date();
        await ticket.save();

        // Mise à jour de la réservation corrrespondante
        await Reservation.findByIdAndUpdate(ticket.reservation, { 
            statut: "RECUPERE",
            statutRecuperation: "RAMASSE" // Pour taxi partagé
        });

        // ✅ JOURNAL D'ACTIVITÉ (ADMIN)
        await logActivity({
            utilisateurId: req.utilisateur.id || req.utilisateur._id,
            nomUtilisateur: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
            role: "CHAUFFEUR",
            action: "VALIDATION_TICKET_QR",
            module: "TRAJETS",
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown",
            details: { reservationId: ticket.reservation, ticketId: ticket._id },
            statut: "REUSSI"
        });

        res.status(200).json({
            succes: true,
            message: "Ticket validé. Passager prêt pour le voyage !",
            ticket
        });
    } catch (error) {
        res.status(500).json({ succes: false, erreur: error.message });
    }
};
