import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { locationService } from '../../../services/locationService';
import toast from 'react-hot-toast';

export const useRentalHistory = () => {
  const { user: currentUser } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedRentalForInvoice, setSelectedRentalForInvoice] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      // On récupère les réservations (le backend filtre déjà par utilisateur connecté)
      const res = await locationService.getMesReservations();
      setRentals(res.donnees || []);
    } catch (error) {
      console.error("Erreur chargement locations:", error);
      toast.error("Impossible de charger vos locations");
    } finally {
      setLoading(false);
    }
  };

  const handleSignalerRetour = async () => {
    if (!confirmModal) return;

    try {
      await locationService.signalerRetour(confirmModal);
      toast.success("Retour signalé avec succès !");
      setConfirmModal(null);
      fetchRentals(); // Recharger la liste
    } catch (error) {
      toast.error(error.message || "Erreur lors du signalement");
      setConfirmModal(null);
    }
  };

  const filteredRentals = rentals.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['EN_COURS', 'APPROUVÉE', 'RETOUR_SIGNALÉ'].includes(r.statut);
    if (activeFilter === 'completed') return r.statut === 'TERMINÉE';
    return true;
  });

  const mapRentalToInvoice = (rental) => {
    if (!rental) return null;
    return {
      reference: rental.reference || `LOC-${rental._id.substring(18).toUpperCase()}`,
      amount: `${rental.montant_total?.toLocaleString()} GNF`,
      date: new Date(rental.updatedAt || rental.createdAt).toLocaleDateString(),
      method: 'Taka Wallet / Orange Money',
      status: 'paid',
      passenger: {
        name: rental.passager?.nomComplet || currentUser?.nomComplet || 'Client TakaTaka',
        phone: rental.passager?.telephone || currentUser?.telephone || '-',
        email: rental.passager?.email || currentUser?.email || '-'
      },
      driver: {
        name: 'Baraka Trans (Flotte)',
        vehicle: `${rental.vehicule?.marque} ${rental.vehicule?.modele} (${rental.vehicule?.immatriculation || 'En attente'})`,
        phone: '+224 000 00 00 00',
        email: 'location@barakatrans.gn'
      },
      trip: {
        route: `Agence de Livraison → Point de Retour`,
        distance: '-',
        duration: `${Math.ceil((new Date(rental.date_fin_prevue) - new Date(rental.date_debut)) / (1000 * 60 * 60 * 24))} jours`
      }
    };
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'EN_ATTENTE': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', label: 'En attente' };
      case 'APPROUVÉE': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', label: 'Approuvée' };
      case 'EN_COURS': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', label: 'En cours' };
      case 'RETOUR_SIGNALÉ': return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', label: 'Retour signalé' };
      case 'TERMINÉE': return { bg: 'bg-gray-50 dark:bg-gray-900/40', text: 'text-gray-500', label: 'Terminée' };
      case 'ANNULÉE': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', label: 'Annulée' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', label: status };
    }
  };

  return {
    loading,
    activeFilter,
    setActiveFilter,
    confirmModal,
    setConfirmModal,
    selectedRentalForInvoice,
    setSelectedRentalForInvoice,
    filteredRentals,
    handleSignalerRetour,
    mapRentalToInvoice,
    getStatusStyle,
  };
};
