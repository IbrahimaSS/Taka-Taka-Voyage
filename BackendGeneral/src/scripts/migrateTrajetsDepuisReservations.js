require("dotenv").config();

const Reservation = require("../models/Reservations");
const Trajet = require("../models/Trajets");
const connectDB = require("../config/baseDeDonnees");

const run = async () => {
    await connectDB();

    console.log("🔍 Recherche des réservations EN_COURS et TERMINEE...");

    const reservations = await Reservation.find({
        statut: { $in: ["EN_COURS", "TERMINEE"] },
    });

    console.log("✅ Réservations trouvées :", reservations.length);

    for (const reservation of reservations) {
        const existe = await Trajet.findOne({
        reservation: reservation._id,
        });

        if (existe) {
        continue; // éviter les doublons
        }

        await Trajet.create({
        reservation: reservation._id,
        passager: reservation.passager,
        chauffeur: reservation.chauffeur,
        depart: reservation.depart,
        destination: reservation.destination,
        distanceKm: reservation.distanceKm,
        dureeMin: reservation.dureeMin,
        prix: reservation.prix,
        statut: reservation.statut,
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
        });
    }

    console.log("✅ Migration des trajets terminée avec succès");
    process.exit();
};

run();
