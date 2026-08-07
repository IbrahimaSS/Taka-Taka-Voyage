import { useState, useEffect } from 'react';
import { usePassenger } from '../../../context/PassengerContext';
import { ticketService } from '../../../services/ticketService';

export const useTickets = (activeTab, setActiveTab) => {
  const { pendingTicket, setPendingTicket } = usePassenger();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const response = await ticketService.getMesTickets();
      if (response.data?.succes) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }

    const handleTicketReady = () => {
      console.log("🎫 [PROFILE] Nouveau ticket prêt, rafraîchissement...");
      fetchTickets();
    };

    const handleOpenTicket = (e) => {
      console.log("🎫 [PROFILE] Event taka:open_ticket reçu", e.detail);
      setActiveTab('tickets');
      setSelectedTicket(e.detail);
    };

    window.addEventListener('taka:ticket_ready', handleTicketReady);
    window.addEventListener('taka:open_ticket', handleOpenTicket);
    window.addEventListener('taka:open_ticket_delay', handleOpenTicket);
    return () => {
      window.removeEventListener('taka:ticket_ready', handleTicketReady);
      window.removeEventListener('taka:open_ticket', handleOpenTicket);
      window.removeEventListener('taka:open_ticket_delay', handleOpenTicket);
    };
  }, [activeTab]);

  // Ouverture automatique du ticket en attente
  useEffect(() => {
    if (pendingTicket) {
      console.log("🎫 [PROFILE] Ouverture automatique du ticket en attente:", pendingTicket.codeUnique);
      setActiveTab('tickets');
      setSelectedTicket(pendingTicket);
      setPendingTicket(null); // Consommé
    }
  }, [pendingTicket, setPendingTicket]);

  return {
    tickets, isLoadingTickets,
    selectedTicket, setSelectedTicket,
    searchTerm, setSearchTerm,
  };
};
