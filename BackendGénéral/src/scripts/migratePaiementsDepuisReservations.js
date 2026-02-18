require("dotenv").config();

const mongoose = require("mongoose");
const Reservation = require("../models/Reservations");
const Paiement = require("../models/Paiements");
const connectDB = require("../config/baseDeDonnees");

const run = async () => {
    await connectDB();

    console.log("🔍 Recherche des réservations terminées...");

    const reservationsPayees = await Reservation.find({
        statut: { $in: ["TERMINE", "TERMINEE"] }
    });

    console.log("✅ Réservations terminées trouvées :", reservationsPayees.length);
    if (reservationsPayees.length > 0) {
        console.log("Exemple de statut:", reservationsPayees[0].statut);
    }

    for (const reservation of reservationsPayees) {
        console.log(`- Migration reservation: ${reservation._id}`);
        const existe = await Paiement.findOne({
            reservation: reservation._id,
        });

        if (existe) {
            continue; // on évite les doublons
        }

        const commission = Math.round(reservation.prix * 0.20);
        const montantChauffeur = reservation.prix - commission;

        await Paiement.create({
            reservation: reservation._id,
            passager: reservation.passager,
            chauffeur: reservation.chauffeur,
            montantTotal: reservation.prix,
            commissionPlateforme: commission,
            montantChauffeur: montantChauffeur,
            methode: reservation.paiement.methode || "CASH",
            statut: "PAYE",
            verse: false,
            createdAt: reservation.updatedAt,
        });
    }

    console.log("✅ Migration terminée avec succès");
    process.exit();
};

run();
