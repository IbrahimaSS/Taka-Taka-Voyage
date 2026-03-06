const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    taille: {
        type: Number // en octets
    },
    type: {
        type: String,
        enum: ['MANUEL', 'AUTOMATIQUE'],
        default: 'MANUEL'
    },
    fichierUrl: {
        type: String // chemin vers le fichier sur le serveur ou S3
    },
    donnees: {
        type: Object // Stockage direct des json de settings par exemple
    },
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateurs'
    },
    statut: {
        type: String,
        enum: ['REUSSI', 'ECHOUE', 'EN_COURS'],
        default: 'REUSSI'
    }
}, { timestamps: true });

module.exports = mongoose.model('Backup', backupSchema);
