const Utilisateurs = require("../models/Utilisateurs");

// * CALCUL DE LA DISTANCE ENTRE DEUX POINTS GÉOGRAPHIQUES
function calculerDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
    }

// * SELECTION INTELLIGENTES DES CHAUFFEURS
exports.trouverChauffeursEligibles = async ({
    departLat,
    departLng,
    typeVehicule,
    nombrePlaces = 1,
    rayonKm = 8,
    }) => {
    const chauffeurs = await Utilisateurs.find({
        role: "CHAUFFEUR",
        statut: "ACTIF",
        estEnLigne: true,
        "vehicule.type": typeVehicule,
        "vehicule.places": { $gte: nombrePlaces },
        trajetEnCours: false,
    }).select("_id socketId position vehicule");

    const chauffeursFiltres = chauffeurs
        .map((chauffeur) => {
        if (!chauffeur.position) return null;

        const distance = calculerDistanceKm(
            departLat,
            departLng,
            chauffeur.position.lat,
            chauffeur.position.lng
        );

        if (distance > rayonKm) return null;

        return {
            chauffeurId: chauffeur._id,
            socketId: chauffeur.socketId,
            distance,
        };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

    return chauffeursFiltres;
};
