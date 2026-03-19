const ActivityLog = require("../models/ActivityLog");

/**
 * Enregistre une activité dans le journal d'audit
 * @param {Object} data 
 * @param {ObjectId} [data.utilisateurId] ID de l'utilisateur
 * @param {String} data.nomUtilisateur Nom complet ou email/tel (si non connecté)
 * @param {String} data.role Rôle de l'utilisateur (PASSAGER, CHAUFFEUR, ADMIN, etc.)
 * @param {String} data.action Libellé de l'action (ex: CONNEXION_REUSSIE)
 * @param {String} data.module Module concerné (AUTH, UTILISATEURS, etc.)
 * @param {Object} [data.details] Données supplémentaires (facultatif)
 * @param {String} [data.ip] Adresse IP (facultatif)
 * @param {String} [data.navigateur] User-Agent (facultatif)
 * @param {String} [data.statut] REUSSI ou ECHOUE (par défaut REUSSI)
 * @param {Boolean} [data.estSuspect] Indique si l'activité est suspecte
 * @param {String} [data.messageAlerte] Raison du soupçon
 */
const logActivity = async (data) => {
    try {
        const logData = {
            ...data,
            statut: data.statut || "REUSSI",
            estSuspect: data.estSuspect || false,
        };

        // Logique de détection suspects auto
        if (data.statut === "ECHOUE" && data.action === "CONNEXION") {
            // Optionnel : compter les échecs récents pour l'IP/User et marquer suspect
            // Pour l'instant on se fie au marquage explicite du contrôleur
        }

        const newLog = await new ActivityLog(logData).save();
        
        // 🔴 EMISSION SOCKET EN TEMPS RÉEL (Pour les Admins connectés)
        if (global.io) {
            global.io.to("ADMINS").emit("admin:log:new", {
                log: newLog,
                message: `📢 Nouvelle activité : ${newLog.action.replace(/_/g, ' ')} de ${newLog.nomUtilisateur}`
            });
        }

        return newLog;
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement du log d'activité :", error.message);
        return null;
    }
};

module.exports = { logActivity };
