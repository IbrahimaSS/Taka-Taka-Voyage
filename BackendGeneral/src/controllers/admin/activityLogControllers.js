const ActivityLog = require("../../models/ActivityLog");
const Utilisateurs = require("../../models/Utilisateurs");

// @desc    Récupérer tous les logs d'activité (Paginé + Filtres)
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const { search, role, module: moduleParam, statut, estSuspect, dateDebut, dateFin } = req.query;

        const filtre = {};

        // Recherche textuelle (Nom ou Action)
        if (search) {
            filtre.$or = [
                { nomUtilisateur: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } },
            ];
        }

        // Filtres exacts
        if (role) filtre.role = role;
        if (moduleParam) filtre.module = moduleParam;
        if (statut) filtre.statut = statut;
        if (estSuspect === "true") filtre.estSuspect = true;

        // Filtre par date
        if (dateDebut || dateFin) {
            filtre.createdAt = {};
            if (dateDebut) filtre.createdAt.$gte = new Date(dateDebut);
            if (dateFin) {
                const fin = new Date(dateFin);
                fin.setHours(23, 59, 59, 999);
                filtre.createdAt.$lte = fin;
            }
        }

        const total = await ActivityLog.countDocuments(filtre);
        const logs = await ActivityLog.find(filtre)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("utilisateurId", "nom prenom email photoUrl");

        return res.status(200).json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            logs,
        });
    } catch (error) {
        console.error("❌ CRITICAL ERROR [getActivityLogs]:", error);
        return res.status(500).json({
            succes: false,
            message: "Erreur serveur lors de la récupération des logs",
            error: error.message
        });
    }
};

// @desc    Récupérer les stats rapides des activités (pour alertes)
// @route   GET /api/admin/logs/stats
// @access  Private (Admin)
exports.getLogStats = async (req, res) => {
    try {
        const totalSuspects = await ActivityLog.countDocuments({ estSuspect: true });
        const echecsDuJour = await ActivityLog.countDocuments({
            statut: "ECHOUE",
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        // Top actions suspectes récentes
        const alertesRecentes = await ActivityLog.find({ estSuspect: true })
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            succes: true,
            stats: {
                totalSuspects,
                echecsDuJour,
                alertesRecentes
            }
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// @desc    Supprimer les anciens logs (Maintenance)
// @route   DELETE /api/admin/logs/purge
// @access  Private (Admin Superviseur)
exports.purgeOldLogs = async (req, res) => {
    try {
        const { jours } = req.body || { jours: 90 }; // Par défaut 90 jours
        const dateLimite = new Date();
        dateLimite.setDate(dateLimite.getDate() - jours);

        const result = await ActivityLog.deleteMany({ createdAt: { $lt: dateLimite } });

        return res.status(200).json({
            succes: true,
            message: `${result.deletedCount} anciens logs supprimés avec succès.`,
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

// @desc    Signaler un utilisateur à partir d'un log
// @route   POST /api/admin/logs/report-user
exports.reportUserFromLog = async (req, res) => {
    try {
        const { logId, raison } = req.body;
        const log = await ActivityLog.findById(logId);
        if (!log) return res.status(404).json({ succes: false, message: "Log introuvable" });

        log.estSuspect = true;
        log.messageAlerte = raison || "Signalé par l'administrateur";
        await log.save();

        if (log.utilisateurId) {
            await Utilisateurs.findByIdAndUpdate(log.utilisateurId, {
                $set: { noteInterne: `Signalé via journal d'audit: ${log.action}` }
            });
        }

        return res.json({ succes: true, message: "Action signalée avec succès" });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};
