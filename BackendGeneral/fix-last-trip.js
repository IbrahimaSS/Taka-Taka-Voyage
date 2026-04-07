require('dotenv').config();

const Utilisateur = require('./src/models/Utilisateurs');
const Paiement = require('./src/models/Paiements');
const Transaction = require('./src/models/Transaction');
const ChauffeurProfile = require('./src/models/ChauffeurProfile');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log("Connected to MongoDB");
    const driver = await Utilisateur.findOne({ telephone: '621006456' });
    if (!driver) {
        console.log("Driver not found with phone 621006456");
        process.exit(0);
    }
    console.log(`Driver found: ${driver.prenom} ${driver.nom} (ID: ${driver._id})`);
    console.log(`Current Solde: ${driver.solde} GNF`);

    const lastPayment = await Paiement.findOne({ chauffeur: driver._id })
        .sort({ createdAt: -1 });

    if (!lastPayment) {
        console.log("No payment found for this driver");
        process.exit(0);
    }
    console.log(`Last Payment ID: ${lastPayment._id}`);
    console.log(`Statut: ${lastPayment.statut}`);
    console.log(`Verse: ${lastPayment.verse}`);
    console.log(`Montant Net: ${lastPayment.montantChauffeur} FG`);

    if (lastPayment.verse) {
        // Find if a transaction exists for this payment
        const existingTrans = await Transaction.findOne({ "metadata.paiementId": lastPayment._id });
        if (existingTrans) {
            console.log(`Transaction already exists: ${existingTrans._id}`);
        } else {
            console.log("NO TRANSACTION FOUND for this marked 'Versé' payment. Fixing...");
            
            const netAmount = lastPayment.montantChauffeur || 0;
            
            // 1. Credit Solde
            driver.solde = (driver.solde || 0) + netAmount;
            await driver.save();
            console.log(`New Solde: ${driver.solde} GNF`);

            // 2. Create Transaction
            const newTrans = await Transaction.create({
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
            console.log(`Transaction created: ${newTrans._id}`);

            // 3. Update stats if they were missing a count
            await ChauffeurProfile.findOneAndUpdate(
                { utilisateur: driver._id },
                { $inc: { totalRevenus: netAmount, nombreTrajets: 1 } },
                { upsert: true }
            );
            console.log("Stats profile updated.");
        }
    } else {
        console.log("Last payment is NOT marked as 'Versé'. Robot will pick it up or admin must manually pay.");
    }
    
    process.exit(0);
})
.catch(err => {
    console.error("Connection Error:", err);
    process.exit(1);
});
