const Trajet = require("../../models/Trajets");

// * GET /chauffeur/revenus
exports.chauffeurRevenus = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        // Dates utiles
        const maintenant = new Date();

        // Début jour
        const debutJour = new Date();
        debutJour.setHours(0, 0, 0, 0);

        // Début semaine (lundi)
        const debutSemaine = new Date();
        const jour = debutSemaine.getDay(); // 0 = dimanche
        const diff = jour === 0 ? 6 : jour - 1;
        debutSemaine.setDate(debutSemaine.getDate() - diff);
        debutSemaine.setHours(0, 0, 0, 0);

        // Début mois
        const debutMois = new Date(
        maintenant.getFullYear(),
        maintenant.getMonth(),
        1
        );

        // Pipeline commun
        const matchBase = {
        chauffeur: userId,
        statut: "TERMINEE",
        "paiement.statut": "PAYE",
        };

        // Revenus du jour
        const revenusJourAgg = await Trajet.aggregate([
        {
            $match: {
            ...matchBase,
            dateFin: { $gte: debutJour },
            },
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            courses: { $sum: 1 },
            },
        },
        ]);

        // Revenus semaine
        const revenusSemaineAgg = await Trajet.aggregate([
        {
            $match: {
            ...matchBase,
            dateFin: { $gte: debutSemaine },
            },
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            },
        },
        ]);

        // Revenus mois
        const revenusMoisAgg = await Trajet.aggregate([
        {
            $match: {
            ...matchBase,
            dateFin: { $gte: debutMois },
            },
        },
        {
            $group: {
            _id: null,
            total: { $sum: "$prix" },
            },
        },
        ]);

        // Résultats
        const revenusJour = revenusJourAgg[0]?.total || 0;
        const coursesPayees = revenusJourAgg[0]?.courses || 0;

        const revenusSemaine = revenusSemaineAgg[0]?.total || 0;
        const revenusMois = revenusMoisAgg[0]?.total || 0;

        return res.status(200).json({
        succes: true,
        data: {
            revenusJour,
            revenusSemaine,
            revenusMois,
            coursesPayees,
        },
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};

// LISTES DES PAIEMENTS EFFECTUES

// * GET /chauffeur/revenus/liste
exports.chauffeurRevenusListe = async (req, res) => {
    try {
        const userId = req.utilisateur._id;

        const COMMISSION_TAUX = 0.1; // 10 %

        const trajets = await Trajet.find({
        chauffeur: userId,
        statut: "TERMINEE",
        "paiement.statut": "PAYE",
        })
        .sort({ dateFin: -1 })
        .select(
            "depart destination prix paiement dateFin createdAt"
        );

        const data = trajets.map((trajet) => {
        const montantBrut = trajet.prix;
        const commission = Math.round(montantBrut * COMMISSION_TAUX);
        const gainNet = montantBrut - commission;

        return {
            date: trajet.dateFin || trajet.createdAt,
            trajet: `${trajet.depart} - ${trajet.destination}`,
            modePaiement: trajet.paiement?.methode || "N/A",
            montantBrut,
            commission,
            gainNet,
        };
        });

        return res.status(200).json({
        succes: true,
        total: data.length,
        data,
        });
    } catch (error) {
        return res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
