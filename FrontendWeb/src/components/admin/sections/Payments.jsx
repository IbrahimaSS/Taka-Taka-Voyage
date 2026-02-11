// src/components/sections/Payments.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import ChartCard from '../ui/ChartCard';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import Toast from '../ui/Toast';
import ConfirmModal from '../ui/ConfirmModal';
import {
  DollarSign, Repeat, Hourglass, Percent,
  Download, Smartphone, CreditCard,
  User, Car, CheckCircle, XCircle, Calendar,
  Eye, Filter, TrendingUp, BarChart, PieChart, Search,
  MoreVertical, RefreshCw, FileText,
  FileSpreadsheet, FileDown, AlertCircle, Clock,
  Plus, ChevronDown, ChartLine,
  Activity, Shield, Archive, FileJson,
  CalendarDays, HardDrive, Copy, Share2, Bell,
  Lock, Unlock, Trash2, Edit2, Save, Upload, Folder,
  Settings, HelpCircle, Info, DownloadCloud,
  ExternalLink, Receipt, QrCode, Wallet, Banknote,
  TrendingDown, ShieldCheck, Wifi, Battery,
  SmartphoneCharging, CreditCard as CreditCardIcon,
  ArrowUpRight, ArrowDownRight, WalletCards,
  Smartphone as SmartphoneIcon,
  MessageSquare, Users, MapPin, Star,
  FileType, EyeOff, Database, Network,
  Maximize2, ZoomIn, ZoomOut, RotateCw, Hash,
  Grid, Volume2, Sun, Moon, CloudRain,
  ChevronRight, ChevronLeft, ArrowRight,
  Hand
} from 'lucide-react';
import { color } from 'chart.js/helpers';
import { col } from 'framer-motion/client';

