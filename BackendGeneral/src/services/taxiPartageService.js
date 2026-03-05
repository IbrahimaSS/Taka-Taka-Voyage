const Reservation = require("../models/Reservations");
const GroupeTaxiPartage = require("../models/GroupeTaxiPartage");
const ChauffeurProfile = require("../models/ChauffeurProfile");
const Utilisateurs = require("../models/Utilisateurs");
const Notification = require("../models/Notifications");
const Trajet = require("../models/Trajets");
const Paiement = require("../models/Paiements");

class TaxiPartageService {
    // Créer ou ajouter une réservation à un groupe de taxi partagé
    static async creerOuAjouterGroupe(reservation, chauffeurId) {
        try {
            // Vérifier que la réservation est bien de type TAXI_PARTAGE
            if (reservation.typeVehicule !== "TAXI_PARTAGE") {
                throw new Error("Cette réservation n'est pas un taxi partagé");
            }

            // Vérifier que la réservation n'est pas déjà dans un groupe
            if (reservation.groupeTaxiPartage) {
                // La réservation est déjà dans un groupe, vérifier si c'est le même chauffeur
                const groupeExistant = await GroupeTaxiPartage.findById(reservation.groupeTaxiPartage);
                if (groupeExistant && groupeExistant.chauffeur.toString() === chauffeurId.toString()) {
                    return {
                        succes: true,
                        groupe: groupeExistant,
                        message: "Réservation déjà dans le groupe de ce chauffeur"
                    };
                } else {
                    throw new Error("Cette réservation est déjà dans un groupe d'un autre chauffeur");
                }
            }

            // Vérifier et récupérer la capacité du chauffeur
            const chauffeurProfile = await ChauffeurProfile.findOne({
                utilisateur: chauffeurId
            });

            if (!chauffeurProfile) {
                throw new Error("Profil chauffeur introuvable");
            }

            if (chauffeurProfile.capaciteVehicule < 2) {
                throw new Error("Capacité véhicule insuffisante pour taxi partagé (minimum 2 passagers)");
            }

            // Chercher un groupe existant et actif pour ce chauffeur
            let groupe = await GroupeTaxiPartage.findOne({
                chauffeur: chauffeurId,
                statut: { $in: ["EN_FORMATION", "RAMASSAGE_EN_COURS"] }
            }).populate('reservations.reservation');

            if (!groupe) {
                // Créer un nouveau groupe
                groupe = new GroupeTaxiPartage({
                    chauffeur: chauffeurId,
                    typeVehicule: "TAXI_PARTAGE",
                    capaciteMax: chauffeurProfile.capaciteVehicule,
                    statut: "EN_FORMATION",
                    reservations: [{
                        reservation: reservation._id,
                        ordre: 1,
                        statut: "EN_ATTENTE"
                    }],
                    creePar: chauffeurId
                });

                console.log(`🚕 Création nouveau groupe taxi partagé pour chauffeur ${chauffeurId}`);
            } else {
                // Ajouter au groupe existant si capacité disponible
                if (groupe.reservations.length >= groupe.capaciteMax) {
                    throw new Error(`Capacité maximale atteinte (${groupe.capaciteMax} passagers)`);
                }

                // Vérifier que la réservation n'est pas déjà dans le groupe
                if (groupe.reservations.some(r => r.reservation._id.toString() === reservation._id.toString())) {
                    throw new Error("Cette réservation est déjà dans le groupe");
                }

                const nouvelOrdre = Math.max(...groupe.reservations.map(r => r.ordre), 0) + 1;

                groupe.reservations.push({
                    reservation: reservation._id,
                    ordre: nouvelOrdre,
                    statut: "EN_ATTENTE"
                });

                // Si on a atteint le nombre minimum de passagers, passer en ramassage
                if (groupe.reservations.length >= 2 && groupe.statut === "EN_FORMATION") {
                    groupe.statut = "RAMASSAGE_EN_COURS";
                }

                console.log(`👤 Ajout passager au groupe existant - Ordre: ${nouvelOrdre}/${groupe.capaciteMax}`);
            }

            await groupe.save();

            // Mettre à jour la réservation pour la lier au groupe
            reservation.groupeTaxiPartage = groupe._id;
            reservation.estTaxiPartage = true;
            reservation.statutRecuperation = "EN_ATTENTE_RAMASSAGE";
            reservation.ordreRamassage = groupe.reservations.length;
            await reservation.save();

            // Notifier les autres passagers du groupe (si existants)
            if (groupe.reservations.length > 1) {
                await this.notifierPassagersGroupe(groupe._id, {
                    type: "nouveau_passager",
                    message: "Un nouveau passager a rejoint votre taxi partagé",
                    groupe: groupe
                });
            }

            return {
                succes: true,
                groupe: await GroupeTaxiPartage.findById(groupe._id).populate('reservations.reservation'),
                message: groupe.reservations.length === 1 ?
                    "Groupe de taxi partagé créé" :
                    "Passager ajouté au groupe existant"
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.creerOuAjouterGroupe:", error.message);
            throw error;
        }
    }

    // Valider si un trajet de taxi partagé peut démarrer (BACKEND OBLIGATOIRE)
    static async validerDemarrageTrajet(groupeId) {
        try {
            const groupe = await GroupeTaxiPartage.findById(groupeId)
                .populate('reservations.reservation');

            if (!groupe) {
                throw new Error("Groupe introuvable");
            }

            // Récupérer les réservations réelles pour vérifier les statuts de récupération
            const reservations = await Reservation.find({ groupeTaxiPartage: groupeId });

            // Vérification BACKEND : Qui est vraiment à bord ?
            const passagersRamasses = reservations.filter(
                r => r.statutRecuperation === "RAMASSE"
            );

            const passagersEnAttente = reservations.filter(
                r => r.statutRecuperation !== "RAMASSE"
            );

            // Règle 5 : Tous les passagers acceptés doivent être marqués comme RECUPERE ("RAMASSE")
            const tousRamasses = passagersEnAttente.length === 0 && reservations.length > 0;

            // Mise à jour de l'état du groupe en base
            groupe.peutDemarrer = tousRamasses;
            if (tousRamasses && groupe.statut === "EN_FORMATION") {
                groupe.statut = "RAMASSAGE_EN_COURS"; // Sécurité
            }
            await groupe.save();

            return {
                peutDemarrer: tousRamasses,
                passagersRamasses: passagersRamasses.length,
                passagersEnAttente: passagersEnAttente.length,
                message: tousRamasses ?
                    "✅ Tout le monde est à bord - Trajet prêt" :
                    `⏳ ${passagersEnAttente.length} passager(s) encore en attente`,
                groupe
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.validerDemarrageTrajet:", error.message);
            throw error;
        }
    }

    // Signaler l'arrivée d'un passager (chauffeur arrive pour le récupérer)
    static async signalerArriveePassager(reservationId, chauffeurId) {
        try {
            const reservation = await Reservation.findById(reservationId)
                .populate('groupeTaxiPartage');

            if (!reservation) {
                throw new Error("Réservation introuvable");
            }

            if (!reservation.groupeTaxiPartage) {
                throw new Error("Cette réservation n'est pas dans un groupe de taxi partagé");
            }

            // Vérifier que le chauffeur est bien celui du groupe
            const groupe = await GroupeTaxiPartage.findById(reservation.groupeTaxiPartage._id);
            if (groupe.chauffeur.toString() !== chauffeurId.toString()) {
                throw new Error("Ce chauffeur n'est pas responsable de ce groupe");
            }

            // Mettre à jour le statut de la réservation
            reservation.statutRecuperation = "RAMASSE";
            await reservation.save();

            // Mettre à jour le statut dans le groupe
            await groupe.mettreAJourStatutReservation(reservationId, "RAMASSE");

            // Notifier le passager
            await Notification.create({
                utilisateur: reservation.passager,
                message: "Vous avez été pris en charge par le chauffeur 🚗",
                type: "INFO"
            });

            // Vérifier si tout le monde est ramassé
            const validation = await this.validerDemarrageTrajet(groupe._id);

            // Notifier tout le monde du groupe
            await this.notifierPassagersGroupe(groupe._id, {
                type: "passager_ramasse",
                message: "Un passager a été ramassé",
                reservationId: reservationId,
                passagersRestants: validation.passagersEnAttente,
                peutDemarrer: validation.peutDemarrer
            });

            console.log(`📍 Passager ramassé dans groupe ${groupe._id} - Restants: ${validation.passagersEnAttente}`);

            return {
                succes: true,
                groupeId: groupe._id,
                passagersRamasses: validation.passagersRamasses,
                passagersEnAttente: validation.passagersEnAttente,
                peutDemarrer: validation.peutDemarrer,
                message: "Passager ramassé avec succès"
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.signalerArriveePassager:", error.message);
            throw error;
        }
    }

    // Démarrer le trajet pour tout le groupe
    static async demarrerTrajetGroupe(groupeId, chauffeurId) {
        try {
            // Validation BACKEND OBLIGATOIRE
            const validation = await this.validerDemarrageTrajet(groupeId);

            if (!validation.peutDemarrer) {
                throw new Error(`Impossible de démarrer: ${validation.message}`);
            }

            // Démarrer le trajet pour tout le groupe
            const groupe = await GroupeTaxiPartage.findById(groupeId);
            await groupe.demarrerTrajet();

            // Mettre à jour toutes les réservations du groupe
            await Reservation.updateMany(
                { groupeTaxiPartage: groupeId },
                {
                    statut: "EN_COURS",
                    dateDebut: new Date()
                }
            );

            // Notifier tous les passagers du groupe
            await this.notifierPassagersGroupe(groupeId, {
                type: "trajet_demarre",
                message: "Le trajet commence ! Suivez le véhicule en temps réel 🚀",
                groupeId: groupeId
            });

            console.log(`🚀 Trajet de taxi partagé démarré - Groupe ${groupeId}`);

            return {
                succes: true,
                groupeId: groupeId,
                message: "Trajet de taxi partagé démarré avec succès",
                groupe: await GroupeTaxiPartage.findById(groupeId).populate('reservations.reservation')
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.demarrerTrajetGroupe:", error.message);
            throw error;
        }
    }

    // Passer un passager en "en cours de ramassage"
    static async passerEnCoursDeRamassage(reservationId, chauffeurId) {
        try {
            const reservation = await Reservation.findById(reservationId)
                .populate('groupeTaxiPartage');

            if (!reservation || !reservation.groupeTaxiPartage) {
                throw new Error("Réservation ou groupe introuvable");
            }

            // Mettre à jour le statut
            reservation.statutRecuperation = "EN_COURS_DE_RAMASSAGE";
            await reservation.save();

            // Mettre à jour dans le groupe
            const groupe = await GroupeTaxiPartage.findById(reservation.groupeTaxiPartage._id);
            await groupe.mettreAJourStatutReservation(reservationId, "EN_COURS_DE_RAMASSAGE");

            // Notifier le passager
            await Notification.create({
                utilisateur: reservation.passager,
                message: "Le chauffeur est en route pour vous récupérer 📍",
                type: "INFO"
            });

            console.log(`🚗 Passager en cours de ramassage: ${reservationId}`);

            return {
                succes: true,
                message: "Chauffeur en route vers le passager"
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.passerEnCoursDeRamassage:", error.message);
            throw error;
        }
    }

    // Obtenir la file d'attente de ramassage pour un chauffeur
    static async getFileRamassage(chauffeurId) {
        try {
            const groupe = await GroupeTaxiPartage.findOne({
                chauffeur: chauffeurId,
                statut: { $in: ["EN_FORMATION", "RAMASSAGE_EN_COURS"] }
            }).populate({
                path: 'reservations.reservation',
                populate: {
                    path: 'passager',
                    select: 'nom prenom telephone photoUrl'
                }
            });

            if (!groupe) {
                return {
                    succes: true,
                    groupe: null,
                    fileRamassage: [],
                    message: "Aucun groupe de taxi partagé en cours"
                };
            }

            // Trier par ordre de ramassage
            const fileRamassage = groupe.reservations
                .sort((a, b) => a.ordre - b.ordre)
                .map(r => ({
                    ...r.toObject(),
                    reservation: {
                        ...r.reservation.toObject(),
                        // Ajouter les infos utiles pour le frontend
                        statutRecuperation: r.reservation.statutRecuperation
                    }
                }));

            return {
                succes: true,
                groupe: groupe,
                fileRamassage: fileRamassage,
                peutDemarrer: groupe.peutDemarrer,
                capaciteMax: groupe.capaciteMax,
                passagersActuels: groupe.reservations.length
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.getFileRamassage:", error.message);
            throw error;
        }
    }

    // Notifier tous les passagers d'un groupe
    static async notifierPassagersGroupe(groupeId, data) {
        try {
            const groupe = await GroupeTaxiPartage.findById(groupeId)
                .populate('reservations.reservation');

            if (!groupe) return;

            // Créer des notifications pour chaque passager
            const notifications = groupe.reservations.map(r => ({
                utilisateur: r.reservation.passager,
                message: data.message,
                type: "TAXI_PARTAGE",
                donneesSupplementaires: {
                    groupeId: groupeId,
                    typeNotification: data.type,
                    ...data
                }
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            console.log(`📢 Notification envoyée au groupe ${groupeId}: ${data.type}`);

        } catch (error) {
            console.error("❌ TaxiPartageService.notifierPassagersGroupe:", error.message);
        }
    }

    // Terminer un trajet de taxi partagé
    static async terminerTrajetGroupe(groupeId, chauffeurId) {
        try {
            const groupe = await GroupeTaxiPartage.findById(groupeId)
                .populate('reservations.reservation');

            if (!groupe) {
                throw new Error("Groupe introuvable");
            }

            if (groupe.chauffeur.toString() !== chauffeurId.toString()) {
                throw new Error("Ce chauffeur n'est pas responsable de ce groupe");
            }

            const dateFin = new Date();

            // 1. Terminer le groupe en DB
            await groupe.terminerTrajet();

            // 2. Traiter chaque réservation du groupe
            const reservations = groupe.reservations.map(r => r.reservation);

            for (const res of reservations) {
                // Mettre à jour la réservation
                res.statut = "TERMINEE";
                res.dateFin = dateFin;
                await res.save();

                // Persister dans le modèle Trajet
                try {
                    await Trajet.findOneAndUpdate(
                        { reservation: res._id },
                        {
                            statut: "TERMINEE",
                            dateFin: dateFin,
                            // Sécurité: assurer que les autres champs sont là si le trajet n'existait pas
                            passager: res.passager,
                            chauffeur: chauffeurId,
                            depart: res.depart,
                            destination: res.destination,
                            distanceKm: res.distanceKm,
                            dureeMin: res.dureeMin,
                            prix: res.prix
                        },
                        { upsert: true, new: true }
                    );
                } catch (tErr) {
                    console.error(`❌ TaxiPartageService: erreur trajet RID=${res._id}:`, tErr.message);
                }

                // Créer le record Paiement si nécessaire
                try {
                    const commissionRate = 0.20;
                    const commissionPlateforme = Math.round(res.prix * commissionRate);
                    const montantChauffeur = res.prix - commissionPlateforme;

                    await Paiement.findOneAndUpdate(
                        { reservation: res._id },
                        {
                            passager: res.passager,
                            chauffeur: chauffeurId,
                            statut: res.paiement?.statut === "PAYE" ? "PAYE" : "EN_ATTENTE",
                            montantTotal: res.prix,
                            commissionPlateforme,
                            montantChauffeur,
                            methode: res.paiement?.methode || "CASH",
                            verse: false
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                } catch (pErr) {
                    console.error(`❌ TaxiPartageService: erreur paiement RID=${res._id}:`, pErr.message);
                }
            }

            // 3. Libérer le chauffeur
            await Utilisateurs.findByIdAndUpdate(chauffeurId, { trajetEnCours: false });

            // 4. Notifier tous les passagers
            await this.notifierPassagersGroupe(groupeId, {
                type: "trajet_termine",
                message: "Trajet terminé pour tout le groupe. Merci d'avoir utilisé Taka-Taka Voyage ! 🎉",
                groupeId: groupeId
            });

            console.log(`🏁 Trajet de taxi partagé terminé GLOBALEMENT - Groupe ${groupeId} (${reservations.length} passagers)`);

            return {
                succes: true,
                message: "Trajet de taxi partagé terminé avec succès pour tout le groupe",
                reservationIds: reservations.map(r => r._id)
            };

        } catch (error) {
            console.error("❌ TaxiPartageService.terminerTrajetGroupe:", error.message);
            throw error;
        }
    }
}

module.exports = TaxiPartageService;
