const { body } = require("express-validator");

exports.validerInscription = [
    body("nom")
        .trim()
        .notEmpty()
        .withMessage("Le nom est obligatoire"),
    body("prenom")
        .trim()
        .notEmpty()
        .withMessage("Le prénom est obligatoire"),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Email invalide"),
    body("telephone")
        .matches(/^[0-9]{9}$/).withMessage("Le format du Teléphone est incorrect")
        .notEmpty()
        .withMessage("Le téléphone est obligatoire"),
    body("motDePasse")
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit contenir au moins 8 caractères"),
    body("typeProfil")
        .optional()
        .isIn(["PASSAGER", "CHAUFFEUR"])
        .withMessage("Le type de profil est invalide"),
    body("genre")
        .optional()
        .isIn(["MASCULIN", "FEMININ"])
        .withMessage("Le genre est invalide"),
];
