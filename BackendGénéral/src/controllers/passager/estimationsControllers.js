const { geocoder } = require("../../services/geocodingService");
const { calculerRoute } = require("../../services/routingService");
const ParametresPlateforme = require("../../models/ParametresPlateforme");

// Mapping frontendKey → serviceKey dans ParametresPlateforme
const VEHICLE_TO_SERVICE = {
    MOTO: "motoTaxi",
    TAXI: "sharedTaxi",
    VOITURE: "privateCar",
    LIVRAISON: "delivery",
    // Alias minuscules utilisés par le front
    moto: "motoTaxi",
    taxi: "sharedTaxi",
    voiture: "privateCar",
    livraison: "delivery",
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

        // ── Récupérer les tarifs dynamiques depuis la DB ──
        let parametres = await ParametresPlateforme.findOne().lean();
        if (!parametres) {
            parametres = await new (require("../../models/ParametresPlateforme"))().save();
            parametres = parametres.toObject();
        }

        const serviceKey = VEHICLE_TO_SERVICE[typeVehicule];
        if (!serviceKey || !parametres.services?.[serviceKey]) {
            return res.status(400).json({
                succes: false,
                message: "Type de véhicule invalide",
            });
        }

        const service = parametres.services[serviceKey];

        // Vérifier que le service est activé
        if (!service.enabled) {
            return res.status(400).json({
                succes: false,
                message: `Le service "${service.name}" est actuellement désactivé`,
            });
        }

        const coordDepart = await geocoder(depart);
        const coordDestination = await geocoder(destination);

        const route = await calculerRoute(coordDepart, coordDestination);

        const distanceKm = Number(route.distanceKm.toFixed(1));
        const dureeMin = Math.round(route.dureeMin);

        // ── Calcul du prix avec les tarifs admin ──
        let prix =
            service.basePrice +
            distanceKm * service.perKm +
            dureeMin * service.perMinute;

        // Appliquer le prix minimum
        prix = Math.max(Math.round(prix), service.minimumFare || 0);

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
