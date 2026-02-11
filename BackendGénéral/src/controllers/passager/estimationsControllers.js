const { geocoder } = require("../../services/geocodingService");
const { calculerRoute } = require("../../services/routingService");

const TARIFS = {
    MOTO: { prixBase: 20000, tarifKm: 500, tarifDuree: 5, coefficient: 1.1 },
    TAXI: { prixBase: 5000, tarifKm: 400, tarifDuree: 10, coefficient: 1.1 },
    VOITURE: { prixBase: 6000, tarifKm: 450, tarifDuree: 12, coefficient: 1.15 },
    BUS: { prixBase: 8000, tarifKm: 300, tarifDuree: 8, coefficient: 1.05 },
    };

    exports.estimerTrajet = async (req, res) => {
    try {
        const { depart, destination, typeVehicule = "TAXI" } = req.body;

        if (!depart || !destination) {
        return res.status(400).json({
            succes: false,
            message: "Départ et destination sont obligatoires",
        });
        }

        const tarif = TARIFS[typeVehicule];
        if (!tarif) {
        return res.status(400).json({
            succes: false,
            message: "Type de véhicule invalide",
        });
        }

        const coordDepart = await geocoder(depart);
        const coordDestination = await geocoder(destination);

        const route = await calculerRoute(coordDepart, coordDestination);

        const distanceKm = Number(route.distanceKm.toFixed(1));
        const dureeMin = Math.round(route.dureeMin);

        let prix =
        tarif.prixBase +
        distanceKm * tarif.tarifKm +
        dureeMin * tarif.tarifDuree;

        prix = Math.round(prix * tarif.coefficient);

        return res.status(200).json({
        succes: true,
        estimation: {
            depart: {
            label: depart,
            lat: coordDepart.lat,
            lng: coordDepart.lng,
            },
            destination: {
            label: destination,
            lat: coordDestination.lat,
            lng: coordDestination.lng,
            },
            distanceKm,
            dureeMin,
            prix,
            geometry: route.geometry,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
