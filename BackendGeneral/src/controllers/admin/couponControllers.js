const Coupon = require("../../models/Coupon");
const { logActivity } = require("../../utils/logger");

/**
 * Créer un nouveau coupon (Admin uniquement)
 */
exports.creerCoupon = async (req, res) => {
    try {
        const { code, typeReduction, valeur, dateExpiration, limiteUtilisationsGlobales, limiteParUtilisateur, conditions } = req.body;

        // Vérifier si le code existe déjà
        const existant = await Coupon.findOne({ code: code.toUpperCase() });
        if (existant) {
            return res.status(400).json({ succes: false, message: "Ce code promo existe déjà." });
        }

        // Validation basique
        if (typeReduction === "POURCENTAGE" && valeur > 100) {
            return res.status(400).json({ succes: false, message: "Un pourcentage de réduction ne peut pas dépasser 100%." });
        }

        const nouveauCoupon = await Coupon.create({
            code: code.toUpperCase(),
            typeReduction,
            valeur,
            dateExpiration,
            limiteUtilisationsGlobales: limiteUtilisationsGlobales || null,
            limiteParUtilisateur: limiteParUtilisateur || 1,
            conditions: conditions || {},
            creePar: req.utilisateur.id
        });

        // Log Admin
        await logActivity({
            utilisateurId: req.utilisateur.id,
            nomUtilisateur: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
            role: req.utilisateur.role,
            action: "CREATION_COUPON",
            module: "SYSTEME",
            details: { code: nouveauCoupon.code, type: typeReduction, valeur }
        });

        // 🚀 NOTIFICATION TEMPS RÉEL (SOCKET) AUX PASSAGERS
        // On n'envoie la notif que si le coupon est actif pour tout le monde ou les courses standards
        if (global.io) {
            global.io.to("PASSAGERS").emit("promo:new", {
                code: nouveauCoupon.code,
                typeReduction: nouveauCoupon.typeReduction,
                valeur: nouveauCoupon.valeur,
                dateExpiration: nouveauCoupon.dateExpiration
            });
        }

        res.status(201).json({
            succes: true,
            message: "Coupon créé avec succès.",
            coupon: nouveauCoupon
        });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};

/**
 * Récupérer tous les coupons (Admin uniquement)
 */
exports.listerCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        
        // Mettre à jour au vol le statut si expiré
        const now = new Date();
        coupons.forEach(async (c) => {
            if (c.dateExpiration < now && c.statut === "ACTIF") {
                c.statut = "EXPIRE";
                await c.save();
            }
        });

        res.status(200).json({
            succes: true,
            coupons
        });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};

/**
 * Changer le statut d'un coupon / Désactiver (Admin uniquement)
 */
exports.changerStatutCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body; // ACTIF ou INACTIF

        if (!["ACTIF", "INACTIF"].includes(statut)) {
            return res.status(400).json({ succes: false, message: "Statut invalide." });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ succes: false, message: "Coupon introuvable." });
        }

        coupon.statut = statut;
        await coupon.save();

        // Log Admin
        await logActivity({
            utilisateurId: req.utilisateur.id,
            nomUtilisateur: `${req.utilisateur.prenom} ${req.utilisateur.nom}`,
            role: req.utilisateur.role,
            action: statut === "ACTIF" ? "ACTIVATION_COUPON" : "DESACTIVATION_COUPON",
            module: "SYSTEME",
            details: { code: coupon.code }
        });

        res.status(200).json({
            succes: true,
            message: `Coupon marqué comme ${statut}.`,
            coupon
        });
    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};

/**
 * Valider un coupon (Pour le Passager au moment de la réservation)
 */
exports.validerCoupon = async (req, res) => {
    try {
        const { code, montantActuel, typeCourse } = req.body;
        const passagerId = req.utilisateur.id;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return res.status(404).json({ succes: false, message: "Code promo invalide." });
        if (coupon.statut === "INACTIF") return res.status(400).json({ succes: false, message: "Ce code promo a été désactivé." });
        if (coupon.statut === "EXPIRE" || coupon.dateExpiration < new Date()) {
            return res.status(400).json({ succes: false, message: "Ce code promo a expiré." });
        }

        // Vérification des limites globales
        if (coupon.limiteUtilisationsGlobales && coupon.utilisationsActuelles >= coupon.limiteUtilisationsGlobales) {
            return res.status(400).json({ succes: false, message: "Ce code promo n'est plus disponible (limite atteinte)." });
        }

        // Vérification des conditions : Montant min
        if (coupon.conditions.montantMinimumCourse > 0 && montantActuel < coupon.conditions.montantMinimumCourse) {
            return res.status(400).json({ succes: false, message: `Ce code nécessite un trajet d'au moins ${coupon.conditions.montantMinimumCourse} GNF.` });
        }

        // Vérification des conditions : Type de course
        if (coupon.conditions.typeCourseRestreint !== "TOUS" && typeCourse && typeCourse !== coupon.conditions.typeCourseRestreint) {
            return res.status(400).json({ succes: false, message: `Ce code n'est pas applicable pour ce type de course.` });
        }

        // Vérification des limites par utilisateur
        const utilisationsParPassager = coupon.utilisateursHistorique.filter(u => u.utilisateurId.toString() === passagerId).length;
        if (utilisationsParPassager >= coupon.limiteParUtilisateur) {
            return res.status(400).json({ succes: false, message: "Vous avez déjà atteint la limite d'utilisation pour ce code promo." });
        }

        // Calcul du nouveau prix
        let montantReduction = 0;
        if (coupon.typeReduction === "POURCENTAGE") {
            montantReduction = (montantActuel * coupon.valeur) / 100;
        } else if (coupon.typeReduction === "MONTANT_FIXE") {
            montantReduction = coupon.valeur;
        }

        let nouveauPrix = montantActuel - montantReduction;
        if (nouveauPrix < 0) nouveauPrix = 0; // Empêcher un prix négatif

        res.status(200).json({
            succes: true,
            valide: true,
            couponInfo: {
                code: coupon.code,
                type: coupon.typeReduction,
                valeur: coupon.valeur
            },
            prixOriginal: montantActuel,
            montantReduction: montantReduction,
            nouveauPrix: nouveauPrix
        });

    } catch (erreur) {
        res.status(500).json({ succes: false, message: erreur.message });
    }
};
