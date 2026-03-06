const Backup = require('../../models/Backup');
const ParametresPlateforme = require('../../models/ParametresPlateforme');
const mongoose = require('mongoose');

//============================= CRÉER UNE SAUVEGARDE =============================
exports.creerBackup = async (req, res) => {
    try {
        const { nom } = req.body;

        // 1. Récupérer les données à sauvegarder (Settings pour l'instant)
        const settings = await ParametresPlateforme.findOne() || {};

        // 2. Créer l'objet backup
        const newBackup = await Backup.create({
            nom: nom || `Sauvegarde_${new Date().toISOString().split('T')[0]}`,
            donnees: settings,
            createur: req.utilisateur?.id,
            type: 'MANUEL',
            statut: 'REUSSI'
        });

        res.status(201).json({
            succes: true,
            message: "Sauvegarde effectuée avec succès",
            backup: newBackup
        });
    } catch (erreur) {
        console.error("CREATE_BACKUP ERROR:", erreur);
        res.status(500).json({ succes: false, message: "Erreur lors de la sauvegarde" });
    }
};

//============================= LISTER LES SAUVEGARDES =============================
exports.listerBackups = async (req, res) => {
    try {
        const backups = await Backup.find().sort({ createdAt: -1 }).limit(10);
        res.json({
            succes: true,
            backups
        });
    } catch (erreur) {
        console.error("LIST_BACKUP ERROR:", erreur);
        res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};

//============================= RESTAURER UNE SAUVEGARDE =============================
exports.restaurerBackup = async (req, res) => {
    try {
        const { id } = req.params;
        const backup = await Backup.findById(id);

        if (!backup) {
            return res.status(404).json({ succes: false, message: "Sauvegarde introuvable" });
        }

        // Restaurer les settings
        if (backup.donnees) {
            await ParametresPlateforme.findOneAndUpdate({}, backup.donnees, { upsert: true });
        }

        res.json({
            succes: true,
            message: "Restauration effectuée avec succès"
        });
    } catch (erreur) {
        console.error("RESTORE_BACKUP ERROR:", erreur);
        res.status(500).json({ succes: false, message: "Erreur lors de la restauration" });
    }
};

//============================= SUPPRIMER UNE SAUVEGARDE =============================
exports.supprimerBackup = async (req, res) => {
    try {
        await Backup.findByIdAndDelete(req.params.id);
        res.json({ succes: true, message: "Sauvegarde supprimée" });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: "Erreur lors de la suppression" });
    }
};
