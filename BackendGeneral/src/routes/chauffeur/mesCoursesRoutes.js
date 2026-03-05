const express = require("express");
const router = express.Router();

const {
    verifierToken
} = require("../../middlewares/authMiddlewares");

const mesCoursesCtrl = require("../../controllers/chauffeur/courses/mesCoursesControllers");
const { autoriserRoles } = require("../../middlewares/roleMiddlewares.js");

/**
 * @swagger
 * /api/chauffeur/disponibles:
 *   get:
 *     summary: Récupérer les courses disponibles autour du chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des courses
 *       401:
 *         description: Non autorisé
 */
router.get(
    "/disponibles",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listeDisponible
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/accepter:
 *   post:
 *     summary: Accepter une demande de réservation
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation acceptée
 *       400:
 *         description: Erreur lors de l'acceptation
 */
router.post(
    "/mes-courses/:reservationId/accepter",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.accepterReservation
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/refuser:
 *   post:
 *     summary: Refuser une demande de réservation
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation refusée
 *       400:
 *         description: Erreur lors du refus
 */
router.post(
    "/mes-courses/:reservationId/refuser",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.refuserReservation
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/ramassage:
 *   get:
 *     summary: Obtenir la liste des courses en cours de ramassage
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des courses en ramassage
 *       401:
 *         description: Non autorisé
 */
router.get(
    "/mes-courses/ramassage",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listeRamassage
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/rejoindre:
 *   post:
 *     summary: Signaler que le chauffeur est en route vers le point de départ
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Action effectuée
 */
router.post(
    "/mes-courses/:reservationId/rejoindre",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.rejoindreCourse
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/signaler-arrivee:
 *   post:
 *     summary: Signaler l'arrivée au point de départ
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arrivée signalée
 */
router.post(
    "/mes-courses/:reservationId/signaler-arrivee",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.signalerArrivee
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/demarrer:
 *   post:
 *     summary: Démarrer le trajet avec le passager
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet démarré
 */
router.post(
    "/mes-courses/:reservationId/demarrer",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.demarrerTrajet
);

/**
 * @swagger
 * /api/chauffeur/mes-courses/{reservationId}/terminer:
 *   post:
 *     summary: Terminer le trajet après arrivée à destination
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet terminé
 */
router.post(
    "/mes-courses/:reservationId/terminer",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.terminerTrajet
);

/**
 * @swagger
 * /api/chauffeur/plannings:
 *   get:
 *     summary: Obtenir la liste des trajets planifiés pour ce chauffeur
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des trajets planifiés
 *       401:
 *         description: Non autorisé
 */
router.get(
    "/plannings",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.listePlannings
);

/**
 * @swagger
 * /api/chauffeur/planifiee/{reservationId}/commencer:
 *   patch:
 *     summary: Démarrer une réservation planifiée (transférer dans la file de ramassage)
 *     description: |
 *       C'est le déclencheur officiel pour qu'une réservation planifiée
 *       passe du planning à la file de ramassage active.
 *       Transition de statut : ACCEPTEE → EN_COURS_DE_RECUPERATION.
 *       Vérification : le chauffeur ne peut commencer que 15 min avant l'heure prévue.
 *     tags: [2 - Chauffeurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation planifiée démarrée, passager ajouté à la file de ramassage
 *       400:
 *         description: Trop tôt ou réservation introuvable
 */
router.patch(
    "/planifiee/:reservationId/commencer",
    verifierToken,
    autoriserRoles("CHAUFFEUR"),
    mesCoursesCtrl.commencerPlanifiee
);

module.exports = router;
