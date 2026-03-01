const Document = require("../../models/Documents");
const ChauffeurProfile = require("../../models/ChauffeurProfile");

const Utilisateurs = require("../../models/Utilisateurs");

// LISTE DES CHAUFFEURS AVEC RÉSUMÉ DES DOCUMENTS
exports.listeChauffeursAvecDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const total = await ChauffeurProfile.countDocuments();
        const chauffeurs = await ChauffeurProfile.find()
            .populate("utilisateur", "nom prenom email telephone photoUrl")
            .skip(skip)
            .limit(limit);

        const resultats = await Promise.all(chauffeurs.map(async (cp) => {
            const documents = await Document.find({ chauffeur: cp._id });

            const validCount = documents.filter(d => d.statut === "VALIDE").length;
            const pendingCount = documents.filter(d => d.statut === "VERIFIER").length;
            const rejectedCount = documents.filter(d => d.statut === "REFUSE").length;

            const typesRequis = [
                { label: "Permis de conduire", code: "PERMIS" },
                { label: "Carte grise", code: "CARTE_GRISE" },
                { label: "Assurance", code: "ASSURANCE" },
                { label: "Photo véhicule", code: "PHOTO_VEHICULE" },
                { label: "Pièce d'identité", code: "IDENTITE" }
            ];

            const manquants = typesRequis
                .filter(tr => !documents.some(d => d.type === tr.code))
                .map(tr => tr.label);

            return {
                id: cp._id,
                nom: `${cp.utilisateur?.prenom} ${cp.utilisateur?.nom}`,
                photoUrl: cp.utilisateur?.photoUrl,
                validCount,
                pendingCount,
                rejectedCount,
                manquants,
                totalDocs: documents.length,
                completeness: Math.round(((typesRequis.length - manquants.length) / typesRequis.length) * 100),
                documents: documents.map(d => ({
                    id: d._id,
                    type: d.type,
                    statut: d.statut,
                    fichier: d.fichier,
                    createdAt: d.createdAt
                }))
            };
        }));

        return res.json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            donnees: resultats
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ succes: false, message: "Erreur serveur" });
    }
};


//================================GESTIONS DES DOCUMENTS============================

// CARDS DOCUMENTS
exports.statsDocuments = async (req, res) => {
    try {
        const aujourdHui = new Date();

        const dans7Jours = new Date();
        dans7Jours.setDate(aujourdHui.getDate() + 7);

        // Documents totaux
        const documentsTotaux = await Document.countDocuments();

        // Documents à vérifier
        const aVerifier = await Document.countDocuments({
            statut: "VERIFIER",
        });

        // Documents expirent bientôt
        const expirentBientot = await Document.countDocuments({
            statut: "VALIDE",
            dateExpiration: {
                $gte: aujourdHui,
                $lte: dans7Jours,
            },
        });

        return res.status(200).json({
            succes: true,
            stats: {
                documentsTotaux,
                aVerifier,
                expirentBientot,
            },
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// LISTE DOCUMENTS
exports.listeDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const total = await Document.countDocuments();

        const documents = await Document.find()
            .populate("chauffeur", "nom prenom email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const resultat = documents.map((doc) => ({
            id: doc._id,
            chauffeur: doc.chauffeur,
            type: doc.type,
            numero: doc.numero,
            statut: doc.statut,
            dateExpiration: doc.dateExpiration,
            fichier: doc.fichier,
            createdAt: doc.createdAt,
        }));

        return res.status(200).json({
            succes: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            documents: resultat,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// VALIDER / REFUSER DOCUMENT
exports.changerStatutDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        const statutsAutorises = ["VALIDE", "REFUSE"];

        if (!statutsAutorises.includes(statut)) {
            return res.status(400).json({
                succes: false,
                message: "Statut invalide",
            });
        }

        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                succes: false,
                message: "Document introuvable",
            });
        }

        document.statut = statut;
        await document.save();

        return res.status(200).json({
            succes: true,
            message: "Statut du document mis à jour",
            document,
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};

// VOIR DOCUMENTS D'UN CHAUFFEUR
exports.voirDocumentsChauffeur = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier chauffeur
        const chauffeur = await Utilisateurs.findById(id).select(
            "nom prenom email telephone"
        );

        if (!chauffeur) {
            return res.status(404).json({
                succes: false,
                message: "Chauffeur introuvable",
            });
        }

        // Tous les documents du chauffeur
        const documents = await Document.find({ chauffeur: id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            succes: true,
            chauffeur,
            totalDocuments: documents.length,
            documents: documents.map((doc) => ({
                id: doc._id,
                type: doc.type,
                numero: doc.numero,
                statut: doc.statut,
                dateExpiration: doc.dateExpiration,
                fichier: doc.fichier,
                createdAt: doc.createdAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: error.message,
        });
    }
};
