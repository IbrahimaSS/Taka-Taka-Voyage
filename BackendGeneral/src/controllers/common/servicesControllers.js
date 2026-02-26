const ParametresPlateforme = require("../../models/ParametresPlateforme");

/**
 * GET /api/services-actifs
 * Route PUBLIQUE : retourne les services configurés par l'admin.
 * - Les services activés sont renvoyés normalement
 * - Les services désactivés sont aussi renvoyés mais flaggés enabled: false
 *   pour que le frontend puisse les griser
 */
exports.getServicesActifs = async (req, res) => {
    try {
        let parametres = await ParametresPlateforme.findOne();

        // Si aucun paramètre n'existe, en créer un par défaut
        if (!parametres) {
            parametres = new ParametresPlateforme();
            await parametres.save();
        }

        const services = parametres.services || {};

        // Mapping interne → clé API pour compatibilité frontend/estimation
        const SERVICE_MAP = {
            motoTaxi: {
                id: "motoTaxi",
                backendKey: "MOTO",
                frontendKey: "moto",
                icon: "bike",
                color: "blue",
                features: ["Arrivée rapide", "Économique"],
            },
            sharedTaxi: {
                id: "sharedTaxi",
                backendKey: "TAXI",
                frontendKey: "taxi",
                icon: "car",
                color: "green",
                features: ["Bagages inclus", "Climatisation"],
            },
            privateCar: {
                id: "privateCar",
                backendKey: "VOITURE",
                frontendKey: "voiture",
                icon: "car",
                color: "purple",
                features: ["Wifi", "Eau offerte"],
            },
            delivery: {
                id: "delivery",
                backendKey: "LIVRAISON",
                frontendKey: "livraison",
                icon: "package",
                color: "orange",
                features: ["Livraison rapide", "Suivi en temps réel"],
            },
        };

        const servicesList = Object.entries(services).map(([key, svc]) => {
            const meta = SERVICE_MAP[key] || { id: key, backendKey: key.toUpperCase(), frontendKey: key, icon: "car", color: "gray", features: [] };
            const svcObj = svc.toObject ? svc.toObject() : svc;
            return {
                id: meta.id,
                backendKey: meta.backendKey,
                frontendKey: meta.frontendKey,
                name: svcObj.name,
                description: svcObj.description,
                icon: meta.icon,
                color: meta.color,
                features: meta.features,
                enabled: svcObj.enabled,
                pricing: {
                    basePrice: svcObj.basePrice,
                    perKm: svcObj.perKm,
                    perMinute: svcObj.perMinute,
                    minimumFare: svcObj.minimumFare,
                },
            };
        });

        res.status(200).json({
            success: true,
            services: servicesList,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des services actifs:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des services",
        });
    }
};
