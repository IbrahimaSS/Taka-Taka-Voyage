const Utilisateur = require("../../models/Utilisateurs");

// 🔔 Mettre à jour les préférences de notifications
exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.utilisateur._id;
        const champsAutorises = ["trajet", "promotionnelles", "sms"];
        const notifications = {};

        champsAutorises.forEach((champ) => {
        if (req.body[champ] !== undefined) {
            notifications[`notifications.${champ}`] = req.body[champ];
        }
        });

        await Utilisateur.findByIdAndUpdate(userId, {
        $set: notifications,
        });

        return res.status(200).json({
        succes: true,
        message: "Notifications mises à jour",
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// 🔔 Récupérer les notifications
exports.getNotifications = async (req, res) => {
    try {
        const Notification = require("../../models/Notifications");
        const notifications = await Notification.find({ utilisateur: req.utilisateur._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            succes: true,
            donnees: notifications
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            message: "Erreur lors de la récupération des notifications",
            erreur: error.message
        });
    }
};
