const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const Utilisateur = require('../src/models/Utilisateurs');

async function fixBalance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connecté à MongoDB");

        // On cherche l'utilisateur par son téléphone
        const phone = "621334455";
        const user = await Utilisateur.findOne({ telephone: phone });

        if (!user) {
            console.log("❌ Utilisateur introuvable");
            return;
        }

        console.log(`👤 Utilisateur : ${user.prenom} ${user.nom}`);
        console.log(`💰 Solde actuel erroné : ${user.solde}`);

        // Correction : On force le solde à la valeur réelle (1 105 000 GNF)
        // Note: D'après la capture, 1100000 + 5000 a donné 11000005000
        user.solde = 1105000;
        
        await user.save();
        console.log(`✅ Nouveau solde corrigé : ${user.solde} GNF`);

    } catch (error) {
        console.error("❌ Erreur :", error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

fixBalance();
