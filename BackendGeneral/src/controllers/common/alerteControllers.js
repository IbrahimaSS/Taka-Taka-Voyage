const AlerteCalls = require("../../models/AlerteCalls");

/**
 * Enregistre un log d'appel de secours dans la base de données
 */
exports.logCall = async (req, res) => {
    try {
        const { service, numero, lat, lng } = req.body;

        if (!service || !numero) {
            return res.status(400).json({
                succes: false,
                message: "Les informations de service et numéro sont requises.",
            });
        }

        const callLog = new AlerteCalls({
            utilisateur: req.utilisateur.id,
            role: req.utilisateur.role, // Le role vient du middleware verifierToken via req.utilisateur
            service,
            numero,
            position: lat && lng ? { lat, lng } : null,
            dateAppel: new Date(),
        });

        await callLog.save();

        console.log(`📞 [ALERTE] Appel enregistré: ${service} par ${req.utilisateur.id} (${req.utilisateur.role})`);

        res.status(201).json({
            succes: true,
            message: "Appel enregistré avec succès",
        });
    } catch (error) {
        console.error("❌ Erreur lors du logging de l'appel d'alerte:", error);
        res.status(500).json({
            succes: false,
            message: "Erreur lors de l'enregistrement de l'appel",
            erreur: error.message,
        });
    }
};
