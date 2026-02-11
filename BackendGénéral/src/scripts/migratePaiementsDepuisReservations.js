require("dotenv").config();

const mongoose = require("mongoose");
const Reservation = require("../models/Reservations");
const Paiement = require("../models/Paiements");
const connectDB = require("../config/baseDeDonnees");

const run = async () => {
    await connectDB();

    console.log("🔍 Recherche des réservations PAYE...");

    const reservationsPayees = await Reservation.find({
        "paiement.statut": "PAYE",
    });

    console.log("✅ Réservations PAYE trouvées :", reservationsPayees.length);

    for (const reservation of reservationsPayees) {
        const existe = await Paiement.findOne({
        reservation: reservation._id,
        });

        if (existe) {
        continue; // on évite les doublons
        }

        const commission = Math.round(reservation.prix * 0.15);
        const montantChauffeur = reservation.prix - commission;

        await Paiement.create({
        reservation: reservation._id,
        montantTotal: reservation.prix,
        commissionPlateforme: commission,
        montantChauffeur: montantChauffeur,
        methode: reservation.paiement.methode,
        statut: "PAYE",
        createdAt: reservation.updatedAt,
        });
    }

    console.log("✅ Migration terminée avec succès");
    process.exit();
};

run();
