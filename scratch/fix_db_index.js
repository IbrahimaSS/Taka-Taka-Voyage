require('dotenv').config({ path: '../BackendGeneral/.env' });
const mongoose = require('mongoose');

async function fixIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Transaction = require('../BackendGeneral/src/models/Transaction');
        
        console.log("Connecté à MongoDB.");
        console.log("Suppression de l'index 'reference_1' s'il existe...");
        
        try {
            await Transaction.collection.dropIndex('reference_1');
            console.log("✅ Ancien index supprimé avec succès.");
        } catch(e) {
            console.log("L'index n'existait peut-être pas ou autre erreur:", e.message);
        }
        
        console.log("Re-création automatique des index par Mongoose...");
        await Transaction.syncIndexes();
        
        console.log("✅ Nouveaux index (avec sparse: true) synchronisés !");
    } catch(err) {
        console.error("❌ Erreur:", err);
    } finally {
        mongoose.disconnect();
    }
}
fixIndex();
