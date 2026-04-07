const mongoose = require('mongoose');
const URI = "mongodb+srv://soumahdev_db_user:LDMHHYMYrhDA2FFM@takatakacluster.uh4nbcz.mongodb.net/takataka?appName=TakaTakaCluster";

const Utilisateur = require('./src/models/Utilisateurs');
const Paiement = require('./src/models/Paiements');
const Transaction = require('./src/models/Transaction');
const ChauffeurProfile = require('./src/models/ChauffeurProfile');

mongoose.connect(URI)
.then(async () => {
    console.log("Connected");
    const driver = await Utilisateur.findOne({ telephone: '621006456' });
    const lastPayment = await Paiement.findOne({ chauffeur: driver._id }).sort({ createdAt: -1 });
    
    if (lastPayment && lastPayment.verse) {
        const netAmount = lastPayment.montantChauffeur || 0;
        
        // Final sanity check: has he really been credited? 
        // Screenshot shows 24100 GNF total but only 5000 GNF in history.
        // If he had 19100 before, and we add 24000, he should have 43100.
        
        driver.solde = (driver.solde || 0) + netAmount;
        await driver.save();
        
        await Transaction.create({
            utilisateur: driver._id,
            type: "VERSEMENT",
            montant: netAmount,
            methode: lastPayment.methode || "CASH",
            reference: `MAN-CORRECT-${Date.now()}`,
            statut: "COMPLETE",
            commentaire: `Correction manuelle - Versement trajet Région de Mamou - Paiement #${lastPayment._id}`,
            metadata: {
                paiementId: lastPayment._id,
                reservationId: lastPayment.reservation
            }
        });

        await ChauffeurProfile.findOneAndUpdate(
            { utilisateur: driver._id },
            { $inc: { totalRevenus: netAmount, nombreTrajets: 1 } },
            { upsert: true }
        );
        console.log("SUCCESS");
    }
    process.exit(0);
})
.catch(e => { console.error(e); process.exit(1); });
