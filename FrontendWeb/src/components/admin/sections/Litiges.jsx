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
import Toast from '../ui/Toast';
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';
import { apiClient } from '../../../services/apiClient';
import { API_ROUTES } from '../../../services/apiRoutes';
import { useNotificationCenter, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../../../context/NotificationContext';


// Données de démonstration
// TODO API (admin/litiges):
// Remplacer les donnees de demonstration et les actions locales par des appels backend
// Exemple: GET /admin/litiges, PATCH /admin/litiges/:id (statut)


// Composant pour les actions rapides dans le tableau
const TableActions = ({ dispute, onView, onResolve, onReject, onDelete }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50"
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onView(dispute);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                {t('trips.view_details', 'Voir détails')}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onResolve(dispute);
                  setShowActions(false);
                }}
                disabled={dispute.status === 'resolved'}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('disputes.resolve', 'Résoudre')}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onReject(dispute);
                  setShowActions(false);
                }}
                disabled={dispute.status === 'rejected'}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                {t('disputes.reject', 'Rejeter')}
              </button>
              <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Disputes = () => {
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
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
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
          params: { page: currentPage, limit: pageSize, search, status: statusFilter, type: typeFilter }
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
          amount: 0, // Le backend listeLitiges ne renvoie pas encore amount
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
    { header: 'ID', accessor: 'id' },
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
    { header: 'Montant', accessor: 'amount', formatter: (value) => `${value.toLocaleString('fr-FR')} GNF` },
    { header: 'Passager', accessor: 'users.passenger' },
    { header: 'ID Passager', accessor: 'users.passengerId' },
    { header: 'Chauffeur', accessor: 'users.driver' },
    { header: 'ID Chauffeur', accessor: 'users.driverId' },
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
    },
    { header: 'Agent', accessor: 'agent', formatter: (value) => value || 'Non assigné' },
    { header: 'ID Trajet', accessor: 'tripId' },
    { header: 'Lieu', accessor: 'location' }
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

  const handleSelectDispute = (disputeId, checked) => {
    setSelectedDisputes(prev =>
      checked
        ? [...prev, disputeId]
        : prev.filter(id => id !== disputeId)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDisputes(disputes.map(d => d.id));
    } else {
      setSelectedDisputes([]);
    }
  };


  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
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
    { id: 'payment', label: t('nav.paiements', 'Paiements'), icon: DollarSign },
    { id: 'driving', label: t('disputes.driving', 'Conduite'), icon: Car },
    { id: 'delay', label: t('disputes.delay', 'Retards'), icon: Clock },
    { id: 'vehicle', label: t('drivers.vehicle', 'Véhicules'), icon: Car },
  ];

  // Helper pour afficher le statut
  const renderStatus = (status) => {
    const config = {
      open: { label: t('disputes.status.open', 'Ouvert'), bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-400', icon: AlertTriangle },
      in_progress: { label: t('disputes.in_review', 'En cours'), bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: Hourglass },
      resolved: { label: t('common.resolved', 'Résolu'), bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: CheckCircle },
      rejected: { label: t('common.rejected', 'Rejeté'), bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: XCircle },
      pending: { label: t('trips.status.pending', 'En attente'), bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: Clock }
    };

    const { label, icon: Icon, bg, text } = config[status] || config.pending;
    return (
      <Badge className={clsx(bg, text, "border-none shadow-none font-semibold")}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {label}
      </Badge>
    );
  };


  // Helper pour afficher la priorité
  const renderPriority = (priority) => {
    const config = {
      low: { label: 'Basse', variant: 'secondary' },
      medium: { label: 'Moyenne', variant: 'warning' },
      high: { label: 'Haute', variant: 'danger' },
      critical: { label: 'Critique', variant: 'danger' }
    };

    const { label, variant } = config[priority] || config.medium;
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Helper pour afficher le type
  const renderType = (type) => {
    const config = {
      payment: { label: 'Paiement', icon: CreditCard, color: 'blue' },
      driving: { label: 'Conduite', icon: Car, color: 'red' },
      delay: { label: 'Retard', icon: Clock, color: 'yellow' },
      vehicle: { label: 'Véhicule', icon: Car, color: 'green' },
      behavior: { label: 'Comportement', icon: User, color: 'purple' }
    };

    const { label, icon: Icon, color } = config[type] || config.payment;
    return (
      <Badge className='bg-gray-200 dark:bg-gray-800'>
        <Icon className={`w-3 h-3 mr-1 text-${color}-500`} />
        {label}
      </Badge>
    );
  };

  // Fonction pour rendre le tableau responsive
  const renderResponsiveTable = () => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {disputes.map((dispute) => (

            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{dispute.id}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {dispute.date.split(',')[0]}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatus(dispute.status)}
                  {renderPriority(dispute.priority)}
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{dispute.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{dispute.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <User className="text-green-500 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{dispute.users.passenger}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Car className="text-blue-500 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">{dispute.users.driver}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {dispute.amount.toLocaleString('fr-FR')} GNF
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Eye}
                    onClick={() => handleViewDetails(dispute)}
                    className="p-1"
                  />
                  <Button
                    variant="success"
                    size="small"
                    icon={Check}
                    onClick={() => handleQuickResolve(dispute)}
                    disabled={dispute.status === 'resolved'}
                    className="p-1"
                  />
                  <Button
                    variant="danger"
                    size="small"
                    icon={X}
                    onClick={() => handleQuickReject(dispute)}
                    disabled={dispute.status === 'rejected'}
                    className="p-1"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <Table
        headers={[
          t('disputes.id', 'N° / Date'),
          t('nav.utilisateurs', 'Utilisateurs'),
          t('transactions.details.type', 'Type'),
          t('common.status', 'Statut'),
          t('common.actions', 'Actions')
        ]}
      >
        {disputes.map((dispute, index) => (
          <TableRow key={dispute.id}>
            <TableCell>
              <div className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * pageSize + index + 1}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center whitespace-nowrap">
                <Calendar className="w-2.5 h-2.5 mr-1" />
                {dispute.date.split(' ')[0]}
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <User className="text-green-500 text-xs" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{dispute.users.passenger}</p>

                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Car className="text-blue-500 text-xs" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{dispute.users.driver}</p>

                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {renderType(dispute.type)}
            </TableCell>

            <TableCell>
              {renderStatus(dispute.status)}
            </TableCell>
            <TableCell>
              <TableActions
                dispute={dispute}
                onView={handleViewDetails}
                onResolve={handleQuickResolve}
                onReject={handleQuickReject}
                onDelete={handleQuickDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    );
  };

  // Modal pour les détails du litige
  const DisputeDetailsModal = () => {
    if (!modalState.selectedDispute) return null;

    const dispute = modalState.selectedDispute;

    return (
      <Modal
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        title={`Détails du litige - ${dispute.id}`}
        size="lg"
      >
        <div className="space-y-6 scroll-me-t-2 overflow-auto h-[70vh]">
          {/* En-tête avec statut et priorité */}
          <div className="flex flex-wrap gap-3">
            {renderStatus(dispute.status)}
            {renderPriority(dispute.priority)}
            {renderType(dispute.type)}

          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Informations générales</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Titre</p>
                    <p className="font-medium">{dispute.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Description</p>
                    <p className="text-gray-700 dark:text-gray-200">{dispute.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Date de création</p>
                      <p className="font-medium">{dispute.date}</p>
                    </div>

                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trajet concerné</h3>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <div className="flex items-center justify-center mb-2 gap-10">
                    <div className="flex items-center">
                      <div className='text-xm text-gray-500 dark:text-gray-400'> ID:
                        <p className="font-medium"> {dispute.tripId}</p></div>
                    </div>
                    <div className='text-gray-900 dark:text-gray-100 text-sm font-medium'>Depart <p>Mamou</p></div>
                    <div className='text-gray-900 dark:text-gray-100 text-sm font-medium'>Destination <p>Kankan</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Parties concernées</h3>
                <div className="space-y-3 dark:bg-gray-900/40">
                  <div className="bg-green-50 dark:bg-green-900/40 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-green-500 mr-2" />
                      <span className="font-medium">Passager</span>
                    </div>
                    <p className="text-sm font-medium">{dispute.users.passenger}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dispute.users.passengerId}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Car className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium">Chauffeur</span>
                    </div>
                    <p className="text-sm font-medium">{dispute.users.driver}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dispute.users.driverId}</p>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Preuves */}
          {dispute.evidence && dispute.evidence.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preuves jointes</h3>
              <div className="flex flex-wrap gap-2 dark:bg-gray-900/40">
                {dispute.evidence?.map((file, index) => (
                  <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-900/40 rounded-lg px-3 py-2">
                    <File className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Commentaires */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Historique des commentaires</h3>
            <div className="space-y-3 dark:bg-gray-900/40">
              {dispute.comments?.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{comment.user}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{comment.message}</p>
                </div>
              ))}
            </div>
          </div>


          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}
            >
              Fermer
            </Button>
            <Button
              variant="success"
              icon={Check}
              onClick={() => {
                setModalState(prev => ({ ...prev, showDetails: false, showResolve: true }));
              }}
              disabled={dispute.status === 'resolved'}
            >
              Résoudre
            </Button>
            <Button
              variant="danger"
              icon={X}
              onClick={() => {
                setModalState(prev => ({ ...prev, showDetails: false, showReject: true }));
              }}
              disabled={dispute.status === 'rejected'}
            >
              Rejeter
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

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
      <DisputeDetailsModal />

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
      <Card hoverable={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('disputes.search_placeholder', 'Rechercher un litige...')}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm md:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t('common.status', 'Statuts')}</option>
            <option value="open">{t('disputes.status.open', 'Ouvert')}</option>
            <option value="in_progress">{t('disputes.in_review', 'En cours')}</option>
            <option value="resolved">{t('common.resolved', 'Résolu')}</option>
            <option value="rejected">{t('common.rejected', 'Rejeté')}</option>
            <option value="pending">{t('trips.status.pending', 'En attente')}</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t('common.categories', 'Types')}</option>
            <option value="payment">{t('nav.paiements', 'Paiement')}</option>
            <option value="driving">{t('disputes.driving', 'Conduite')}</option>
            <option value="delay">{t('disputes.delay', 'Retard')}</option>
            <option value="vehicle">{t('drivers.vehicle', 'Véhicule')}</option>
            <option value="behavior">{t('disputes.behavior', 'Comportement')}</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t('disputes.priorities', 'Priorités')}</option>
            <option value="low">{t('disputes.low', 'Basse')}</option>
            <option value="medium">{t('disputes.medium', 'Moyenne')}</option>
            <option value="high">{t('disputes.high', 'Haute')}</option>
            <option value="critical">{t('disputes.critical', 'Critique')}</option>
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="min-w-max md:min-w-0">
          <Tabs
            tabs={disputeTabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
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
          {renderResponsiveTable()}

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
