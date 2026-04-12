import { apiClient } from './apiClient';
import { API_ROUTES } from './apiRoutes';

/**
 * Service pour la gestion des Tickets QR
 */
export const ticketService = {
    /**
     * Récupère la liste des tickets de l'utilisateur
     */
    getMesTickets: () => apiClient.get(API_ROUTES.tickets.mesTickets),

    /**
     * Récupère le ticket d'une réservation spécifique
     */
    getTicketParReservation: (reservationId) => apiClient.get(API_ROUTES.tickets.parReservation(reservationId)),

    /**
     * Valide un ticket via scan QR (Action Chauffeur)
     */
    validerTicket: (codeUnique) => apiClient.post(API_ROUTES.tickets.scanner, { codeUnique }),
};
