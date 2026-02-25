const mongoose = require("mongoose");
// CONNEXION À LA BASE DE DONNÉES


const connecterBaseDeDonnees = async () => {
    console.log("Tentative de Connexion");
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ Connexion à MongoDB réussie");
    } catch (erreur) {
        console.error("❌ Erreur de connexion à MongoDB :", erreur.message);
        process.exit(1);
    }
};

module.exports = connecterBaseDeDonnees;
