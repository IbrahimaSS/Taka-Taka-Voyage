import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, Car, Clock, DollarSign,
  CheckCircle2, XCircle, Loader2, Search,
  AlertCircle, Shield, Eye, Trash2
} from 'lucide-react';
import { locationService } from '../../../services/locationService';
import { getFullAssetURL } from '../../../utils/urlHelper';
import AdminButton from '../ui/Bttn';
import Modal from '../ui/Modal';

const statutColors = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROUVÉE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  EN_COURS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TERMINÉE: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  ANNULÉE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LITIGE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const statutLabels = {
  EN_ATTENTE: '🟡 En attente',
  APPROUVÉE: '🟢 Approuvée',
  EN_COURS: '🔵 En cours',
  TERMINÉE: '⚪ Terminée',
  ANNULÉE: '🔴 Annulée',
  LITIGE: '🟠 Litige',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const formatPrix = (prix) => new Intl.NumberFormat('fr-GN').format(prix || 0);

const isLate = (reservation) => {
  if (reservation.statut !== 'EN_COURS' && reservation.statut !== 'RETOUR_SIGNALÉ') return false;
  const now = new Date();
  const dateFin = new Date(reservation.date_fin_prevue);
  return now > dateFin;
};

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

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: reservations.length, color: 'bg-blue-500', icon: Calendar },
          { label: 'En attente', value: nbEnAttente, color: 'bg-yellow-500', icon: Clock },
          { label: 'Approuvées', value: reservations.filter(r => r.statut === 'APPROUVÉE' || r.statut === 'EN_COURS').length, color: 'bg-green-500', icon: CheckCircle2 },
          { label: 'Refusées', value: reservations.filter(r => r.statut === 'ANNULÉE').length, color: 'bg-red-500', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par client, véhicule, référence..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVÉE">Approuvées</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINÉE">Terminées</option>
          <option value="ANNULÉE">Annulées</option>
        </select>
      </div>

      {/* Tableau */}
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
            <motion.div
              key={reservation._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-slate-800 rounded-xl border p-4 md:p-5 transition-all hover:shadow-md ${reservation.statut === 'EN_ATTENTE'
                ? 'border-yellow-300 dark:border-yellow-700 shadow-sm shadow-yellow-100 dark:shadow-yellow-900/10'
                : 'border-slate-200 dark:border-slate-700'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Infos principales */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Photo véhicule */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                    {reservation.vehicule?.photos?.[0] ? (
                      <img
                        src={getFullAssetURL(reservation.vehicule.photos[0])}
                        alt="Véhicule"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {reservation.vehicule?.marque} {reservation.vehicule?.modele}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statutColors[reservation.statut] || ''}`}>
                        {statutLabels[reservation.statut] || reservation.statut}
                      </span>
                      {isLate(reservation) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-800">
                          ⚠️ RETARD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Réf: <span className="font-mono font-bold">{reservation.reference}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {reservation.client?.prenom} {reservation.client?.nom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(reservation.date_debut)} → {formatDate(reservation.date_fin_prevue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Montants */}
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-slate-900 dark:text-white">{formatPrix(reservation.montant_total)} GNF</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Caution</p>
                    <p className="font-bold text-amber-600">{formatPrix(reservation.caution_bloquee)} GNF</p>
                  </div>

                  {/* Actions */}
                  {reservation.statut === 'EN_ATTENTE' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprouver(reservation._id)}
                        disabled={actionLoading === reservation._id}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading === reservation._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRefuser(reservation._id)}
                        disabled={actionLoading === reservation._id}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Refuser
                      </button>
                    </div>
                  )}

                  {/* Bouton Démarrer si Approuvée */}
                  {reservation.statut === 'APPROUVÉE' && (
                    <button
                      onClick={() => handleDemarrer(reservation._id)}
                      disabled={actionLoading === reservation._id}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === reservation._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Car className="w-3.5 h-3.5" />
                      )}
                      Démarrer
                    </button>
                  )}

                  {/* Bouton Confirmer Retour si Retour Signalé ou En Cours */}
                  {(reservation.statut === 'RETOUR_SIGNALÉ' || reservation.statut === 'EN_COURS') && (
                    <button
                      onClick={() => handleConfirmerRetour(reservation._id)}
                      disabled={actionLoading === reservation._id}
                      className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === reservation._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Confirmer Retour
                    </button>
                  )}

                  {/* Bouton Supprimer (toujours visible pour les admins pour nettoyer) */}
                  <button
                    onClick={() => handleSupprimer(reservation._id)}
                    disabled={actionLoading === reservation._id}
                    title="Supprimer la réservation"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    {actionLoading === reservation._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Modal de Confirmation de Refus */}
      <Modal
        isOpen={isRefusalModalOpen}
        onClose={() => setIsRefusalModalOpen(false)}
        title="Refuser la réservation"
        icon={XCircle}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Voulez-vous vraiment refuser cette demande ? La caution sera automatiquement recréditée sur le compte du client.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
              Motif du refus (optionnel)
            </label>
            <textarea
              value={refusalMotif}
              onChange={(e) => setRefusalMotif(e.target.value)}
              placeholder="Ex: Véhicule indisponible, profil non conforme..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <AdminButton
              variant="outline"
              className="flex-1"
              onClick={() => setIsRefusalModalOpen(false)}
            >
              Annuler
            </AdminButton>
            <AdminButton
              variant="perso"
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
              onClick={confirmRefuser}
            >
              Confirmer le refus
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmation de Suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer la réservation"
        icon={Trash2}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              Êtes-vous sûr de vouloir supprimer définitivement cette réservation ? Cette action est irréversible et effacera toutes les données associées de l'historique.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <AdminButton
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </AdminButton>
            <AdminButton
              variant="perso"
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 text-white"
              onClick={confirmSupprimer}
            >
              Confirmer la suppression
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation Démarrage */}
      <Modal
        isOpen={isDemarrerModalOpen}
        onClose={() => setIsDemarrerModalOpen(false)}
        title="Démarrer la location"
        icon={Car}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Voulez-vous marquer cette location comme démarrée ? Cela signifie que vous avez remis les clés et le véhicule au client.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={() => setIsDemarrerModalOpen(false)}>
              Annuler
            </AdminButton>
            <AdminButton variant="primary" className="flex-1" onClick={confirmDemarrer}>
              Démarrer la location
            </AdminButton>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation Retour */}
      <Modal
        isOpen={isRetourModalOpen}
        onClose={() => setIsRetourModalOpen(false)}
        title="Confirmer le retour"
        icon={CheckCircle2}
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Confirmez-vous la réception du véhicule ? Cette action remboursera automatiquement la caution sur le solde du client.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <AdminButton variant="outline" className="flex-1" onClick={() => setIsRetourModalOpen(false)}>
              Annuler
            </AdminButton>
            <AdminButton variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600" onClick={confirmConfirmerRetour}>
              Confirmer le retour
            </AdminButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationsLocation;
