// src/components/sections/Disputes.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  Search, Eye, Check, X, AlertTriangle,
  Clock, CheckCircle, Hourglass, XCircle,
  DollarSign, Download, FileText, FileSpreadsheet,
  User, Car, Calendar, ChevronDown, Trash2,
  RefreshCw, FileDown, MoreVertical, BarChart3,
  File, MessageSquare, Tag, Shield, CreditCard, MapPin
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import ChartCard from '../ui/ChartCard';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';
import { apiClient } from '../../../services/apiClient';
import { API_ROUTES } from '../../../services/apiRoutes';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../../context/NotificationContext';
import { renderStatus, renderPriority, renderType } from './litiges/disputeBadges';
import TableActions from './litiges/TableActions';
import DisputesFilterBar from './litiges/DisputesFilterBar';
import ResponsiveDisputesTable from './litiges/ResponsiveDisputesTable';
import DisputeDetailsModal from './litiges/DisputeDetailsModal';


// Données de démonstration
// TODO API (admin/litiges):
// Remplacer les donnees de demonstration et les actions locales par des appels backend
// Exemple: GET /admin/litiges, PATCH /admin/litiges/:id (statut)


const Disputes = ({ showToast }) => {
  const { t } = useTranslation();
  // États
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ ouverts: 0, enCours: 0, resolus: 0, total: 0 });
  const [repartitionData, setRepartitionData] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
  const [period, setPeriod] = useState('mensuel');


  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDisputes, setSelectedDisputes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { addNotification } = useNotificationCenter();


  // États pour les modales
  const [modalState, setModalState] = useState({
    showResolve: false,
    showReject: false,
    showDelete: false,
    showDetails: false,
    selectedDispute: null,
    loading: false
  });

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch initial data (Stats + List)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes, repartitionRes] = await Promise.all([
        apiClient.get(API_ROUTES.admin.litiges.stats),
        apiClient.get(API_ROUTES.admin.litiges.list, {
          params: { page: currentPage, limit: pageSize, search, status: statusFilter, type: activeTab !== 'all' ? activeTab : typeFilter }
        }),
        apiClient.get(API_ROUTES.admin.litiges.repartitionTypes, { params: { period } })
      ]);


      if (statsRes.data.succes) setStatsData(statsRes.data.cards);

      if (repartitionRes.data.succes) {
        const colors = ['#10B981', '#1E40AF', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1'];
        const labels = repartitionRes.data.data.map(d => d.label || "Autre");
        const totals = repartitionRes.data.data.map(d => d.total);
        setRepartitionData({
          labels: labels,
          datasets: [{
            data: totals,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
            hoverOffset: 15
          }]
        });
      }

      if (listRes.data.succes) {
        // Normalisation pour le composant (mapper les champs backend aux champs frontend)
        const normalized = listRes.data.litiges.map(l => ({
          id: l.identifiant,
          reference: l.reference,
          date: new Date(l.date).toLocaleString('fr-FR'),
          title: l.type === "PAIEMENT" ? "Paiement non reçu" : "Litige signalé",
          description: l.description || "Aucune description",
          type: l.type.toLowerCase(),
          amount: l.montant || 0,
          users: {
            passenger: l.utilisateurs.passager || "Inconnu",
            driver: l.utilisateurs.chauffeur || "Non assigné",
            passengerId: "N/A",
            driverId: "N/A"
          },
          priority: 'medium', // Backend ne renvoie pas encore priority
          status: l.statut.toLowerCase() === 'resolu' ? 'resolved' :
            l.statut.toLowerCase() === 'en_cours' ? 'in_progress' :
              l.statut.toLowerCase() === 'rejeter' ? 'rejected' : 'open'
        }));
        setDisputes(normalized);
        setTotalItems(listRes.data.pagination.total);
      }
    } catch (error) {
      console.error("Erreur chargement litiges:", error);
      showToast('Erreur', 'Impossible de charger les données des litiges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, search, statusFilter, typeFilter, activeTab, period]);



  // Stats transformées pour StatCard
  const stats = useMemo(() => {
    return [
      {
        title: t('disputes.active_disputes', 'Litiges Ouverts'),
        value: statsData.ouverts.toString(),
        icon: AlertTriangle,
        color: 'red',
        percentage: statsData.total > 0 ? Math.round((statsData.ouverts / statsData.total) * 100) : 0,
        progress: statsData.total > 0 ? (statsData.ouverts / statsData.total) * 100 : 0
      },
      {
        title: t('disputes.in_review', 'En cours'),
        value: statsData.enCours.toString(),
        icon: Hourglass,
        color: 'yellow',
        percentage: statsData.total > 0 ? Math.round((statsData.enCours / statsData.total) * 100) : 0,
        progress: statsData.total > 0 ? (statsData.enCours / statsData.total) * 100 : 0
      },
      {
        title: t('common.resolved', 'Résolus'),
        value: statsData.resolus.toString(),
        icon: CheckCircle,
        color: 'green',
        percentage: statsData.total > 0 ? Math.round((statsData.resolus / statsData.total) * 100) : 0,
        progress: statsData.total > 0 ? (statsData.resolus / statsData.total) * 100 : 0
      },
    ];
  }, [statsData]);

  // Configuration du graphique mémoïsée pour éviter les re-rendus inutiles
  const repartitionChartConfig = useMemo(() => ({
    type: 'doughnut',
    data: repartitionData,
    options: {
      cutout: '70%',
      plugins: {
        legend: { position: 'right' }
      }
    }
  }), [repartitionData]);

  const totalPages = Math.ceil(totalItems / pageSize);



  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: 'N°', accessor: 'index', formatter: (_, __, index) => index + 1 },
    { header: 'Date', accessor: 'date' },
    { header: 'Titre', accessor: 'title' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Type', accessor: 'type', formatter: (value) => {
        const typeMap = {
          payment: 'Paiement',
          driving: 'Conduite',
          delay: 'Retard',
          vehicle: 'Véhicule',
          behavior: 'Comportement'
        };
        return typeMap[value] || value;
      }
    },
    { header: 'Montant', accessor: 'amount', formatter: (value) => `${(value || 0).toLocaleString('fr-FR')} GNF` },
    { header: 'Passager', accessor: 'users.passenger' },
    { header: 'Chauffeur', accessor: 'users.driver' },
    {
      header: 'Priorité', accessor: 'priority', formatter: (value) => {
        const priorityMap = {
          low: 'Basse',
          medium: 'Moyenne',
          high: 'Haute',
          critical: 'Critique'
        };
        return priorityMap[value] || value;
      }
    },
    {
      header: 'Statut', accessor: 'status', formatter: (value) => {
        const statusMap = {
          open: 'Ouvert',
          in_progress: 'En cours',
          resolved: 'Résolu',
          rejected: 'Rejeté',
          pending: 'En attente'
        };
        return statusMap[value] || value;
      }
    }
  ], []);

  // Handlers
  const handleResolve = async (disputeId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await apiClient.patch(API_ROUTES.admin.litiges.resoudre(disputeId), { comment });
      if (res.data.succes) {
        showToast('Litige résolu', `Le litige a été marqué comme résolu`, 'success');
        addNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          title: 'Litige résolu',
          message: `Le litige ${disputeId} a été clôturé positivement.`,
        });
        fetchData(); // Rafraîchir
      }
    } catch (error) {
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la résolution', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false, showResolve: false }));
    }
  };


  const handleReject = async (disputeId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await apiClient.patch(API_ROUTES.admin.litiges.rejeter(disputeId), { comment });
      if (res.data.succes) {
        showToast('Litige rejeté', `Le litige a été rejeté`, 'error');
        addNotification({
          type: NOTIFICATION_TYPES.WARNING,
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          title: 'Litige rejeté',
          message: `Le litige ${disputeId} a été classé sans suite.`,
        });
        fetchData(); // Rafraîchir
      }
    } catch (error) {
      showToast('Erreur', error.response?.data?.message || 'Erreur lors du rejet', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false, showReject: false }));
    }
  };


  const handleDelete = (disputeId) => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setDisputes(prev => prev.filter(dispute => dispute.id !== disputeId));
      setModalState(prev => ({ ...prev, loading: false, showDelete: false }));
      showToast('Litige supprimé', `Le litige ${disputeId} a été supprimé`, 'warning');
    }, 1000);
  };

  const handleBulkResolve = () => {
    if (selectedDisputes.length === 0) {
      showToast('Aucun litige sélectionné', 'Veuillez sélectionner au moins un litige', 'warning');
      return;
    }

    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setDisputes(prev => prev.map(dispute =>
        selectedDisputes.includes(dispute.id)
          ? { ...dispute, status: 'resolved', resolvedAt: new Date(), agent: 'Admin' }
          : dispute
      ));

      setSelectedDisputes([]);
      setModalState(prev => ({ ...prev, loading: false }));
      showToast('Litiges résolus', `${selectedDisputes.length} litiges ont été résolus`, 'success');
    }, 1500);
  };



  const handleViewDetails = async (dispute) => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await apiClient.get(API_ROUTES.admin.litiges.details(dispute.id));
      if (res.data.succes) {
        const d = res.data.litige;
        setModalState(prev => ({
          ...prev,
          showDetails: true,
          selectedDispute: {
            id: dispute.id,
            reference: d.reference,
            title: d.informationsGenerales.titre,
            description: d.informationsGenerales.description,
            date: new Date(d.informationsGenerales.dateCreation).toLocaleString('fr-FR'),
            type: d.type.toLowerCase(),
            status: d.statut.toLowerCase() === 'resolu' ? 'resolved' :
              d.statut.toLowerCase() === 'en_cours' ? 'in_progress' :
                d.statut.toLowerCase() === 'rejeter' ? 'rejected' : 'open',
            users: {
              passenger: d.partiesConcernees.passager || "Inconnu",
              driver: d.partiesConcernees.chauffeur || "Non assigné",
              passengerId: "ID: " + (d.passager?._id || "N/A"),
              driverId: "ID: " + (d.reservation?.chauffeur?._id || "N/A")
            },
            tripId: d.reservation?._id || "N/A",
            tripInfo: {
              depart: d.informationsGenerales?.Depart || "N/A",
              destination: d.informationsGenerales?.Destination || "N/A"
            },
            comments: (d.historique || []).map((h, i) => ({
              id: i,
              user: h.auteur,
              message: h.message,
              date: new Date(h.date).toLocaleString('fr-FR')
            })),
            priority: d.priority || 'medium'
          }
        }));
      }
    } catch (error) {
      console.error("DEBUG LITIGE DETAILS ERROR:", error);
      showToast('Erreur', error.response?.data?.message || 'Impossible de charger les détails', 'error');
    } finally {
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };



  const handleQuickResolve = (dispute) => {
    setModalState(prev => ({
      ...prev,
      showResolve: true,
      selectedDispute: dispute
    }));
  };

  const handleQuickReject = (dispute) => {
    setModalState(prev => ({
      ...prev,
      showReject: true,
      selectedDispute: dispute
    }));
  };

  const handleQuickDelete = (dispute) => {
    setModalState(prev => ({
      ...prev,
      showDelete: true,
      selectedDispute: dispute
    }));
  };

  // Configuration des tabs
  const disputeTabs = [
    { id: 'all', label: t('common.all', 'Tous'), icon: AlertTriangle },
    { id: 'paiement', label: t('nav.paiements', 'Paiements'), icon: DollarSign },
    { id: 'trajet', label: t('trips.trajet', 'Trajet'), icon: Car },
    { id: 'comportement', label: t('disputes.behavior', 'Comportement'), icon: User },
    { id: 'accident', label: t('disputes.accident', 'Accident'), icon: AlertTriangle },
  ];

  // Fonction pour rendre le tableau responsive

  // Modal pour les détails du litige

  return (
    <div className="space-y-6 p-4 md:p-6">


      {/* Modales de confirmation */}
      <ConfirmModal
        isOpen={modalState.showResolve}
        onClose={() => setModalState(prev => ({ ...prev, showResolve: false }))}
        onConfirm={(comment) => handleResolve(modalState.selectedDispute?.id, comment)}
        title="Confirmer la résolution"
        message={`Êtes-vous sûr de vouloir résoudre le litige ${modalState.selectedDispute?.id} ?`}
        type="validate"
        confirmText="Confirmer la résolution"
        cancelText="Annuler"
        showComment={true}
        commentLabel="Commentaire de résolution"
        commentPlaceholder="Ajouter un commentaire sur la résolution..."
        requireComment={false}
        loading={modalState.loading}
      />

      <ConfirmModal
        isOpen={modalState.showReject}
        onClose={() => setModalState(prev => ({ ...prev, showReject: false }))}
        onConfirm={(comment) => handleReject(modalState.selectedDispute?.id, comment)}
        title="Confirmer le rejet"
        message={`Êtes-vous sûr de vouloir rejeter le litige ${modalState.selectedDispute?.id} ?`}
        type="reject"
        confirmText="Confirmer le rejet"
        cancelText="Annuler"
        showComment={true}
        commentLabel="Raison du rejet"
        commentPlaceholder="Indiquer la raison du rejet..."
        requireComment={true}
        loading={modalState.loading}
      />

      <ConfirmModal
        isOpen={modalState.showDelete}
        onClose={() => setModalState(prev => ({ ...prev, showDelete: false }))}
        onConfirm={() => handleDelete(modalState.selectedDispute?.id)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le litige ${modalState.selectedDispute?.id} ?`}
        type="delete"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        destructive={true}
        loading={modalState.loading}
      />

      {/* Modal pour les détails */}
      <DisputeDetailsModal
        dispute={modalState.selectedDispute}
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        onResolve={() => setModalState(prev => ({ ...prev, showDetails: false, showResolve: true }))}
        onReject={() => setModalState(prev => ({ ...prev, showDetails: false, showReject: true }))}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('disputes.title', 'Gestion des litiges')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{t('disputes.subtitle', 'Résolvez les problèmes signalés par les utilisateurs')}</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {selectedDisputes.length > 0 && (
            <Button
              variant="primary"
              icon={Check}
              onClick={handleBulkResolve}
              loading={modalState.loading}
              className="flex-1 md:flex-none"
            >
              <span className="hidden md:inline">Résoudre ({selectedDisputes.length})</span>
              <span className="md:hidden">({selectedDisputes.length})</span>
            </Button>
          )}

          {/* Utilisation du composant ExportDropdown */}
          <ExportDropdown
            data={disputes}

            columns={exportColumns}
            fileName="litiges"
            title="Export des litiges"
            orientation="landscape"
            showToast={showToast}
            className="flex-1 md:flex-none"
          />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Filtres et Recherche */}
      <DisputesFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
        typeFilter={typeFilter}
        onTypeFilterChange={(value) => { setTypeFilter(value); setActiveTab('all'); setCurrentPage(1); }}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(value) => { setPriorityFilter(value); setCurrentPage(1); }}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="min-w-max md:min-w-0">
          <Tabs
            tabs={disputeTabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setTypeFilter('all');
              setCurrentPage(1);
            }}
            className="px-2 md:px-4"
          />
        </div>
      </div>

      {/* Tableau des litiges */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center ">
            <div>
              <CardTitle>{t('nav.litiges', 'Litiges')} ({totalItems})</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedDisputes.length > 0 && `${selectedDisputes.length} ${t('common.selected', 'sélectionné(s)')} • `}
                {t('common.showing_n_of_m', { n: disputes.length, m: totalItems, defaultValue: `${disputes.length} affiché(s) sur ${totalItems}` })}
              </p>

            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('common.display', 'Afficher :')}</span>
              <select
                className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition w-full md:w-auto"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ResponsiveDisputesTable
            disputes={disputes}
            isMobile={isMobile}
            currentPage={currentPage}
            pageSize={pageSize}
            onViewDetails={handleViewDetails}
            onQuickResolve={handleQuickResolve}
            onQuickReject={handleQuickReject}
            onQuickDelete={handleQuickDelete}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                showInfo={true}
              />
            </div>
          )}


          {disputes.length === 0 && !loading && (

            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun litige trouvé</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1">
        <ChartCard
          title="Types de litiges"
          subtitle="Répartition par catégorie"
          chartConfig={repartitionChartConfig}
          currentPeriod={period}
          onPeriodChange={setPeriod}
          height="350px"
        />


      </div>

    </div>
  );
};

export default Disputes;
