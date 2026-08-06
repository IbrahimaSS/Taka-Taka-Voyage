import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { locationService } from '../../../services/locationService';
import ReservationStatsCards from './reservationslocation/ReservationStatsCards';
import ReservationsFilterBar from './reservationslocation/ReservationsFilterBar';
import ReservationCard from './reservationslocation/ReservationCard';
import ReservationActionModals from './reservationslocation/ReservationActionModals';

const ReservationsLocation = ({ showToast }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [searchTerm, setSearchTerm] = useState('');

  // States pour les modals
  const [isRefusalModalOpen, setIsRefusalModalOpen] = useState(false);
  const [refusalMotif, setRefusalMotif] = useState('');
  const [idToRefuse, setIdToRefuse] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Modals pour Démarrer/Retour
  const [isDemarrerModalOpen, setIsDemarrerModalOpen] = useState(false);
  const [isRetourModalOpen, setIsRetourModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatut !== 'TOUS') params.statut = filterStatut;
      const res = await locationService.getReservations(params);
      if (res.donnees) {
        setReservations(res.donnees);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      showToast?.('Erreur lors du chargement des réservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatut]);

  const handleApprouver = async (id) => {
    setActionLoading(id);
    try {
      await locationService.approuverReservation(id);
      showToast?.('✅ Réservation approuvée avec succès !', 'success');
      fetchReservations();
    } catch (error) {
      showToast?.('Erreur lors de l\'approbation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuser = (id) => {
    setIdToRefuse(id);
    setRefusalMotif('');
    setIsRefusalModalOpen(true);
  };

  const confirmRefuser = async () => {
    if (!idToRefuse) return;

    setActionLoading(idToRefuse);
    setIsRefusalModalOpen(false);

    try {
      await locationService.refuserReservation(idToRefuse, refusalMotif || 'Non spécifié');
      showToast?.('❌ Réservation refusée. Caution remboursée.', 'success');
      fetchReservations();
    } catch (error) {
      showToast?.('Erreur lors du refus', 'error');
    } finally {
      setActionLoading(null);
      setIdToRefuse(null);
    }
  };

  const handleDemarrer = (id) => {
    setSelectedLocationId(id);
    setIsDemarrerModalOpen(true);
  };

  const confirmDemarrer = async () => {
    if (!selectedLocationId) return;
    setActionLoading(selectedLocationId);
    setIsDemarrerModalOpen(false);
    try {
      await locationService.demarrerLocation(selectedLocationId);
      showToast?.('🚗 Location démarrée !', 'success');
      fetchReservations();
    } catch (error) {
      showToast?.('Erreur lors du démarrage', 'error');
    } finally {
      setActionLoading(null);
      setSelectedLocationId(null);
    }
  };

  const handleConfirmerRetour = (id) => {
    setSelectedLocationId(id);
    setIsRetourModalOpen(true);
  };

  const confirmConfirmerRetour = async () => {
    if (!selectedLocationId) return;
    setActionLoading(selectedLocationId);
    setIsRetourModalOpen(false);
    try {
      await locationService.confirmerRetour(selectedLocationId);
      showToast?.('✅ Retour validé et caution remboursée', 'success');
      fetchReservations();
    } catch (error) {
      showToast?.('Erreur lors de la validation du retour', 'error');
    } finally {
      setActionLoading(null);
      setSelectedLocationId(null);
    }
  };

  const handleSupprimer = (id) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmSupprimer = async () => {
    if (!idToDelete) return;

    setActionLoading(idToDelete);
    setIsDeleteModalOpen(false);

    try {
      await locationService.supprimerReservation(idToDelete);
      showToast?.('🗑️ Réservation supprimée', 'success');
      fetchReservations();
    } catch (error) {
      showToast?.('Erreur lors de la suppression', 'error');
    } finally {
      setActionLoading(null);
      setIdToDelete(null);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const clientNom = `${r.client?.prenom || ''} ${r.client?.nom || ''}`.toLowerCase();
    const vehiculeNom = `${r.vehicule?.marque || ''} ${r.vehicule?.modele || ''}`.toLowerCase();
    const ref = (r.reference || '').toLowerCase();
    return (clientNom + vehiculeNom + ref).includes(searchTerm.toLowerCase());
  });

  const nbEnAttente = reservations.filter(r => r.statut === 'EN_ATTENTE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-primary-600" />
            Réservations Baraka Trans
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gérez les demandes de location et validez les contrats.
          </p>
        </div>
        {nbEnAttente > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-700 dark:text-yellow-400">{nbEnAttente} demande(s) en attente</span>
          </div>
        )}
      </div>

      <ReservationStatsCards reservations={reservations} nbEnAttente={nbEnAttente} />

      <ReservationsFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatut={filterStatut}
        onFilterChange={setFilterStatut}
      />

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
          <p className="text-slate-500 animate-pulse">Chargement des réservations...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune réservation trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((reservation, index) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              index={index}
              actionLoading={actionLoading}
              onApprouver={handleApprouver}
              onRefuser={handleRefuser}
              onDemarrer={handleDemarrer}
              onConfirmerRetour={handleConfirmerRetour}
              onSupprimer={handleSupprimer}
            />
          ))}
        </div>
      )}

      <ReservationActionModals
        isRefusalModalOpen={isRefusalModalOpen}
        onCloseRefusal={() => setIsRefusalModalOpen(false)}
        refusalMotif={refusalMotif}
        onRefusalMotifChange={setRefusalMotif}
        onConfirmRefuser={confirmRefuser}
        isDeleteModalOpen={isDeleteModalOpen}
        onCloseDelete={() => setIsDeleteModalOpen(false)}
        onConfirmSupprimer={confirmSupprimer}
        isDemarrerModalOpen={isDemarrerModalOpen}
        onCloseDemarrer={() => setIsDemarrerModalOpen(false)}
        onConfirmDemarrer={confirmDemarrer}
        isRetourModalOpen={isRetourModalOpen}
        onCloseRetour={() => setIsRetourModalOpen(false)}
        onConfirmRetour={confirmConfirmerRetour}
      />
    </div>
  );
};

export default ReservationsLocation;
