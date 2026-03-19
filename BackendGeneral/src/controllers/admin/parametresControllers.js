const ParametresPlateforme = require("../../models/ParametresPlateforme");
const { logActivity } = require("../../utils/logger");

/**
 * Récupérer les paramètres de la plateforme
 */
exports.getParametres = async (req, res) => {
    try {
        let parametres = await ParametresPlateforme.findOne();

        if (!parametres) {
            parametres = new ParametresPlateforme();
            await parametres.save();
        }

        res.status(200).json({
            success: true,
            data: parametres
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des paramètres"
        });
    }
};

/**
 * Mettre à jour les paramètres de la plateforme
 * Émet des événements Socket.IO si :
 *   - Le mode maintenance est activé/désactivé
 *   - Un service est activé/désactivé
 */
exports.updateParametres = async (req, res) => {
    try {
        const io = req.app.get("io");

        let anciens = await ParametresPlateforme.findOne();

        // Snapshot des anciennes valeurs avant mise à jour
        const ancienMaintenance = anciens?.platform?.maintenanceMode ?? false;
        const anciensServices = anciens?.services
            ? JSON.parse(JSON.stringify(anciens.services))
            : {};
        const anciensPaymentsMethods = anciens?.payments?.methods
            ? JSON.parse(JSON.stringify(anciens.payments.methods))
            : {};

        // ── Appliquer la mise à jour ──
        if (!anciens) {
            anciens = new ParametresPlateforme(req.body);
        } else {
            anciens.set(req.body);
        }

        const parametres = await anciens.save();

        const nouveauMaintenance = parametres.platform?.maintenanceMode ?? false;
        let specificEventEmitted = false;

        // ── 1. Notification Mode Maintenance ──
        if (io && nouveauMaintenance !== ancienMaintenance) {
            specificEventEmitted = true;
            if (nouveauMaintenance) {
                const message = parametres.platform?.maintenanceMessage
                    || "La plateforme est momentanément en maintenance. Veuillez réessayer plus tard.";

                io.emit("platform:maintenance:on", {
                    message,
                    activatedAt: new Date().toISOString(),
                });
            } else {
                io.emit("platform:maintenance:off", {
                    message: "La plateforme est de nouveau disponible ! 🎉",
                    resumedAt: new Date().toISOString(),
                });
            }
        }

        // ── 2. Notifications Services (Désactivation, Activation, Tarification) ──
        if (io && parametres.services) {
            const NOMS = {
                motoTaxi: "Moto-taxi",
                sharedTaxi: "Taxi partagé",
                privateCar: "Voiture privée",
                delivery: "Livraison",
            };

            const servicesObj = parametres.services.toObject
                ? parametres.services.toObject()
                : parametres.services;

            for (const [key, svc] of Object.entries(servicesObj)) {
                const ancienSvc = anciensServices[key] || {};
                const nouveauSvc = svc;
                const nomService = NOMS[key] || key;

                if (ancienSvc.enabled !== nouveauSvc.enabled) {
                    specificEventEmitted = true;
                    if (!nouveauSvc.enabled) {
                        io.emit("platform:service:desactive", {
                            serviceId: key,
                            nom: nomService,
                            message: `⚠️ Le service "${nomService}" n'est plus disponible pour le moment.`,
                            disabledAt: new Date().toISOString(),
                        });
                    } else {
                        io.emit("platform:service:active", {
                            serviceId: key,
                            nom: nomService,
                            message: `✅ Le service "${nomService}" est de nouveau disponible !`,
                            enabledAt: new Date().toISOString(),
                        });
                    }
                } else if (nouveauSvc.enabled) {
                    if (ancienSvc.basePrice !== nouveauSvc.basePrice || ancienSvc.perKm !== nouveauSvc.perKm) {
                        specificEventEmitted = true;
                        io.emit("platform:service:tarifs_mis_a_jour", {
                            serviceId: key,
                            nom: nomService,
                            message: `📢 Les tarifs du service "${nomService}" ont été mis à jour.`,
                            updatedAt: new Date().toISOString(),
                        });
                    }
                }
            }
        }

        // ── 4. Notifications Méthodes de Paiement ──
        if (io && parametres.payments?.methods) {
            const NOMS_PAIEMENT = {
                cash: "Espèces",
                orangeMoney: "Orange Money",
                mtnMoney: "MTN Mobile Money",
                stripe: "Carte Bancaire (Stripe)",
            };

            const methodsObj = parametres.payments.methods.toObject
                ? parametres.payments.methods.toObject()
                : parametres.payments.methods;

            for (const [key, method] of Object.entries(methodsObj)) {
                const ancienMethod = anciensPaymentsMethods[key] || {};
                const nouveauMethod = method;

                if (ancienMethod.enabled !== nouveauMethod.enabled) {
                    specificEventEmitted = true;
                    const nomPaiement = NOMS_PAIEMENT[key] || key;
                    if (!nouveauMethod.enabled) {
                        io.emit("platform:payment:desactive", {
                            methodId: key,
                            nom: nomPaiement,
                            message: `⚠️ Le mode de paiement "${nomPaiement}" n'est plus disponible temporairement.`,
                        });
                    } else {
                        io.emit("platform:payment:active", {
                            methodId: key,
                            nom: nomPaiement,
                            message: `✅ Le mode de paiement "${nomPaiement}" est de nouveau disponible !`,
                        });
                    }
                }
            }
        }

        // ── 3. Notification Générale (Toujours émise pour la synchronisation des données) ──
        if (io) {
            io.emit("platform:settings:updated", {
                updatedAt: new Date().toISOString(),
                message: "Les paramètres de la plateforme ont été mis à jour."
            });
        }

        // LOG DE L'ACTIVITÉ
        await logActivity({
            utilisateurId: req.utilisateur._id,
            nomUtilisateur: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
            role: req.utilisateur.role,
            action: "MISE_A_JOUR_PARAMETRES",
            module: "SYSTEME",
            details: {
                nouveauxParametres: req.body
            },
            ip: req.ip || req.connection.remoteAddress,
            navigateur: req.headers["user-agent"] || "Unknown"
        });

        res.status(200).json({
            success: true,
            message: "Paramètres mis à jour avec succès",
            data: parametres
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour des paramètres:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour des paramètres"
        });
    }
};