// Données de démonstration enrichies
const generatePayments = (count = 50) => {
  const statuses = ['paid', 'pending', 'failed', 'refunded'];
  const methods = ['cash', 'orange', 'mtn', 'wave', 'card', 'bank'];
  const passengers = ['Jean Dupont', 'Marie Koné', 'Pierre Gbédé', 'Alice Traoré', 'David Koffi', 'Fatou Diarra', 'Mohamed Sylla', 'Aïcha Diop'];
  const drivers = ['Kouamé Adou', 'Yves Traoré', 'Mohamed Sylla', 'Aïcha Diarra', 'Fatou Diop', 'Yves Koffi'];
  const routes = ['Plateau → Marcory', 'Cocody → Yopougon', 'Treichville → Koumassi', 'Abobo → Cocody', 'Marcory → Plateau'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const method = methods[i % methods.length];
    const amount = Math.floor(Math.random() * 5000) + 1000;
    const commission = Math.floor(amount * 0.15);
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const isArchived = i % 10 === 0;

    const getMethodLabel = () => {
      const labels = {
        'cash': 'Espèces',
        'orange': 'Orange Money',
        'mtn': 'MTN Mobile Money',
        'wave': 'Wave',
        'card': 'Carte Bancaire',
        'bank': 'Virement Bancaire'
      };
      return labels[method] || labels.cash;
    };

    return {
      id: `PAY-${String(i + 1000).padStart(6, '0')}`,
      transactionId: `TXN-${String(i + 789000).padStart(6, '0')}`,
      passenger: {
        name: passengers[i % passengers.length],
        phone: `+225 0${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
        email: `${passengers[i % passengers.length].toLowerCase().replace(' ', '.')}@example.com`,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1)
      },
      driver: {
        name: drivers[i % drivers.length],
        phone: `+225 0${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        account: method === 'cash' ? 'N/A' :
          method === 'orange' ? `ORANGE-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` :
            method === 'mtn' ? `MTN-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` :
              method === 'wave' ? `WAVE-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` :
                method === 'card' ? `CARD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` :
                  `BANK-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
      },
      trip: {
        id: `TR-${String(i + 1000).padStart(6, '0')}`,
        route: routes[i % routes.length],
        distance: `${(Math.random() * 20 + 5).toFixed(1)} km`,
        duration: `${Math.floor(Math.random() * 45) + 15} min`,
        date: date.toISOString().split('T')[0]
      },
      amount: `${amount.toLocaleString('fr-FR')} GNF`,
      commission: `${commission.toLocaleString('fr-FR')} GNF`,
      commissionRate: '15%',
      netAmount: `${(amount - commission).toLocaleString('fr-FR')} GNF`,
      method,
      methodLabel: getMethodLabel(),
      status,
      time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      date: date.toLocaleDateString('fr-FR'),
      processedAt: status === 'paid' ? new Date(date.getTime() + Math.random() * 10 * 60000).toLocaleString('fr-FR') : null,
      reference: status === 'failed' ? `ERR-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` :
        status === 'pending' ? `PND-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` :
          `REF-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      fees: {
        platform: `${Math.floor(amount * 0.05).toLocaleString('fr-FR')} GNF`,
        processing: method === 'card' ? `${Math.floor(amount * 0.02).toLocaleString('fr-FR')} GNF` : '0 GNF',
        total: method === 'card' ? `${Math.floor(amount * 0.07).toLocaleString('fr-FR')} GNF` : `${Math.floor(amount * 0.05).toLocaleString('fr-FR')} GNF`
      },
      archived: isArchived,
      starred: i % 7 === 0,
      refundable: status === 'paid' && Math.random() > 0.7,
      notes: Math.random() > 0.8 ? ['URGENT', 'REMBOURSEMENT'] : [],
      invoiceGenerated: Math.random() > 0.3,
      invoiceNumber: `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(i + 1000).padStart(4, '0')}`,
      paymentGateway: method === 'card' ? 'Stripe' :
        method === 'orange' ? 'Orange Money API' :
          method === 'mtn' ? 'MTN API' :
            method === 'wave' ? 'Wave API' : 'Direct',
      riskScore: Math.floor(Math.random() * 100),
      country: 'Côte d\'Ivoire',
      currency: 'GNF',
      exchangeRate: 1,
      metadata: {
        device: ['Mobile', 'Web', 'App'][Math.floor(Math.random() * 3)],
        ip: `196.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      }
    };
  });
};

// Composant pour les actions de paiement
const PaymentActions = ({ payment, onView, onDownload, onRefund, onExport }) => {
  const [showActions, setShowActions] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center space-x-1" ref={menuRef}>
      <div className="relative" ref={exportMenuRef}>
        <AnimatePresence>
          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50"
            >
              <div className="py-2">
                <button
                  onClick={() => {
                    onExport?.(payment, 'pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                >
                  <FileText className="w-4 h-4 mr-3 text-red-500" />
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    onExport?.(payment, 'csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    onExport?.(payment, 'doc');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                >
                  <FileText className="w-4 h-4 mr-3 text-blue-500" />
                  Export DOC
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
        title="Plus d'actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onView(payment);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Voir détails
              </button>

              {payment.invoiceGenerated && (
                <button
                  onClick={() => {
                    onDownload?.(payment);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                >
                  <Download className="w-4 h-4 mr-2 text-green-500" />
                  Télécharger facture
                </button>
              )}
              {payment.refundable && (
                <button
                  onClick={() => {
                    onRefund?.(payment);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-orange-500" />
                  Rembourser
                </button>
              )}
              <button
                onClick={() => {
                  onExport?.(payment, 'print');
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
              >
                <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                Imprimer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour la vue mobile
const MobilePaymentCard = ({ payment, isSelected, onSelect, onAction }) => {
  const getMethodBadge = (method) => {
    const config = {
      'cash': { label: 'Espèces', variant: 'success', icon: DollarSign },
      'orange': { label: 'Orange Money', variant: 'warning', icon: Smartphone },
      'mtn': { label: 'MTN Mobile Money', variant: 'primary', icon: CreditCard },
      'card': { label: 'Carte', variant: 'secondary', icon: CreditCardIcon },
    };

    const { label, variant } = config[method] || config.cash;
    return (
      <Badge variant={variant} size="sm">
        {label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      'paid': { label: 'Payé', variant: 'success', icon: CheckCircle },
      'pending': { label: 'En attente', variant: 'warning', icon: Hourglass },
      'failed': { label: 'Échoué', variant: 'danger', icon: XCircle },
      'refunded': { label: 'Remboursé', variant: 'secondary', icon: RefreshCw }
    };

    const { label, variant } = config[status] || config.pending;
    return (
      <Badge variant={variant} size="sm">
        {label}
      </Badge>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200 dark:border-gray-900'} p-4 mb-3`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 dark:border-gray-700 text-green-500 focus:ring-green-400"
            checked={isSelected}
            onChange={(e) => onSelect(payment.id, e.target.checked)}
          />
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{payment.id}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{payment.passenger.name} → {payment.driver.name}</p>
            <div className="flex items-center mt-2 space-x-2">
              {getMethodBadge(payment.method)}
              {getStatusBadge(payment.status)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800 dark:text-gray-100">{payment.amount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.date}</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-900 pt-3">
        <div className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {payment.passenger.name}
        </div>
        <div className="flex items-center">
          <Car className="w-3 h-3 mr-1" />
          {payment.driver.name}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-3 h-3 mr-1" />
          {payment.commission}
        </div>
      </div>
    </div>
  );
};

// TODO API (admin/paiements):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.payments.list, POST API_ROUTES.payments.confirm
const Payments = () => {
  // États principaux
  const [payments, setPayments] = useState(() => generatePayments(50));
  const [timeRange, setTimeRange] = useState('30j');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // États pour les modales et notifications
  const [modalState, setModalState] = useState({
    showDetails: false,
    showExport: false,
    showRefund: false,
    showGenerate: false,
    selectedPayment: null,
    selectedFormat: 'pdf',
    loading: false
  });

  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  // Détection de la taille d'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Statistiques calculées
  const stats = useMemo(() => {
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const refunded = payments.filter(p => p.status === 'refunded').length;

    const totalAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseInt(p.amount.replace(/[^0-9]/g, '')), 0);

    const totalCommission = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseInt(p.commission.replace(/[^0-9]/g, '')), 0);

    const cashPayments = payments.filter(p => p.method === 'cash' && p.status === 'paid').length;
    const mobilePayments = payments.filter(p => ['orange', 'mtn', 'wave'].includes(p.method) && p.status === 'paid').length;
    const successRate = payments.length > 0 ? Math.round((paid / payments.length) * 100) : 0;

    return [
      {
        title: "Revenus totaux",
        value: `${(totalAmount / 1000).toLocaleString('fr-FR')}K`,
        icon: DollarSign,
        color: "green",
        trend: "up",
        percentage: 85,
        progress: 85,
        subtitle: `+${Math.round(totalAmount * 0.18 / 1000)}K vs mois dernier`
      },
      {
        title: "Total paiements",
        value: payments.length.toString(),
        icon: Repeat,
        color: "blue",
        trend: "up",
        percentage: 75,
        progress: 75,
        subtitle: `${paid} réussies, ${pending} en attente`
      },
      {
        title: "Commission",
        value: `${(totalCommission / 1000).toLocaleString('fr-FR')}K`,
        icon: Percent,
        color: "purple",
        trend: "up",
        percentage: 65,
        progress: 65,
        subtitle: "15% des revenus"
      }
    ];
  }, [payments]);

  // Données pour les graphiques
  const chartData = useMemo(() => ({
    revenueChart: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Revenus (K GNF)',
        data: [120, 190, 150, 220, 180, 250, 200],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Commission (K GNF)',
        data: [18, 28, 22, 33, 27, 37, 30],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    methodDistribution: {
      labels: ['Espèces', 'Orange Money', 'MTN', 'Wave', 'Carte', 'Virement'],
      datasets: [{
        data: [45, 30, 15, 5, 3, 2],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#3B82F6',
          '#8B5CF6',
          '#EF4444',
          '#6B7280'
        ]
      }]
    },
    statusDistribution: {
      labels: ['Payés', 'En attente', 'Échoués', 'Remboursés'],
      datasets: [{
        data: [75, 15, 8, 2],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
      }]
    }
  }), []);

  // Méthodes de paiement pour le tableau de bord
  const paymentMethods = useMemo(() => [
    {
      type: 'cash',
      label: 'Espèces',
      color: 'green',
      percentage: 45,
      amount: '1.9M GNF',
      trend: '+12%',
      icon: DollarSign,
      count: payments.filter(p => p.method === 'cash').length
    },
    {
      type: 'orange',
      label: 'Orange Money',
      color: 'orange',
      percentage: 30,
      amount: '1.3M GNF',
      trend: '+8%',
      icon: Smartphone,
      count: payments.filter(p => p.method === 'orange').length
    },
    {
      type: 'mtn',
      label: 'MTN',
      color: 'blue',
      percentage: 15,
      amount: '650K GNF',
      trend: '+15%',
      icon: CreditCard,
      count: payments.filter(p => p.method === 'mtn').length
    },

    {
      type: 'card',
      label: 'Cartes',
      color: 'red',
      percentage: 3,
      amount: '130K GNF',
      trend: '+5%',
      icon: CreditCardIcon,
      count: payments.filter(p => p.method === 'card').length
    },

  ], [payments]);

  // Filtrage des paiements
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch =
        search === '' ||
        payment.id.toLowerCase().includes(search.toLowerCase()) ||
        payment.passenger.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.driver.name.toLowerCase().includes(search.toLowerCase()) ||
        payment.trip.route.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = paymentFilter === 'all' || payment.status === paymentFilter;
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      const matchesArchive =
        archiveFilter === 'all' ||
        (archiveFilter === 'archived' && payment.archived) ||
        (archiveFilter === 'not-archived' && !payment.archived);

      const matchesDate =
        (!dateRange.start || payment.date >= dateRange.start) &&
        (!dateRange.end || payment.date <= dateRange.end);

      return matchesSearch && matchesStatus && matchesMethod && matchesArchive && matchesDate;
    });
  }, [payments, search, paymentFilter, methodFilter, archiveFilter, dateRange]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  // Handlers
  const handleViewDetails = (payment) => {
    setModalState(prev => ({
      ...prev,
      showDetails: true,
      selectedPayment: payment
    }));
  };

  const handleDownloadInvoice = (payment) => {
    showToast('Téléchargement', `Téléchargement de la facture ${payment.invoiceNumber}...`, 'info');

    // Simulation de téléchargement
    setTimeout(() => {
      const content = `Facture: ${payment.invoiceNumber}\nClient: ${payment.passenger.name}\nMontant: ${payment.amount}\nDate: ${payment.date}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${payment.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Facture téléchargée', 'La facture a été téléchargée avec succès', 'success');
    }, 1000);
  };



  const handleRefundPayment = (paymentId) => {
    setModalState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setPayments(prev => prev.map(payment =>
        payment.id === paymentId ? { ...payment, status: 'refunded' } : payment
      ));

      setModalState(prev => ({ ...prev, loading: false, showRefund: false }));
      showToast('Remboursement effectué', 'Le paiement a été remboursé avec succès', 'success');
    }, 1500);
  };

  const handleExportPayment = (payment, format) => {
    showToast('Export', `Exportation du paiement en ${format.toUpperCase()}...`, 'info');

    setTimeout(() => {
      const content = `Paiement: ${payment.id}\nMontant: ${payment.amount}\nPassager: ${payment.passenger.name}\nDate: ${payment.date}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Paiement_${payment.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Export réussi', `Le paiement a été exporté en ${format.toUpperCase()}`, 'success');
    }, 1000);
  };

  const handleBulkExport = (format) => {
    if (selectedPayments.length === 0) {
      showToast('Aucun paiement sélectionné', 'Veuillez sélectionner au moins un paiement', 'warning');
      return;
    }

    showToast('Export', `Exportation de ${selectedPayments.length} paiements en ${format}...`, 'info');

    setTimeout(() => {
      const data = selectedPayments.map(id => {
        const payment = payments.find(p => p.id === id);
        return {
          id: payment.id,
          amount: payment.amount,
          passenger: payment.passenger.name,
          driver: payment.driver.name,
          status: payment.status,
          date: payment.date
        };
      });

      let blob, filename;
      if (format === 'csv') {
        const csv = [
          ['ID', 'Montant', 'Passager', 'Chauffeur', 'Statut', 'Date'],
          ...data.map(p => [p.id, p.amount, p.passenger, p.driver, p.status, p.date])
        ].map(row => row.join(';')).join('\n');

        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        filename = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `paiements_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // PDF simulation
        showToast('Export PDF', 'Génération du PDF en cours...', 'success');
        return;
      }

      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        showToast('Export réussi', `${selectedPayments.length} paiements exportés`, 'success');
      }
    }, 1500);
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

  const handleAction = (action, payment, format = null) => {
    switch (action) {
      case 'view':
        handleViewDetails(payment);
        break;
      case 'download':
        handleDownloadInvoice(payment);
        break;
      case 'refund':
        setModalState(prev => ({ ...prev, showRefund: true, selectedPayment: payment }));
        break;
      case 'export':
        handleExportPayment(payment, format);
        break;
    }
  };

  // Helper pour afficher le badge de méthode
  const getMethodBadge = (method) => {
    const config = {
      'cash': { label: 'Espèces', color: 'green', icon: DollarSign },
      'orange': { label: 'Orange Money', color: 'yellow', icon: Smartphone },
      'mtn': { label: 'MTN ', color: 'red', icon: CreditCard },
      'card': { label: 'Carte', color: 'gray', icon: CreditCardIcon },
    };

    const { label, color, icon: Icon } = config[method] || config.cash;
    return (
      <Badge className={`text-${color}-500 `}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Helper pour afficher le badge de statut
  const getStatusBadge = (status) => {
    const config = {
      'paid': { label: 'Payé', color: 'green', icon: CheckCircle },
      'pending': { label: 'En attente', color: 'yellow', icon: Hourglass },
      'failed': { label: 'Échoué', color: 'red', icon: XCircle },
      'refunded': { label: 'Remboursé', color: 'gray', icon: RefreshCw }
    };

    const { label, color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={`text-${color}-500 `}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Configuration des tabs
  const tabs = [
    { id: 'all', label: 'Tous', icon: DollarSign },
    { id: 'paid', label: 'Payés', icon: CheckCircle },
    { id: 'pending', label: 'En attente', icon: Hourglass },
    { id: 'failed', label: 'Échoués', icon: XCircle },
    { id: 'refunded', label: 'Remboursés', icon: RefreshCw }
  ];

  // Modal de détails du paiement
  const PaymentDetailsModal = () => {
    const payment = modalState.selectedPayment;
    if (!payment) return null;

    return (
      <Modal
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        title="Détails du paiement"
        size="lg"
      >
        <div className="space-y-6 scroll-m-t-2 overflow-auto h-[70vh]">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transaction {payment.id}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Référence: {payment.reference} • {payment.date} à {payment.time}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                {getStatusBadge(payment.status)}
                {getMethodBadge(payment.method)}
                {payment.archived && <Badge variant="secondary">Archivé</Badge>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{payment.amount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net: {payment.netAmount}</p>
            </div>
          </div>

          {/* Informations du trajet */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du trajet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trajet ID</p>
                  <p className="font-medium">{payment.trip.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Itinéraire</p>
                  <p className="font-medium">{payment.trip.route}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Distance</p>
                  <p className="font-medium">{payment.trip.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Durée</p>
                  <p className="font-medium">{payment.trip.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passager et chauffeur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Passager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full  flex items-center justify-center">
                      <User className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{payment.passenger.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{payment.passenger.phone}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Email: {payment.passenger.email}</p>
                    <p className="text-gray-500 dark:text-gray-400">Note: {payment.passenger.rating}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chauffeur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Car className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{payment.driver.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{payment.driver.phone}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Compte: {payment.driver.account}</p>
                    <p className="text-gray-500 dark:text-gray-400">Note: {payment.driver.rating}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails financiers */}
          <Card>
            <CardHeader>
              <CardTitle>Détails financiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Montant total:</span>
                  <span className="font-medium">{payment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Commission ({payment.commissionRate}):</span>
                  <span className="font-medium text-red-600">-{payment.commission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Frais de plateforme:</span>
                  <span className="font-medium">-{payment.fees.platform}</span>
                </div>
                {payment.fees.processing !== '0 GNF' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Frais de traitement:</span>
                    <span className="font-medium">-{payment.fees.processing}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Montant net:</span>
                    <span className="text-green-600">{payment.netAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations techniques */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations techniques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">ID Transaction:</span>
                    <span className="font-medium">{payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Référence:</span>
                    <span className="font-medium">{payment.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Traité le:</span>
                    <span className="font-medium">{payment.processedAt || 'Non traité'}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Passerelle:</span>
                    <span className="font-medium">{payment.paymentGateway}</span>
                  </div> */}
                </div>
              </CardContent>
            </Card>
            {/* 
            <Card>
              <CardHeader>
                <CardTitle>Métadonnées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Facture:</span>
                    <span className="font-medium">{payment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Score de risque:</span>
                    <span className={`font-medium ${payment.riskScore > 70 ? 'text-red-600' : payment.riskScore > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {payment.riskScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Appareil:</span>
                    <span className="font-medium">{payment.metadata.device}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Pays:</span>
                    <span className="font-medium">{payment.country}</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}
            >
              Fermer
            </Button>
            {payment.invoiceGenerated && (
              <Button
                variant="perso"
                icon={Download}
                onClick={() => {
                  handleDownloadInvoice(payment);
                  setModalState(prev => ({ ...prev, showDetails: false }));
                }}
              >
                Télécharger facture
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Share2}
              onClick={() => {
                navigator.clipboard.writeText(payment.id);
                showToast('ID copié', 'L\'ID de la transaction a été copié', 'success');
              }}
            >
              Partager
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Modal de remboursement
  const RefundModal = () => {
    const payment = modalState.selectedPayment;
    if (!payment) return null;

    return (
      <ConfirmModal
        isOpen={modalState.showRefund}
        onClose={() => setModalState(prev => ({ ...prev, showRefund: false }))}
        onConfirm={() => handleRefundPayment(payment.id)}
        title="Confirmer le remboursement"
        message={`Êtes-vous sûr de vouloir rembourser le paiement ${payment.id} d'un montant de ${payment.amount} ?`}
        type="warning"
        confirmText="Rembourser"
        cancelText="Annuler"
        loading={modalState.loading}
        showComment={true}
        commentLabel="Raison du remboursement"
        commentPlaceholder="Ex: Erreur de paiement, annulation..."
      />
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0 ">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Modales */}
      <PaymentDetailsModal />
      <RefundModal />

      {/* En-tête avec actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestion des Paiements</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Surveillez et gérez toutes les transactions financières</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {selectedPayments.length > 0 && (
            <>

              <Button
                variant="secondary"
                icon={Download}
                onClick={() => handleBulkExport('csv')}
                className="flex-1 md:flex-none"
              >
                <span className="hidden md:inline">Exporter ({selectedPayments.length})</span>
                <span className="md:hidden">Exporter</span>
              </Button>
            </>
          )}

        </div>
      </motion.div>

      {/* Statistiques */}
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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Évolution des paiements</CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Revenus et commissions sur 30 jours</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={timeRange === '30j' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setTimeRange('30j')}
                  >
                    30j
                  </Button>
                  <Button
                    variant={timeRange === '90j' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setTimeRange('90j')}
                  >
                    90j
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartCard
                title=""
                subtitle=""
                chartConfig={{
                  type: 'line',
                  data: chartData.revenueChart,
                  options: {
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }
                }}
                height="250px"
              />

            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par méthode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.type} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:bg-gray-800 rounded-lg transition">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${method.color === 'green' ? 'bg-green-100' :
                        method.color === 'orange' ? 'bg-orange-100' :
                          method.color === 'blue' ? 'bg-blue-100' :
                            method.color === 'purple' ? 'bg-purple-100' :
                              method.color === 'red' ? 'bg-red-100' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <method.icon className={
                          method.color === 'green' ? 'text-green-500' :
                            method.color === 'orange' ? 'text-orange-500' :
                              method.color === 'blue' ? 'text-blue-500' :
                                method.color === 'purple' ? 'text-purple-500' :
                                  method.color === 'red' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                        } />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{method.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{method.percentage}% ({method.count})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-gray-100">{method.amount}</p>
                      <p className="text-sm text-green-500 flex items-center justify-end">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {method.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Statut des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartCard
                title=""
                subtitle=""
                chartConfig={{
                  type: 'doughnut',
                  data: chartData.statusDistribution
                }}
                height="180px"
              />
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Recherche et filtres */}
      <Card hoverable={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
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
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
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
            <option value="cash">Espèces</option>
            <option value="orange">Orange Money</option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="card">Carte</option>
          </select>



          <div className="col-span-2 grid grid-cols-2 gap-4 ">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Du</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Au</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:border-green-400 transition"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="min-w-max md:min-w-0">
          <Tabs
            tabs={tabs}
            activeTab={paymentFilter}
            onChange={(tab) => {
              setPaymentFilter(tab);
              setCurrentPage(1);
            }}
            className="px-2 md:px-4"
          />
        </div>
      </div>

      {/* Table des transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedPayments.length > 0 && `${selectedPayments.length} sélectionné(s) • `}
                {paginatedPayments.length} affiché(s) sur {filteredPayments.length}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Afficher :</span>
              <select
                className="border border-gray-200 dark:bg-gray-900/40 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition w-full md:w-auto"
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
          {isMobile ? (
            <div className="space-y-3">
              {paginatedPayments.map((payment) => (
                <MobilePaymentCard
                  key={payment.id}
                  payment={payment}
                  isSelected={selectedPayments.includes(payment.id)}
                  onSelect={handleSelectPayment}
                  onAction={handleAction}
                />
              ))}
            </div>
          ) : (
            <Table
              headers={[

                'Passager',
                'Chauffeur',
                'Trajet',
                'Montant',
                'Statut',
                'Actions'
              ]}
            >
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>

                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-700 to-blue-500 flex items-center justify-center mr-2">
                        <User className="text-white " size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{payment.passenger.name}</p>
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400">{payment.passenger.phone}</p> */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <Car className="text-blue-500" size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{payment.driver.name}</p>
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400">{payment.driver.phone}</p> */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{payment.trip.route}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{payment.date}</div>
                  </TableCell>
                  <TableCell>
                    {getMethodBadge(payment.method)}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{payment.amount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400"> {getStatusBadge(payment.status)}</div>
                  </TableCell>

                  <TableCell>
                    <PaymentActions
                      payment={payment}
                      onView={handleViewDetails}
                      onDownload={() => handleAction('download', payment)}
                      onRefund={() => handleAction('refund', payment)}
                      onExport={(p, format) => handleAction('export', p, format)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}

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
              <p className="text-gray-500 dark:text-gray-400">Aucune transaction trouvée</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Essayez de modifier vos filtres ou de rafraîchir la liste
              </p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default Payments;
