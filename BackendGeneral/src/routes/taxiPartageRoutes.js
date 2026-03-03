const express = require("express");
const router = express.Router();
const taxiPartageControllers = require("../controllers/taxiPartageControllers");
const authMiddlewares = require("../middlewares/authMiddlewares");

// Middleware d'authentification pour toutes les routes
router.use(authMiddlewares.verifierToken);

// ==================== GESTION DES GROUPES ====================

// Créer un groupe de taxi partagé (quand 1ère réservation TAXI_PARTAGE acceptée)
router.post("/groupe/creer", taxiPartageControllers.creerGroupeTaxiPartage);

// Ajouter un passager à un groupe existant
router.post("/groupe/:groupeId/ajouter", taxiPartageControllers.ajouterPassagerGroupe);

// Obtenir les détails d'un groupe spécifique
router.get("/groupe/:groupeId", taxiPartageControllers.getDetailsGroupe);

// Obtenir la file d'attente de ramassage du chauffeur
router.get("/file-ramassage", taxiPartageControllers.getFileRamassage);

// Obtenir tous les groupes actifs du chauffeur
router.get("/groupes-actifs", taxiPartageControllers.getGroupesActifs);

// ==================== VALIDATION DÉMARRAGE ====================

// Valider si le trajet peut démarrer (BACKEND OBLIGATOIRE)
router.get("/groupe/:groupeId/peut-demarrer", taxiPartageControllers.validerDemarrageTrajet);

// ==================== ACTIONS SUR LES PASSAGERS ====================

// Passer un passager en "en cours de ramassage" (chauffeur en route)
router.post("/passager/:reservationId/en-route", taxiPartageControllers.passerEnCoursDeRamassage);

// Signaler l'arrivée et le ramassage d'un passager
router.post("/passager/:reservationId/arrivee", taxiPartageControllers.signalerArriveePassager);

// ==================== GESTION DU TRAJET ====================

// Démarrer le trajet pour tout le groupe (validation backend obligatoire)
router.post("/groupe/:groupeId/demarrer", taxiPartageControllers.demarrerTrajetGroupe);

// Terminer le trajet du groupe
router.post("/groupe/:groupeId/terminer", taxiPartageControllers.terminerTrajetGroupe);

module.exports = router;
