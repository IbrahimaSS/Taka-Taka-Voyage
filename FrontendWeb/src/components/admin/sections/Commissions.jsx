// src/components/sections/Commissions.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, CheckCircle, Clock, Percent,
  HandCoins, ChartPie, UserCheck, DollarSign, Eye,
  TrendingUp, Calendar, Sliders, Wallet, Plus,
  ChevronDown, MoreVertical, Trash2, Edit3, FileText,
  FileSpreadsheet, FileDown, RefreshCw, ChevronRight,
  XCircle, AlertCircle, BarChart3, Users, Target, CreditCard,
  Mail, Phone, MapPin, Car, User, File, MessageSquare, Shield, X
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
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
import { color } from 'chart.js/helpers';

// Données de démonstration
const generatePayments = (count = 100) => {
  const statuses = ['pending', 'paid', 'failed', 'processing'];
  const services = ['moto_taxi', 'taxi_shared', 'private_car', 'delivery'];
  const drivers = [
    { name: 'Kouamé Adou', email: 'kouame.adou@example.com', phone: '+224 623 45 67 89', location: 'Abidjan, Plateau' },
    { name: 'Aïcha Diarra', email: 'aicha.diarra@example.com', phone: '+224 624 56 78 90', location: 'Abidjan, Cocody' },
    { name: 'Mohamed Sylla', email: 'mohamed.sylla@example.com', phone: '+224 625 67 89 01', location: 'Abidjan, Yopougon' },
    { name: 'Fatoumata Bamba', email: 'fatoumata.bamba@example.com', phone: '+224 626 78 90 12', location: 'Abidjan, Marcory' },
    { name: 'Ibrahim Keita', email: 'ibrahim.keita@example.com', phone: '+224 627 89 01 23', location: 'Abidjan, Treichville' },
    { name: 'Sophie Traoré', email: 'sophie.traore@example.com', phone: '+224 628 90 12 34', location: 'Abidjan, Koumassi' }
  ];
  const methods = ['orange_money', 'mtn_money', 'bank_transfer', 'cash'];

  return Array.from({ length: count }, (_, i) => {
    const driver = drivers[i % drivers.length];
    const service = services[i % services.length];
    const trips = Math.floor(Math.random() * 50) + 20;
    const revenue = Math.floor(Math.random() * 1000000) + 200000;
    const commissionRate = Math.floor(Math.random() * 10) + 10;
    const commission = Math.round((revenue * commissionRate) / 100);
    const payable = revenue - commission;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `PAY-${String(i + 1000).padStart(6, '0')}`,
      driver: driver.name,
      driverId: `DRV-${String(i + 2000).padStart(6, '0')}`,
      email: driver.email,
      phone: driver.phone,
      location: driver.location,
      service,
      trips,
      revenue,
      commissionRate,
      commission,
      payable,
      status,
      paymentDate: status === 'paid' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') : null,
      dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      account: `+224 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      bank: Math.random() > 0.5 ? 'Bank of Africa' : null,
      accountNumber: Math.random() > 0.5 ? `CI${Math.floor(Math.random() * 1000000000000)}` : null,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      processedBy: Math.random() > 0.7 ? 'Admin' : null,
      notes: [
        { id: 1, user: 'Système', message: 'Paiement généré automatiquement', date: '2024-01-15 10:30' },
        { id: 2, user: 'Support', message: 'Vérification des trajets effectuée', date: '2024-01-15 14:45' }
      ]
    };
  });
};

// Composant pour les actions rapides
const PaymentActions = ({ payment, onView, onProcess, onEdit, }) => {
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
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition"
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
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50"
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onView(payment);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Voir détails
              </button>
              {payment.status === 'pending' && (
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    onProcess(payment);
                    setShowActions(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Traiter le paiement
                </button>
              )}
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onEdit(payment);
                  setShowActions(false);
                }}
              >
                <Edit3 className="w-4 h-4 mr-2 text-yellow-500" />
                Modifier
              </button>
              <div className="border-t border-gray-200 dark:border-gray-900 my-1"></div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// TODO API (admin/commissions):
// Remplacer les donnees simulees par des appels backend
// Exemple: GET /admin/commissions, GET /admin/commissions/summary
const Commissions = () => {
  // États principaux
  const [payments, setPayments] = useState(() => generatePayments(100));
  const [commissionRate, setCommissionRate] = useState(15);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isMobile, setIsMobile] = useState(false);

  // États pour les modales
  const [modalState, setModalState] = useState({
    showProcess: false,
    showConfig: false,
    showDetails: false,
    showEdit: false,
    showAddRule: false,
    selectedPayment: null,
    loading: false
  });

  // États pour l'édition
  const [editForm, setEditForm] = useState({
    trips: 0,
    commissionRate: 0,
    paymentMethod: 'orange_money',
    account: '',
    notes: ''
  });

  // Détection de la taille de l'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialiser le formulaire d'édition quand un paiement est sélectionné
  useEffect(() => {
    if (modalState.selectedPayment && modalState.showEdit) {
      const payment = modalState.selectedPayment;
      setEditForm({
        trips: payment.trips,
        commissionRate: payment.commissionRate,
        paymentMethod: payment.paymentMethod,
        account: payment.account,
        notes: ''
      });
    }
  }, [modalState.selectedPayment, modalState.showEdit]);

  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: 'ID', accessor: 'id' },
    { header: 'Chauffeur', accessor: 'driver' },
    { header: 'ID Chauffeur', accessor: 'driverId' },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'phone' },
    { header: 'Localisation', accessor: 'location' },
    {
      header: 'Service', accessor: 'service', formatter: (value) => {
        const serviceLabels = {
          moto_taxi: 'Moto-taxi',
          taxi_shared: 'Taxi partagé',
          private_car: 'Voiture privée',
          delivery: 'Livraison'
        };
        return serviceLabels[value] || value;
      }
    },
    { header: 'Trajets', accessor: 'trips' },
    { header: 'Revenus (GNF)', accessor: 'revenue', formatter: (value) => value.toLocaleString('fr-FR') },
    { header: 'Taux Commission (%)', accessor: 'commissionRate' },
    { header: 'Commission (GNF)', accessor: 'commission', formatter: (value) => value.toLocaleString('fr-FR') },
    { header: 'À verser (GNF)', accessor: 'payable', formatter: (value) => value.toLocaleString('fr-FR') },
    {
      header: 'Statut', accessor: 'status', formatter: (value) => {
        const statusLabels = {
          pending: 'À payer',
          paid: 'Payé',
          failed: 'Échoué',
          processing: 'En cours'
        };
        return statusLabels[value] || value;
      }
    },
    { header: 'Date Paiement', accessor: 'paymentDate', formatter: (value) => value || 'Non payé' },
    { header: 'Date Échéance', accessor: 'dueDate' },
    {
      header: 'Méthode Paiement', accessor: 'paymentMethod', formatter: (value) => {
        const methodLabels = {
          orange_money: 'Orange Money',
          mtn_money: 'MTN Money',
          bank_transfer: 'Virement bancaire',
          cash: 'Espèces'
        };
        return methodLabels[value] || value;
      }
    },
    { header: 'Compte', accessor: 'account' },
    { header: 'Banque', accessor: 'bank', formatter: (value) => value || 'N/A' },
    { header: 'Numéro Compte', accessor: 'accountNumber', formatter: (value) => value || 'N/A' },
    { header: 'Date Création', accessor: 'createdAt' },
    { header: 'Traité par', accessor: 'processedBy', formatter: (value) => value || 'N/A' }
  ], []);

  // Stats calculées
  const stats = useMemo(() => {
    const pending = payments.filter(p => p.status === 'pending').length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const totalCommission = payments.reduce((acc, p) => acc + p.commission, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((acc, p) => acc + p.payable, 0);
    const avgRate = payments.length > 0
      ? payments.reduce((acc, p) => acc + p.commissionRate, 0) / payments.length
      : 0;
    const driversPaid = new Set(payments.filter(p => p.status === 'paid').map(p => p.driverId)).size;

    return [
      {
        title: 'Toutes les commissions',
        value: `${(totalCommission / 1000).toFixed(0)}K`,
        icon: Percent,
        color: 'green',
        trend: 'up',
        percentage: 15,
        progress: 75,
        subtitle: 'Total des commissions'
      },
      {
        title: 'À verser',
        value: `${(pendingAmount / 1000).toFixed(0)}K`,
        icon: HandCoins,
        color: 'yellow',
        trend: 'stable',
        percentage: 0,
        progress: (pendingAmount / totalCommission) * 100,
        subtitle: 'Montant total en attente'
      },
      {
        title: 'Chauffeurs payés',
        value: driversPaid.toString(),
        icon: UserCheck,
        color: 'purple',
        trend: 'up',
        percentage: 8,
        progress: (driversPaid / payments.length) * 100,
        subtitle: 'Nombre de chauffeurs payés'
      }
    ];
  }, [payments]);

  // Filtrage des paiements
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch =
        search === '' ||
        payment.driver.toLowerCase().includes(search.toLowerCase()) ||
        payment.driverId.toLowerCase().includes(search.toLowerCase()) ||
        payment.account.includes(search);

      const matchesService = serviceFilter === 'all' || payment.service === serviceFilter;
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
      const matchesTab = activeTab === 'all' || payment.status === activeTab;

      return matchesSearch && matchesService && matchesStatus && matchesMethod && matchesTab;
    });
  }, [payments, search, serviceFilter, statusFilter, methodFilter, activeTab]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  // Handlers
  const handleProcessPayment = (paymentId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? {
            ...payment,
            status: 'paid',
            paymentDate: new Date().toLocaleDateString('fr-FR'),
            processedBy: 'Admin',
            notes: [...payment.notes, {
              id: payment.notes.length + 1,
              user: 'Admin',
              message: comment || 'Paiement traité',
              date: new Date().toLocaleString('fr-FR')
            }]
          }
          : payment
      ));

      setModalState(prev => ({ ...prev, loading: false, showProcess: false }));
      showToast('Paiement traité', `Le paiement ${paymentId} a été marqué comme payé`, 'success');
    }, 1000);
  };

  const handleBulkProcess = () => {
    if (selectedPayments.length === 0) {
      showToast('Aucun paiement sélectionné', 'Veuillez sélectionner au moins un paiement', 'warning');
      return;
    }

    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setPayments(prev => prev.map(payment =>
        selectedPayments.includes(payment.id)
          ? {
            ...payment,
            status: 'paid',
            paymentDate: new Date().toLocaleDateString('fr-FR'),
            processedBy: 'Admin',
            notes: [...payment.notes, {
              id: payment.notes.length + 1,
              user: 'Admin',
              message: 'Paiement traité en masse',
              date: new Date().toLocaleString('fr-FR')
            }]
          }
          : payment
      ));

      setSelectedPayments([]);
      setModalState(prev => ({ ...prev, loading: false }));
      showToast('Paiements traités', `${selectedPayments.length} paiements ont été traités`, 'success');
    }, 1500);
  };

  const handleEditPayment = () => {
    if (!modalState.selectedPayment) return;

    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      const updatedPayment = {
        ...modalState.selectedPayment,
        trips: editForm.trips,
        commissionRate: editForm.commissionRate,
        paymentMethod: editForm.paymentMethod,
        account: editForm.account,
        commission: Math.round((modalState.selectedPayment.revenue * editForm.commissionRate) / 100),
        payable: modalState.selectedPayment.revenue - Math.round((modalState.selectedPayment.revenue * editForm.commissionRate) / 100),
        notes: [
          ...modalState.selectedPayment.notes,
          {
            id: modalState.selectedPayment.notes.length + 1,
            user: 'Admin',
            message: editForm.notes || 'Informations modifiées',
            date: new Date().toLocaleString('fr-FR')
          }
        ]
      };

      setPayments(prev => prev.map(payment =>
        payment.id === updatedPayment.id ? updatedPayment : payment
      ));

      setModalState(prev => ({ ...prev, loading: false, showEdit: false }));
      showToast('Paiement modifié', `Le paiement ${updatedPayment.id} a été mis à jour`, 'success');
    }, 1000);
  };

  const handleSelectPayment = (paymentId, checked) => {
    setSelectedPayments(prev =>
      checked
        ? [...prev, paymentId]
        : prev.filter(id => id !== paymentId)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPayments(paginatedPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSaveConfig = () => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setModalState(prev => ({ ...prev, loading: false, showConfig: false }));
      showToast('Configuration sauvegardée', 'Les paramètres de commission ont été mis à jour', 'success');
    }, 1000);
  };

  const handleViewDetails = (payment) => {
    setModalState(prev => ({
      ...prev,
      showDetails: true,
      selectedPayment: payment
    }));
  };

  const handleOpenEdit = (payment) => {
    setModalState(prev => ({
      ...prev,
      showEdit: true,
      selectedPayment: payment,
      showDetails: false
    }));
  };

  // Configuration des tabs
  const commissionTabs = [
    { id: 'all', label: 'Tous', icon: ChartPie },
    { id: 'pending', label: 'À payer', icon: Clock },
    { id: 'paid', label: 'Payés', icon: CheckCircle },
    { id: 'failed', label: 'Échoués', icon: XCircle }
  ];

  // Helper pour afficher le statut
  const renderStatus = (status) => {
    const config = {
      pending: { label: 'À payer', variant: 'warning', icon: Clock },
      paid: { label: 'Payé', variant: 'success', icon: CheckCircle },
      failed: { label: 'Échoué', variant: 'danger', icon: XCircle },
      processing: { label: 'En cours', variant: 'secondary', icon: AlertCircle }
    };

    const { label, variant, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={`text-${color} bg-${color} dark:bg-gray-900/40`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Helper pour afficher le service
  const renderService = (service) => {
    const config = {
      moto_taxi: { label: 'Moto-taxi', color: 'green', icon: Car },
      taxi_shared: { label: 'Taxi partagé', color: 'blue', icon: Car },
      private_car: { label: 'Voiture privée', color: 'purple', icon: Car },
      delivery: { label: 'Livraison', color: 'orange', icon: Car }
    };

    const { label, color, icon: Icon } = config[service] || config.moto_taxi;
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    const colorClass = colorMap[color] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';

    return (
      <Badge className={`text-${color} bg-${color}-200 dark:bg-gray-900/40 `}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Helper pour afficher la méthode de paiement
  const renderPaymentMethod = (method) => {
    const config = {
      orange_money: { label: 'Orange Money', color: 'orange', icon: CreditCard },
      mtn_money: { label: 'MTN Money', color: 'yellow', icon: CreditCard },
      bank_transfer: { label: 'Virement bancaire', color: 'blue', icon: CreditCard },
      cash: { label: 'Espèces', color: 'gray', icon: DollarSign }
    };

    const { label, color, icon: Icon } = config[method] || config.orange_money;
    const colorMap = {
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
    };
    const colorClass = colorMap[color] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';

    return (
      <Badge variant="secondary" className={`${colorClass}  `}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Fonction pour rendre le tableau responsive
  const renderResponsiveTable = () => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {paginatedPayments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{payment.driver}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{payment.driverId}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatus(payment.status)}
                  {renderService(payment.service)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trajets</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{payment.trips}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Taux</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{payment.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Revenus</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{(payment.revenue / 1000).toFixed(0)}K GNF</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">À verser</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{(payment.payable / 1000).toFixed(0)}K GNF</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-900">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Échéance: {payment.dueDate}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Eye}
                    onClick={() => handleViewDetails(payment)}
                    className="p-1"
                  />
                  {payment.status === 'pending' && (
                    <Button
                      variant="success"
                      size="small"
                      icon={CheckCircle}
                      onClick={() => setModalState(prev => ({
                        ...prev,
                        showProcess: true,
                        selectedPayment: payment
                      }))}
                      className="p-1"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[760px]"
          headers={[
            <span key="h-driver">Chauffeur</span>,
            <span key="h-service" className="hidden sm:inline">Service</span>,
            <span key="h-rev">Revenus</span>,
            <span key="h-comm" className="hidden md:inline">Commission</span>,
            <span key="h-payable">Àverser</span>,
            <span key="h-status" className="hidden sm:inline">Statut</span>,
            <span key="h-actions" className="text-right">Actions</span>
          ]}
        >
          {paginatedPayments.map((payment) => (
            <TableRow key={payment.id}>

              <TableCell>
                <div className="flex items-center">

                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.driver}</p>

                    <p className="text-xs text-gray-400 dark:text-gray-500">Échéance: {payment.dueDate}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden  sm:table-cell">
                {renderService(payment.service)}
              </TableCell>

              <TableCell>
                <div className="font-bold text-gray-800 dark:text-gray-100">{(payment.revenue / 1000).toFixed(0)}K GNF</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="font-bold text-gray-800 dark:text-gray-100">{(payment.commission / 1000).toFixed(0)}K GNF</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{payment.commissionRate}%</div>
              </TableCell>
              <TableCell>
                <div className="font-bold text-gray-800 dark:text-gray-100">{(payment.payable / 1000).toFixed(0)}K GNF</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {renderStatus(payment.status)}
              </TableCell>

              <TableCell className="w-24 text-right">
                <PaymentActions
                  payment={payment}
                  onView={handleViewDetails}
                  onProcess={(p) => setModalState(prev => ({ ...prev, showProcess: true, selectedPayment: p }))}
                  onEdit={handleOpenEdit}
                />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    );
  };

  // Modal de détails du paiement
  const PaymentDetailsModal = () => {
    if (!modalState.selectedPayment) return null;
    const payment = modalState.selectedPayment;

    const getServiceLabel = (service) => {
      const labels = {
        moto_taxi: 'Moto-taxi',
        taxi_shared: 'Taxi partagé',
        private_car: 'Voiture privée',
        delivery: 'Livraison'
      };
      return labels[service] || service;
    };

    return (
      <Modal
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        title={`Détails du paiement - ${payment.id}`}
        size="lg"
      >
        <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
          {/* En-tête avec statut et infos */}
          <div className="flex flex-wrap gap-3 mb-6">
            {renderStatus(payment.status)}
            {renderService(payment.service)}
            {renderPaymentMethod(payment.paymentMethod)}
            <Badge variant="secondary">
              <Calendar className="w-3 h-3 mr-1" />
              Échéance: {payment.dueDate}
            </Badge>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations du chauffeur */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Informations du chauffeur</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">
                        {payment.driver.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{payment.driver}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{payment.driverId}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm">{payment.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm">{payment.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm">{payment.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de paiement */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-16 mb-3">Informations de paiement</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Compte:</span>
                    <span className="font-medium">{payment.account}</span>
                  </div>
                  {payment.bank && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Banque:</span>
                      <span className="font-medium">{payment.bank}</span>
                    </div>
                  )}
                  {payment.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Numéro de compte:</span>
                      <span className="font-medium">{payment.accountNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Détails financiers */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Détails financiers</h3>
                <div className="bg-slate-200/30 dark:bg-gray-800 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trajets</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{payment.trips}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Taux</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{payment.commissionRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Revenus bruts</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {(payment.revenue / 1000).toFixed(0)}K GNF
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Commission</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {(payment.commission / 1000).toFixed(0)}K GNF
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-200">À verser:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {(payment.payable / 1000).toFixed(0)}K GNF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Métadonnées</h3>
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Date de création:</span>
                    <span className="font-medium">{payment.createdAt}</span>
                  </div>
                  {payment.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Date de paiement:</span>
                      <span className="font-medium">{payment.paymentDate}</span>
                    </div>
                  )}
                  {payment.processedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Traité par:</span>
                      <span className="font-medium">{payment.processedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              icon={X}
              onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}
              className="sm:w-auto"
            >
              Fermer
            </Button>

            <Button
              variant="primary"
              icon={Edit3}
              onClick={() => {
                setModalState(prev => ({ ...prev, showDetails: false, showEdit: true }));
              }}
              className="sm:w-auto"
            >
              Modifier
            </Button>
            {payment.status === 'pending' && (
              <Button
                variant="perso"
                icon={CheckCircle}
                onClick={() => {
                  setModalState(prev => ({ ...prev, showDetails: false, showProcess: true }));
                }}
                className="sm:w-auto"
              >
                Traiter le paiement
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // Modal d'édition du paiement
  const EditPaymentModal = () => {
    if (!modalState.selectedPayment) return null;
    const payment = modalState.selectedPayment;

    const calculateCommission = () => {
      const commission = Math.round((payment.revenue * editForm.commissionRate) / 100);
      const payable = payment.revenue - commission;
      return { commission, payable };
    };

    const { commission, payable } = calculateCommission();

    return (
      <Modal
        isOpen={modalState.showEdit}
        onClose={() => setModalState(prev => ({ ...prev, showEdit: false }))}
        title={`Modifier le paiement - ${payment.id}`}
        size="md"
      >
        <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
          {/* Informations de base */}
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-700 flex items-center justify-center mr-3">
                <span className="text-white font-bold">
                  {payment.driver.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{payment.driver}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{payment.driverId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
                <p className="font-medium">{getServiceLabel(payment.service)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenus bruts</p>
                <p className="font-medium">{(payment.revenue / 1000).toFixed(0)}K GNF</p>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nombre de trajets
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={editForm.trips}
                  onChange={(e) => setEditForm(prev => ({ ...prev, trips: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Taux de commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Méthode de paiement
              </label>
              <select
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="orange_money">Orange Money</option>
                <option value="mtn_money">MTN Mobile Money</option>
                <option value="cash">Espèces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Numéro de compte / téléphone
              </label>
              <input
                type="text"
                value={editForm.account}
                onChange={(e) => setEditForm(prev => ({ ...prev, account: e.target.value }))}
                placeholder="+224 6XX XX XX XX"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajouter une note sur les modifications..."
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Récapitulatif</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Commission recalculée:</span>
                <span className="font-bold text-red-600">{(commission / 1000).toFixed(0)}K GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">À verser recalculé:</span>
                <span className="font-bold text-green-600">{(payable / 1000).toFixed(0)}K GNF</span>
              </div>
              <div className="pt-2 border-t border-gray-300 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Différence:</span>
                  <span className={`font-bold ${payable > payment.payable ? 'text-green-600' : 'text-red-600'}`}>
                    {payable > payment.payable ? '+' : ''}{((payable - payment.payable) / 1000).toFixed(1)}K GNF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              onClick={() => setModalState(prev => ({ ...prev, showEdit: false }))}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleEditPayment}
              loading={modalState.loading}
            >
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Fonction utilitaire pour obtenir le libellé du service
  const getServiceLabel = (service) => {
    const labels = {
      moto_taxi: 'Moto-taxi',
      taxi_shared: 'Taxi partagé',
      private_car: 'Voiture privée',
      delivery: 'Livraison'
    };
    return labels[service] || service;
  };

  // hauteur du graphique responsive
  const chartHeight = isMobile ? '220px' : '300px';

  return (
    <div className="space-y-4 md:space-y-6 px-2">
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
        isOpen={modalState.showProcess}
        onClose={() => setModalState(prev => ({ ...prev, showProcess: false }))}
        onConfirm={(comment) => handleProcessPayment(modalState.selectedPayment?.id, comment)}
        title="Confirmer le traitement"
        message={`Êtes-vous sûr de vouloir traiter le paiement ${modalState.selectedPayment?.id} ?`}
        type="validate"
        confirmText="Confirmer le paiement"
        cancelText="Annuler"
        showComment={true}
        commentLabel="Commentaire de traitement"
        commentPlaceholder="Ajouter un commentaire..."
        requireComment={false}
        loading={modalState.loading}
      />



      {/* Modal de détails */}
      <PaymentDetailsModal />

      {/* Modal d'édition */}
      <EditPaymentModal />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestion des commissions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Suivez et gérez les commissions de la plateforme</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {selectedPayments.length > 0 && (
            <Button
              variant="primary"
              icon={CheckCircle}
              onClick={handleBulkProcess}
              loading={modalState.loading}
              className="flex-1 md:flex-none"
            >
              <span className="hidden md:inline">Traiter ({selectedPayments.length})</span>
              <span className="md:hidden">({selectedPayments.length})</span>
            </Button>
          )}

          {/* Utilisation du composant ExportDropdown */}
          <ExportDropdown
            data={filteredPayments}
            columns={exportColumns}
            fileName="commissions"
            title="Export des commissions"
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

      {/* Commission Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Évolution des commissions"
            subtitle="Sur les 12 derniers mois"
            chartConfig={{
              type: 'line',
              data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                  label: 'Commissions (GNF)',
                  data: [480000, 520000, 450000, 580000, 620000, 550000, 680000, 720000, 650000, 780000, 820000, 750000],
                  borderColor: '#8B5CF6',
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => `${(value / 1000).toFixed(0)}K`
                    }
                  }
                }
              }
            }}
            height={chartHeight}
            actions={
              <div className="flex space-x-2">
                <Button variant="ghost" size="small" active>
                  12 mois
                </Button>
                <Button variant="ghost" size="small">
                  6 mois
                </Button>
              </div>
            }
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle  >Répartition par service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Moto-taxi', percentage: '35%', amount: '220K GNF', color: 'green' },
              { label: 'Taxi partagé', percentage: '45%', amount: '283K GNF', color: 'blue' },
              { label: 'Voiture privée', percentage: '20%', amount: '127K GNF', color: 'purple' }
            ].map((service, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{service.label}</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{service.percentage}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${service.color === 'green' ? 'bg-green-500' : service.color === 'blue' ? 'bg-blue-500' : service.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'}`}
                    style={{ width: service.percentage }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{service.amount}</p>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Commission moyenne par trajet</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">257 GNF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card hoverable={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un chauffeur, ID ou compte..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm md:text-base"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tous les services</option>
            <option value="moto_taxi">Moto-taxi</option>
            <option value="taxi_shared">Taxi partagé</option>
            <option value="private_car">Voiture privée</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">À payer</option>
            <option value="paid">Payé</option>
            <option value="failed">Échoué</option>
            <option value="processing">En cours</option>
          </select>

          <select
            className="border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition text-sm md:text-base"
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Toutes les méthodes</option>
            <option value="orange_money">Orange Money</option>
            <option value="mtn_money">MTN Money</option>
            <option value="cash">Espèces</option>
          </select>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="min-w-max md:min-w-0">
          <Tabs
            tabs={commissionTabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className="px-2 md:px-4"
          />
        </div>
      </div>

      {/* Tableau des paiements */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>
                {activeTab === 'pending' ? 'Paiements en attente' :
                  activeTab === 'paid' ? 'Paiements payés' :
                    activeTab === 'failed' ? 'Paiements échoués' : 'Tous les paiements'}
                <span className="ml-2 text-gray-500 dark:text-gray-400">({filteredPayments.length})</span>
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedPayments.length > 0 && `${selectedPayments.length} sélectionné(s) • `}
                {paginatedPayments.length} affiché(s) sur {filteredPayments.length}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Afficher :</span>
              <select
                className="border border-gray-200 dark:bg-gray-900/50 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition w-full md:w-auto"
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
          {filteredPayments.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={filteredPayments.length}
                showInfo={true}
              />
            </div>
          )}

          {paginatedPayments.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun paiement trouvé</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Commissions;
