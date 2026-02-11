const axios = require("axios");

// Calcul itinéraire OpenStreetMap (OSRM)
exports.calculerRoute = async (coordDepart, coordDestination) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${coordDepart.lng},${coordDepart.lat};${coordDestination.lng},${coordDestination.lat}`;

    const response = await axios.get(url, {
        params: {
        overview: "false",
        alternatives: false,
        steps: false,
        },
    });

    const route = response.data?.routes?.[0];

    if (!route) {
        throw new Error("Impossible de calculer l’itinéraire (OSRM)");
    }

    return {
        distanceKm: route.distance / 1000,
        dureeMin: route.duration / 60,
    };
};
