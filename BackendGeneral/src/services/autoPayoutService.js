const mongoose = require("mongoose");
const Paiement = require("../models/Paiements");
const ChauffeurProfile = require("../models/ChauffeurProfile");
const Notification = require("../models/Notifications");
const Utilisateur = require("../models/Utilisateurs");
const Transaction = require("../models/Transaction");

/**
 * 🤖 Service Automatisé de Déversement (Auto-Payout)
 */

const autoPayoutService = (io) => {
    setInterval(async () => {
        try {
            const cinqMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const paiementsAVerser = await Paiement.find({
                statut: "PAYE",
                verse: false,
                createdAt: { $lte: cinqMinutesAgo }
            }).populate("chauffeur");

            if (paiementsAVerser.length > 0) {
                console.log(`🤖 [AUTO-PAYOUT] ${paiementsAVerser.length} paiement(s) à déverser.`);

                for (const paiement of paiementsAVerser) {
                    // 1. Passage du statut au vert (Versé)
                    paiement.verse = true;
                    paiement.verseLe = new Date();
                    paiement.commentaireVersement = "🤖 Versement automatique - Délai de 5 min expiré.";
                    await paiement.save();

                    // 2. 🎯 MISE À JOUR DU PROFIL CHAUFFEUR (Stats globales)
                    // On incrémente le revenu total net et le nombre de trajets
                    const netChauffeur = paiement.montantChauffeur || 0;
                    await ChauffeurProfile.findOneAndUpdate(
                        { utilisateur: paiement.chauffeur._id },
                        {
                            $inc: {
                                totalRevenus: netChauffeur,
                                nombreTrajets: 1
                            }
                        }
                    );

                    // 2.5 💰 CRÉDITER LE SOLDE WALLET DU CHAUFFEUR
                    // C'est ici que l'argent devient réellement disponible pour le retrait
                    await Utilisateur.findByIdAndUpdate(paiement.chauffeur._id, {
                        $inc: { solde: netChauffeur }
                    });

                    // 2.6 📝 CRÉER UNE TRANSACTION POUR L'HISTORIQUE
                    await Transaction.create({
                        utilisateur: paiement.chauffeur._id,
                        type: "VERSEMENT",
                        montant: netChauffeur,
                        methode: paiement.methode || "WALLET",
                        reference: `AUTO-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        statut: "COMPLETE",
                        commentaire: `Versement automatique (Auto-Payout) - Paiement #${paiement._id}`,
                        metadata: { paiementId: paiement._id, reservationId: paiement.reservation }
                    });

                    // 3. 🔔 Notification persistante pour le chauffeur
                    const montantFormate = netChauffeur.toLocaleString('fr-FR');
                    try {
                        await Notification.create({
                            utilisateur: paiement.chauffeur._id,
                            message: `💰 Auto-Payout : Paiement de ${montantFormate} GNF versé sur votre compte ! (Délai de 5 minutes expiré)`,
                        });
                    } catch (notifErr) {
                        console.error("❌ [AUTO-PAYOUT] Erreur notification chauffeur:", notifErr.message);
                    }

                    // 4. 📢 NOTIFICATION ADMIN (Temps réel et Persistante)
                    const admin = await Utilisateur.findOne({ role: "ADMIN" });

                    if (admin) {
                        try {
                            await Notification.create({
                                utilisateur: admin._id,
                                message: `🤖 [AUTO-PAYOUT] Versement automatique effectué pour le chauffeur ${paiement.chauffeur.prenom} ${paiement.chauffeur.nom} (${montantFormate} GNF).`,
                            });
                        } catch (notifErr) {
                            console.error("❌ [AUTO-PAYOUT] Erreur notification admin:", notifErr.message);
                        }
                    }

                    // 5. 📡 Émissions Socket.io temps réel
                    if (io) {
                        // Notifier le chauffeur
                        const driverRoom = `CHAUFFEUR_${String(paiement.chauffeur._id)}`;
                        io.to(driverRoom).emit("paiement:verse", {
                            paiementId: paiement._id,
                            montant: paiement.montantChauffeur,
                            methode: paiement.methode,
                            verseLe: paiement.verseLe,
                            message: `Paiement de ${montantFormate} GNF versé automatiquement avec succès.`
                        });

                        // Notifier tous les Admins connectés
                        io.to("ADMINS").emit("admin:payout_auto", {
                            paiementId: paiement._id,
                            chauffeurNom: `${paiement.chauffeur.prenom} ${paiement.chauffeur.nom}`,
                            montant: netChauffeur,
                            message: `🤖 Le robot a versé ${montantFormate} GNF au chauffeur ${paiement.chauffeur.nom}.`
                        });
                        console.log(`📡 [AUTO-PAYOUT] Notifications émises vers les Rooms.`);
                    }

                    console.log(`✅ [AUTO-PAYOUT] Paiement ${paiement._id} versé avec succès.`);
                }
            }
        } catch (error) {
            console.error("❌ [AUTO-PAYOUT] Erreur lors du scan automatique:", error);
        }
    }, 60000);

    console.log("🚀 [AUTO-PAYOUT] Service activé avec double notification (Chauffeur + Admin).");
};

module.exports = autoPayoutService;
