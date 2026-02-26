const Paiement = require("../../models/Paiements");

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

        // Pipeline commun - On utilise le modèle Paiement maintenant
        const matchBase = {
            chauffeur: userId,
            statut: "PAYE",
        };

        // Revenus du jour
        const revenusJourAgg = await Paiement.aggregate([
            {
                $match: {
                    ...matchBase,
                    createdAt: { $gte: debutJour },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$montantTotal" },
                    courses: { $sum: 1 },
                },
            },
        ]);

        // Revenus semaine
        const revenusSemaineAgg = await Paiement.aggregate([
            {
                $match: {
                    ...matchBase,
                    createdAt: { $gte: debutSemaine },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$montantTotal" },
                },
            },
        ]);

        // Revenus mois
        const revenusMoisAgg = await Paiement.aggregate([
            {
                $match: {
                    ...matchBase,
                    createdAt: { $gte: debutMois },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$montantTotal" },
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

        const paiements = await Paiement.find({
            chauffeur: userId,
            statut: "PAYE",
        })
            .sort({ createdAt: -1 })
            .populate({
                path: 'reservation',
                select: 'depart destination distanceKm dureeMin prix'
            })
            .populate({
                path: 'passager',
                select: 'nom prenom photoUrl'
            });

        const data = paiements.map((p) => ({
            id: p._id,
            date: p.createdAt,
            trajet: p.reservation ? `${p.reservation.depart} - ${p.reservation.destination}` : "Trajet inconnu",
            depart: p.reservation?.depart || "N/A",
            destination: p.reservation?.destination || "N/A",
            distanceKm: p.reservation?.distanceKm || 0,
            dureeMin: p.reservation?.dureeMin || 0,
            passager: p.passager ? {
                nom: `${p.passager.prenom} ${p.passager.nom}`,
                photo: p.passager.photoUrl
            } : null,
            modePaiement: p.methode || "N/A",
            montantBrut: p.montantTotal,
            commission: p.commissionPlateforme,
            gainNet: p.montantChauffeur,
            statutPaiement: p.statut,
            verse: p.verse || false,
            verseLe: p.verseLe || null
        }));

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


