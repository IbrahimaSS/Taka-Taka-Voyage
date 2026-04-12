const express = require("express");
const router = express.Router();
const ticketController = require("../../controllers/common/ticketController");
const { verifierToken } = require("../../middlewares/authMiddlewares");

// Routes pour les passagers
router.get("/mes-tickets", verifierToken, ticketController.getMesTickets);
router.get("/reservation/:reservationId", verifierToken, ticketController.getTicketParReservation);

// Route pour les chauffeurs (Validation QR)
router.post("/scanner", verifierToken, ticketController.validerScannerTicket);

module.exports = router;
