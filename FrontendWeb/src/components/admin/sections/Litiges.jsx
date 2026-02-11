// src/components/sections/Disputes.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { chartConfigs } from '../../../hooks/useCharts';

// Données de démonstration
// TODO API (admin/litiges):
// Remplacer les donnees de demonstration et les actions locales par des appels backend
// Exemple: GET /admin/litiges, PATCH /admin/litiges/:id (statut)
const generateDisputes = (count = 50) => {
  const statuses = ['open', 'in_progress', 'resolved', 'rejected', 'pending'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const types = ['payment', 'driving', 'delay', 'vehicle', 'behavior'];
  const passengers = ['Jean Dupont', 'Marie Koné', 'Paul Martin', 'Sophie Bernard', 'Thomas Leroy'];
  const drivers = ['Kouamé Adou', 'Aïcha Diarra', 'Moussa Camara', 'Fatou Sow', 'Ibrahim Keita'];

  return Array.from({ length: count }, (_, i) => ({
    id: `DIS-${String(i + 1000).padStart(6, '0')}`,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    title: ['Paiement non reçu', 'Conduite dangereuse', 'Retard important', 'Véhicule sale', 'Comportement inapproprié'][i % 5],
    description: `Litige concernant ${['un paiement', 'une conduite', 'un retard', 'un véhicule', 'un comportement'][i % 5]}`,
    type: types[i % types.length],
    amount: Math.floor(Math.random() * 5000) + 1000,
    users: {
      passenger: passengers[i % passengers.length],
      driver: drivers[i % drivers.length],
      passengerId: `PASS-${String(i + 1000).padStart(6, '0')}`,
      driverId: `DRIV-${String(i + 2000).padStart(6, '0')}`
    },
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    resolvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
    agent: Math.random() > 0.7 ? 'Admin' : null,
    tripId: `TRIP-${String(i + 3000).padStart(6, '0')}`,
    location: 'Abidjan, Plateau',
    evidence: Math.random() > 0.5 ? ['photo.jpg', 'message.txt'] : [],
    comments: [
      { id: 1, user: 'Support', message: 'Litige en cours de traitement', date: '2024-01-15 10:30' },
      { id: 2, user: 'Admin', message: 'En attente de validation', date: '2024-01-15 14:45' }
    ]
  }));
};

// Composant pour les actions rapides dans le tableau
const TableActions = ({ dispute, onView, onResolve, onReject, onDelete }) => {
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
                Voir détails
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
                Résoudre
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
                Rejeter
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
  // États
  const [disputes, setDisputes] = useState(() => generateDisputes(50));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDisputes, setSelectedDisputes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isMobile, setIsMobile] = useState(false);

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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Stats calculées
  const stats = useMemo(() => {
    const open = disputes.filter(d => d.status === 'open').length;
    const inProgress = disputes.filter(d => d.status === 'in_progress').length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const rejected = disputes.filter(d => d.status === 'rejected').length;
    const total = disputes.length;

    const resolvedDisputes = disputes.filter(d => d.status === 'resolved' && d.resolvedAt && d.createdAt);
    const avgTime = resolvedDisputes.length > 0
      ? resolvedDisputes.reduce((acc, d) => {
        const timeDiff = new Date(d.resolvedAt) - new Date(d.createdAt);
        return acc + (timeDiff / (1000 * 60 * 60));
      }, 0) / resolvedDisputes.length
      : 0;

    return [
      {
        title: 'Rejeter',
        value: open.toString(),
        icon: AlertTriangle,
        color: 'red',
        trend: open > 5 ? 'up' : 'down',
        percentage: Math.round((open / total) * 100),
        progress: (open / total) * 100
      },
      {
        title: 'En cours',
        value: inProgress.toString(),
        icon: Hourglass,
        color: 'yellow',
        trend: inProgress > 3 ? 'up' : 'stable',
        percentage: Math.round((inProgress / total) * 100),
        progress: (inProgress / total) * 100
      },
      {
        title: 'Résolus',
        value: resolved.toString(),
        icon: CheckCircle,
        color: 'green',
        trend: resolved > 20 ? 'up' : 'stable',
        percentage: Math.round((resolved / total) * 100),
        progress: (resolved / total) * 100
      },
    ];
  }, [disputes]);

  // Filtrage des litiges
  const filteredDisputes = useMemo(() => {
    return disputes.filter(dispute => {
      const matchesSearch =
        search === '' ||
        dispute.id.toLowerCase().includes(search.toLowerCase()) ||
        dispute.title.toLowerCase().includes(search.toLowerCase()) ||
        dispute.description.toLowerCase().includes(search.toLowerCase()) ||
        dispute.users.passenger.toLowerCase().includes(search.toLowerCase()) ||
        dispute.users.driver.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
      const matchesType = typeFilter === 'all' || dispute.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
      const matchesTab = activeTab === 'all' || dispute.type === activeTab;

      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesTab;
    });
  }, [disputes, search, statusFilter, typeFilter, priorityFilter, activeTab]);

  // Pagination
  const paginatedDisputes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredDisputes.slice(startIndex, endIndex);
  }, [filteredDisputes, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDisputes.length / pageSize);

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
  const handleResolve = (disputeId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setDisputes(prev => prev.map(dispute =>
        dispute.id === disputeId
          ? { ...dispute, status: 'resolved', resolvedAt: new Date(), agent: 'Admin' }
          : dispute
      ));

      setModalState(prev => ({ ...prev, loading: false, showResolve: false }));
      showToast('Litige résolu', `Le litige ${disputeId} a été marqué comme résolu`, 'success');
    }, 1000);
  };

  const handleReject = (disputeId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setDisputes(prev => prev.map(dispute =>
        dispute.id === disputeId
          ? { ...dispute, status: 'rejected', resolvedAt: new Date(), agent: 'Admin' }
          : dispute
      ));

      setModalState(prev => ({ ...prev, loading: false, showReject: false }));
      showToast('Litige rejeté', `Le litige ${disputeId} a été rejeté`, 'error');
    }, 1000);
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
      setSelectedDisputes(paginatedDisputes.map(d => d.id));
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

  const handleViewDetails = (dispute) => {
    setModalState(prev => ({
      ...prev,
      showDetails: true,
      selectedDispute: dispute
    }));
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
    { id: 'all', label: 'Tous', icon: AlertTriangle },
    { id: 'payment', label: 'Paiements', icon: DollarSign },
    { id: 'driving', label: 'Conduite', icon: Car },
    { id: 'delay', label: 'Retards', icon: Clock },
    { id: 'vehicle', label: 'Véhicules', icon: Car },
  ];

  // Helper pour afficher le statut
  const renderStatus = (status) => {
    const config = {
      open: { label: 'Ouvert', variant: 'success', icon: AlertTriangle },
      in_progress: { label: 'En cours', variant: 'secondary', icon: Hourglass },
      resolved: { label: 'Résolu', variant: 'success', icon: CheckCircle },
      rejected: { label: 'Rejeté', variant: 'danger', icon: XCircle },
      pending: { label: 'En attente', variant: 'secondary', icon: Clock }
    };

    const { label, icon: Icon, color } = config[status] || config.pending;
    return (
      <Badge className={`text-${color}-800 bg-${color}-100`}>
        <Icon className="w-3 h-3 mr-1" />
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
          {paginatedDisputes.map((dispute) => (
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
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-400"
              checked={selectedDisputes.length === paginatedDisputes.length && paginatedDisputes.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>,
          'ID Litige',
          'Utilisateurs',
          'Type',
          'Statut',
          'Actions'
        ]}
      >
        {paginatedDisputes.map((dispute) => (
          <TableRow key={dispute.id}>
            <TableCell>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-400"
                checked={selectedDisputes.includes(dispute.id)}
                onChange={(e) => handleSelectDispute(dispute.id, e.target.checked)}
              />
            </TableCell>
            <TableCell>
              <div className="font-medium text-gray-800 dark:text-gray-100">{dispute.id}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {dispute.date}
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
                {dispute.evidence.map((file, index) => (
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
              {dispute.comments.map((comment) => (
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestion des litiges</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Résolvez les problèmes signalés par les utilisateurs</p>
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
            data={filteredDisputes}
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
              placeholder="Rechercher un litige..."
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
            <option value="all">Statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
            <option value="pending">En attente</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Types</option>
            <option value="payment">Paiement</option>
            <option value="driving">Conduite</option>
            <option value="delay">Retard</option>
            <option value="vehicle">Véhicule</option>
            <option value="behavior">Comportement</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="critical">Critique</option>
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
              <CardTitle>Litiges ({filteredDisputes.length})</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedDisputes.length > 0 && `${selectedDisputes.length} sélectionné(s) • `}
                {paginatedDisputes.length} affiché(s) sur {filteredDisputes.length}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Afficher :</span>
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
          {filteredDisputes.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={filteredDisputes.length}
                showInfo={true}
              />
            </div>
          )}

          {paginatedDisputes.length === 0 && (
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
          chartConfig={chartConfigs.revenueDistribution}
          height="300px"
        />
      </div>
    </div>
  );
};

export default Disputes;
