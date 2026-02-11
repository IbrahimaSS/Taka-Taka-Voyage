const { body } = require("express-validator");

exports.validerConnexion = [
    body("identifiant")
        .trim()
        .notEmpty()
        .withMessage("Identifiant invalide"),

    body("motDePasse")
        .trim()
        .notEmpty()
        .withMessage("Le mot de passe est obligatoire"),
];
