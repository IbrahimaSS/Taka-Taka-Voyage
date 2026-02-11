const Personnels = require("../../models/Personnels");
const bcrypt = require("bcryptjs");

// CREER UN PERSONNEL
exports.createPersonnel = async (req, res) => {
    try {
        const {
        nom,
        prenom,
        email,
        telephone,
        role,
        permissions = {},
        } = req.body;

        // Vérification email
        const existe = await Personnels.findOne({ email });
        if (existe) {
        return res.status(400).json({
            succes: false,
            message: "Email déjà utilisé",
        });
        }

        // Mot de passe temporaire
        const motDePasseTemp = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(motDePasseTemp, 10);

        const personnel = await Personnels.create({
        nom,
        prenom,
        email,
        telephone,
        role,
        permissions: {
            lecture: permissions.lecture ?? true,
            edition: permissions.edition ?? false,
            creation: permissions.creation ?? false,
            suppression: permissions.suppression ?? false,
            gestionUtilisateurs: permissions.gestionUtilisateurs ?? false,
        },
        password: passwordHash,
        creePar: req.utilisateur._id, // admin connecté
        });

        return res.status(201).json({
        succes: true,
        message: "Personnel créé avec succès",
        personnel: {
            id: personnel._id,
            nom: personnel.nom,
            prenom: personnel.prenom,
            email: personnel.email,
            role: personnel.role,
            statut: personnel.statut,
        },
        motDePasseTemporaire: motDePasseTemp, // ⚠️ à envoyer par email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur création personnel",
        });
    }
};


// LISTER TOUS LES PERSONNELS
exports.getPersonnels = async (req, res) => {
    const personnels = await Personnels.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.json({
        succes: true,
        personnels,
    });
};

// DETAILS D'UN PERSONNEL
exports.getPersonnelById = async (req, res) => {
    try {
        const personnel = await Personnels.findById(req.params.id).select(
        "-password"
        );

        if (!personnel) {
        return res.status(404).json({
            succes: false,
            message: "Personnel non trouvé",
        });
        }

        res.json({
        succes: true,
        personnel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur récupération personnel",
        });
    }
};

// METTRE A JOUR UN PERSONNEL
exports.updatePersonnel = async (req, res) => {
    try {
        const personnel = await Personnels.findById(req.params.id);

        if (!personnel) {
        return res.status(404).json({
            succes: false,
            message: "Personnel non trouvé",
        });
        }

        const {
        nom,
        prenom,
        email,
        telephone,
        role,
        permissions = {},
        statut,
        } = req.body;

        // Mise à jour des champs
        if (nom) personnel.nom = nom;
        if (prenom) personnel.prenom = prenom;
        if (email) personnel.email = email;
        if (telephone) personnel.telephone = telephone;
        if (role) personnel.role = role;
        if (statut) personnel.statut = statut;

        // Permissions
        personnel.permissions = {
        lecture: permissions.lecture ?? personnel.permissions.lecture,
        edition: permissions.edition ?? personnel.permissions.edition,
        creation: permissions.creation ?? personnel.permissions.creation,
        suppression: permissions.suppression ?? personnel.permissions.suppression,
        gestionUtilisateurs:
            permissions.gestionUtilisateurs ??
            personnel.permissions.gestionUtilisateurs,
        };

        await personnel.save();

        res.json({
        succes: true,
        message: "Personnel mis à jour avec succès",
        personnel: {
            id: personnel._id,
            nom: personnel.nom,
            prenom: personnel.prenom,
            email: personnel.email,
            role: personnel.role,
            statut: personnel.statut,
        },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur mise à jour personnel",
        });
    }
};

// SUPPRIMER UN PERSONNEL
exports.deletePersonnel = async (req, res) => {
    try {
        const personnel = await Personnels.findById(req.params.id);

        if (!personnel) {
        return res.status(404).json({
            succes: false,
            message: "Personnel non trouvé",
        });
        }

        await personnel.remove();

        res.json({
        succes: true,
        message: "Personnel supprimé avec succès",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur suppression personnel",
        });
    }
};

// DESACTIVER/ACTIVER UN PERSONNEL
exports.togglePersonnelStatus = async (req, res) => {
    try {
        const personnel = await Personnels.findById(req.params.id);

        if (!personnel) {
        return res.status(404).json({
            succes: false,
            message: "Personnel non trouvé",
        });
        }

        personnel.statut = personnel.statut === "ACTIF" ? "INACTIF" : "ACTIF";
        await personnel.save();

        res.json({
        succes: true,
        message: `Personnel ${personnel.statut === "ACTIF" ? "activé" : "désactivé"} avec succès`,
        statut: personnel.statut,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        succes: false,
        message: "Erreur changement statut personnel",
        });
    }
};