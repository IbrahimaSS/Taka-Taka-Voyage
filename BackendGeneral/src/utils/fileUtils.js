const fs = require('fs');
const path = require('path');

/**
 * Supprime un fichier du système de fichiers s'il existe.
 * @param {string} filePath - Chemin relatif ou absolu du fichier à supprimer.
 */
exports.deleteFile = (filePath) => {
    if (!filePath) return;

    // Si le chemin commence par /uploads (url relative stockée en BDD), on le rend absolu
    // On suppose que le dossier uploads est à la racine du projet backend ou dans public
    // Ajustez selon votre structure. Ici on suppose que le CWD est la racine du projet.

    let absolutePath = filePath;

    // Si c'est une URL relative (ex: /uploads/profiles/image.jpg)
    if (filePath.startsWith('/')) {
        absolutePath = path.join(process.cwd(), filePath);
    }

    fs.unlink(absolutePath, (err) => {
        if (err) {
            // On ignore l'erreur si le fichier n'existe pas (déjà supprimé ou chemin invalide)
            if (err.code !== 'ENOENT') {
                console.error(`Erreur lors de la suppression du fichier ${absolutePath}:`, err);
            }
        } else {
            // console.log(`Fichier supprimé: ${absolutePath}`);
        }
    });
};
