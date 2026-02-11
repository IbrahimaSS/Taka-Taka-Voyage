const axios = require("axios");

// Géocodage précis OpenStreetMap (Guinée)
exports.geocoder = async (adresse) => {
    const url = "https://nominatim.openstreetmap.org/search";

    const response = await axios.get(url, {
        params: {
        q: adresse,
        format: "json",
        limit: 1,
        countrycodes: "gn",        // 🇬🇳 Forcer la Guinée
        addressdetails: 1,
        },
        headers: {
        "User-Agent": "TakaTakaApp/1.0 (contact@takataka.app)",
        },
    });

    const result = response.data?.[0];

    if (!result) {
        throw new Error("Adresse introuvable (OpenStreetMap)");
    }

    return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
    };
};
