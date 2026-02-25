const { body } = require("express-validator");

exports.validerEstimation = [
    body("depart").notEmpty().withMessage("Le départ est obligatoire"),
    body("destination").notEmpty().withMessage("La destination est obligatoire"),
    body("typeVehicule")
        .notEmpty()
        .withMessage("Le type de véhicule est obligatoire")
        .isIn(["MOTO", "TAXI", "VOITURE", "BUS"])
        .withMessage("Type de véhicule invalide"),
];
