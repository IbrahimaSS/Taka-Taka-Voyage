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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { color } from 'chart.js/helpers';
import { adminService } from '../../../services/adminService';
import PremiumInvoice from '../ui/PremiumInvoice';
import ExportDropdown from '../ui/ExportDropdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper de mappage pour adapter les données backend au format frontend
const mapBackendPaymentToFrontend = (p) => {
  const r = p.reservation || {};
  const passager = r.passager || {};
  const chauffeur = r.chauffeur || {};

  // Formatage montant
  const formatMoney = (amount) => `${(amount || 0).toLocaleString('fr-FR')} GNF`;

  // Mapping statut
  const getStatus = (s) => {
    switch (s) {
      case 'PAYE': return 'paid';
      case 'EN_ATTENTE': return 'pending';
      case 'ECHOUE': return 'failed';
      case 'REMBOURSE': return 'refunded';
      case 'ANNULE': return 'failed';
      default: return 'pending';
    }
  };

  // Mapping methode
  const getMethod = (m) => {
    if (!m) return 'cash';
    const lower = m.toLowerCase();
    if (lower.includes('orange')) return 'orange';
    if (lower.includes('mtn')) return 'mtn';
    if (lower.includes('wave')) return 'wave';
    if (lower.includes('carte') || lower.includes('card')) return 'card';
    if (lower === 'cash' || lower === 'especes' || lower === 'espèces') return 'cash';
    return 'cash';
  };

  const method = getMethod(p.methode);
  const status = getStatus(p.statut);
  const dateObj = new Date(p.createdAt);

  // Montants numériques bruts pour calculs
  const montantTotal = p.montantTotal || 0;
  const commissionPlateforme = p.commissionPlateforme || 0;
  const montantChauffeur = p.montantChauffeur || 0;
  const commissionRate = montantTotal > 0 ? Math.round((commissionPlateforme / montantTotal) * 100) : 20;

  return {
    id: `PAY-${p._id.slice(-6).toUpperCase()}`,
    _id: p._id,
    transactionId: p.transactionId || `TXN-${p._id.slice(-8).toUpperCase()}`,
    passenger: {
      name: passager.nom ? `${passager.prenom || ''} ${passager.nom}`.trim() : 'Utilisateur Client',
      phone: passager.telephone || '-',
      email: passager.email || '-',
      rating: passager.noteMoyenne ? passager.noteMoyenne.toFixed(1) : '-',
      photo: passager.photoUrl || null
    },
    driver: {
      name: chauffeur.nom ? `${chauffeur.prenom || ''} ${chauffeur.nom}`.trim() : 'Chauffeur',
      phone: chauffeur.telephone || '-',
      email: chauffeur.email || '-',
      rating: chauffeur.noteMoyenne ? chauffeur.noteMoyenne.toFixed(1) : '-',
      vehicle: chauffeur.vehicule ? `${chauffeur.vehicule.marque || ''} ${chauffeur.vehicule.modele || ''}`.trim() : '-',
      account: chauffeur.email || chauffeur.telephone || '-',
      photo: chauffeur.photoUrl || null
    },
    trip: {
      id: r._id ? `TR-${r._id.slice(-6).toUpperCase()}` : 'TR-UNKNOWN',
      route: r.depart && r.destination ? `${r.depart.split(',')[0]} → ${r.destination.split(',')[0]}` : 'Trajet inconnu',
      distance: r.distanceKm ? `${r.distanceKm} km` : '-',
      duration: r.dureeMin ? `${r.dureeMin} min` : '-',
      date: dateObj.toLocaleDateString('fr-FR'),
      vehicleType: r.typeVehicule || '-'
    },
    amount: formatMoney(montantTotal),
    rawAmount: montantTotal,
    commission: formatMoney(commissionPlateforme),
    rawCommission: commissionPlateforme,
    netAmount: formatMoney(montantChauffeur),
    rawNetAmount: montantChauffeur,
    commissionRate: `${commissionRate}%`,
    fees: {
      platform: formatMoney(commissionPlateforme),
      processing: formatMoney(0)
    },
    method,
    methodRaw: p.methode || 'CASH',
    status,
    statusRaw: p.statut,
    rawDate: dateObj,
    date: dateObj.toLocaleDateString('fr-FR'),
    time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    processedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString('fr-FR') : null,
    reference: (r.paiement && r.paiement.reference) || p.reference || '-',
    invoiceGenerated: status === 'paid',
    invoiceNumber: `INV-${dateObj.getFullYear()}-${p._id.slice(-6).toUpperCase()}`,
    refundable: status === 'paid',
    archived: false,
    passengerId: passager._id,
    driverId: chauffeur._id
  };
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
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    onExport?.(payment, 'pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                  <FileText className="w-4 h-4 mr-3 text-red-500" />
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    onExport?.(payment, 'csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    onExport?.(payment, 'doc');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
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
        title="Plus d'actions">
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  onView(payment);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                Voir détails
              </button>

              {payment.invoiceGenerated && (
                <button
                  onClick={() => {
                    onDownload?.(payment);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
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
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                  <RefreshCw className="w-4 h-4 mr-2 text-orange-500" />
                  Rembourser
                </button>
              )}
              <button
                onClick={() => {
                  onExport?.(payment, 'print');
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
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

const Avatar = ({ name, photoUrl, type = 'passenger', size = 'w-8 h-8', className = 'mr-2' }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n) => {
    if (!n) return '?';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const bgColor = type === 'driver' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';

  const getFullFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (photoUrl && !imageError) {
    return (
      <img
        src={getFullFileUrl(photoUrl)}
        alt={name}
        className={`${size} rounded-full object-cover ${className} border border-gray-200 dark:border-gray-700`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full ${bgColor} flex items-center justify-center ${className} text-xs font-bold border border-white dark:border-gray-800 shadow-sm`}>
      {initials}
    </div>
  );
};

// TODO API (admin/paiements):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.payments.list, POST API_ROUTES.payments.confirm
const Payments = () => {
  // États principaux
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState(null);

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

  const [revenueData, setRevenueData] = useState([]);
  const [repartitionData, setRepartitionData] = useState([]);

  // Charger les données réelles
  const fetchData = async (periode = 30) => {
    try {
      setLoading(true);
      const mode = periode <= 30 ? 'journalier' : 'mensuel';
      const [paymentsRes, statsRes, evolutionRes, repartitionRes] = await Promise.all([
        adminService.getPaymentList({ limit: 200 }),
        adminService.getPaymentStats(),
        adminService.getMonthlyRevenue({ periode, mode }),
        adminService.getPaymentRepartition()
      ]);

      if (paymentsRes.data.succes) {
        const mapped = paymentsRes.data.paiements.map(mapBackendPaymentToFrontend);
        setPayments(mapped);
      }

      if (statsRes.data.succes) {
        setApiStats(statsRes.data.cards);
      }

      if (evolutionRes.data.succes) {
        setRevenueData(evolutionRes.data.evolution);
      }

      if (repartitionRes.data.succes) {
        setRepartitionData(repartitionRes.data.repartition);
      }

    } catch (error) {
      console.error("Erreur chargement paiements:", error);
      // showToast will be available after first render
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(timeRange === '90j' ? 90 : 30);
  }, []);

  // Recharger l'évolution quand timeRange change
  useEffect(() => {
    const periode = timeRange === '90j' ? 90 : 30;
    const mode = periode <= 30 ? 'journalier' : 'mensuel';
    adminService.getMonthlyRevenue({ periode, mode })
      .then(res => {
        if (res.data.succes) {
          setRevenueData(res.data.evolution);
        }
      })
      .catch(err => console.error('Erreur rechargement évolution:', err));
  }, [timeRange]);

  // États pour les modales et notifications
  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: 'ID Facture', accessor: 'invoiceNumber' },
    { header: 'Passager', accessor: (p) => p.passenger.name },
    { header: 'Chauffeur', accessor: (p) => p.driver.name },
    { header: 'Montant', accessor: 'amount' },
    { header: 'Méthode', accessor: 'method' },
    { header: 'Date', accessor: 'date' },
    { header: 'Statut', accessor: 'status' },
    { header: 'Transaction ID', accessor: 'transactionId' },
  ], []);

  const [modalState, setModalState] = useState({
    showDetails: false,
    showExport: false,
    showRefund: false,
    showGenerate: false,
    showPremiumInvoice: false, // Nouvel état pour la facture premium
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
    // Calcul frontend (fallback)
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;

    // Valeurs affichées - priorité aux stats API
    const totalRevenue = apiStats ? apiStats.revenusTotaux : payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.rawAmount || 0), 0);

    const totalPayes = apiStats ? apiStats.totalPayes : paid;
    const totalCount = apiStats ? apiStats.totalPaiements : payments.length;
    const totalEnAttente = apiStats ? apiStats.enAttente : pending;

    const totalCommission = apiStats ? apiStats.totalCommissions : payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.rawCommission || 0), 0);

    const payRate = totalCount > 0 ? Math.round((totalPayes / totalCount) * 100) : 0;
    const commissionRate = totalRevenue > 0 ? Math.round((totalCommission / totalRevenue) * 100) : 0;

    return [
      {
        title: "Revenus totaux",
        value: `${(totalRevenue || 0).toLocaleString('fr-FR')} GNF`,
        icon: DollarSign,
        color: "green",
        trend: "up",
        percentage: payRate,
        progress: payRate,
        subtitle: `${totalPayes} paiements encaissés`
      },
      {
        title: "Total paiements",
        value: (totalCount || 0).toString(),
        icon: Repeat,
        color: "blue",
        trend: "up",
        percentage: payRate,
        progress: payRate,
        subtitle: `${totalPayes} payés, ${totalEnAttente} en attente`
      },
      {
        title: "Commission plateforme",
        value: `${(totalCommission || 0).toLocaleString('fr-FR')} GNF`,
        icon: Percent,
        color: "purple",
        trend: "up",
        percentage: commissionRate,
        progress: commissionRate,
        subtitle: `~${commissionRate}% des revenus`
      }
    ];
  }, [payments, apiStats]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Si backend data dispo
    if (revenueData.length > 0) {
      return {
        revenueChart: {
          labels: revenueData.map(d => new Date(d.label).toLocaleDateString('fr-FR')),
          datasets: [{
            label: 'Revenus (GNF)',
            data: revenueData.map(d => d.revenus),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Commission (GNF)',
            data: revenueData.map(d => d.commissions),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        methodDistribution: {
          labels: repartitionData.map(d => {
            const methodeLabels = { 'CASH': 'Espèces', 'ESPECES': 'Espèces', 'ORANGE_MONEY': 'Orange Money', 'MTN_MONEY': 'MTN', 'WAVE': 'Wave', 'CARTE_BANCAIRE': 'Carte' };
            return methodeLabels[d.methode] || d.methode || 'Autre';
          }),
          datasets: [{
            data: repartitionData.map(d => d.nombre),
            backgroundColor: [
              '#10B981', // Espèces
              '#F59E0B', // Orange
              '#3B82F6', // MTN
              '#8B5CF6', // Wave
              '#EF4444', // Carte
              '#6B7280'  // Autre
            ]
          }]
        },
        statusDistribution: {
          labels: ['Payés', 'En attente', 'Échoués', 'Remboursés'],
          datasets: [{
            data: [
              payments.filter(p => p.status === 'paid').length,
              payments.filter(p => p.status === 'pending').length,
              payments.filter(p => p.status === 'failed').length,
              payments.filter(p => p.status === 'refunded').length,
            ],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
          }]
        }
      };
    }

    // Fallback/Mock
    return {
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
    };
  }, [revenueData, repartitionData, payments]);

  // Méthodes de paiement pour le tableau de bord
  const paymentMethods = useMemo(() => {
    // Helper pour trouver les valeurs dans repartitionData
    const findData = (...methodKeys) => {
      // Le backend peut renvoyer 'CASH' ou 'ESPECES' selon la version
      const found = repartitionData.find(d => methodKeys.includes(d.methode));

      // Ou calcule depuis 'payments' si repartitionData vide
      if (!found && payments.length > 0) {
        const methodMap = { 'cash': ['CASH', 'ESPECES'], 'orange': ['ORANGE_MONEY'], 'mtn': ['MTN_MONEY', 'MTN'], 'wave': ['WAVE'] };
        const frontKey = Object.keys(methodMap).find(k => methodMap[k].some(m => methodKeys.includes(m)));
        const list = frontKey ? payments.filter(p => p.method === frontKey) : [];
        return {
          nombre: list.length,
          montant: list.reduce((sum, p) => sum + (p.rawAmount || 0), 0),
          pourcentage: 0
        };
      }

      return found || { nombre: 0, montant: 0, pourcentage: 0 };
    };

    const cash = findData('CASH', 'ESPECES');
    const orange = findData('ORANGE_MONEY');
    const mtn = findData('MTN_MONEY', 'MTN');
    const wave = findData('WAVE');

    return [
      {
        type: 'cash',
        label: 'Espèces',
        color: 'green',
        percentage: cash.pourcentage || 0,
        amount: `${(cash.montant || 0).toLocaleString('fr-FR')} GNF`,
        trend: `${cash.nombre || 0} trans.`,
        icon: DollarSign,
        count: cash.nombre || 0
      },
      {
        type: 'orange',
        label: 'Orange Money',
        color: 'orange',
        percentage: orange.pourcentage || 0,
        amount: `${(orange.montant || 0).toLocaleString('fr-FR')} GNF`,
        trend: `${orange.nombre || 0} trans.`,
        icon: Smartphone,
        count: orange.nombre || 0
      },
      {
        type: 'mtn',
        label: 'MTN',
        color: 'blue',
        percentage: mtn.pourcentage || 0,
        amount: `${(mtn.montant || 0).toLocaleString('fr-FR')} GNF`,
        trend: `${mtn.nombre || 0} trans.`,
        icon: CreditCard,
        count: mtn.nombre || 0
      },
      {
        type: 'wave',
        label: 'Wave',
        color: 'purple',
        percentage: wave.pourcentage || 0,
        amount: `${(wave.montant || 0).toLocaleString('fr-FR')} GNF`,
        trend: `${wave.nombre || 0} trans.`,
        icon: Wallet,
        count: wave.nombre || 0
      },
    ];
  }, [repartitionData, payments]);

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
    // Remplacer l'ancienne logique par l'ouverture de la facture premium
    setModalState(prev => ({
      ...prev,
      showPremiumInvoice: true,
      selectedPayment: payment
    }));
  };
  /*
    const handleOldDownloadInvoice = (payment) => {
        try {
          const doc = new jsPDF();
  
          // --- En-tête ---
          // Logo (simulé par un carré coloré ou texte stylisé)
          doc.setFillColor(16, 185, 129); // Vert Taka Taka
          doc.rect(0, 0, 210, 20, 'F');
  
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(22);
          doc.setFont("helvetica", "bold");
          doc.text("Taka Taka Voyage", 14, 13);
  
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("ADMINISTRATION", 160, 13);
  
          // --- Info Entreprise (en haut à droite) ---
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          doc.text("Taka Taka Voyage SARL", 150, 35);
          doc.text("Conakry, Guinée", 150, 40);
          doc.text("contact@takataka.com", 150, 45);
          doc.text("+224 620 00 00 00", 150, 50);
  
          // --- Titre Facture ---
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text("RECU DE PAIEMENT", 14, 45);
  
          // --- Détails Facture (Gauche) ---
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`Numéro de facture :`, 14, 55);
          doc.text(`Date de transaction :`, 14, 60);
          doc.text(`ID Transaction :`, 14, 65);
          doc.text(`Méthode :`, 14, 70);
  
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(payment.invoiceNumber, 55, 55);
          doc.text(`${payment.date} à ${payment.time}`, 55, 60);
          doc.text(payment.transactionId, 55, 65);
          doc.text(payment.method.toUpperCase(), 55, 70);
  
          // --- Ligne de séparation ---
          doc.setDrawColor(200, 200, 200);
          doc.line(14, 78, 196, 78);
  
          // --- Infos Client et Chauffeur ---
          const yPosInfo = 88;
  
          // Passager
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("CLIENT (Passager)", 14, yPosInfo);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`Nom :`, 14, yPosInfo + 7);
          doc.text(`Téléphone :`, 14, yPosInfo + 12);
          doc.text(`Email :`, 14, yPosInfo + 17);
  
          doc.setTextColor(0, 0, 0);
          doc.text(payment.passenger.name, 40, yPosInfo + 7);
          doc.text(payment.passenger.phone, 40, yPosInfo + 12);
          doc.text(payment.passenger.email, 40, yPosInfo + 17);
  
          // Chauffeur
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("PRESTATAIRE (Chauffeur)", 110, yPosInfo);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`Nom :`, 110, yPosInfo + 7);
          doc.text(`Véhicule :`, 110, yPosInfo + 12);
          // doc.text(`Téléphone :`, 110, yPosInfo + 17);
  
          doc.setTextColor(0, 0, 0);
          doc.text(payment.driver.name, 135, yPosInfo + 7);
          doc.text(payment.driver.vehicle, 135, yPosInfo + 12);
          // doc.text(payment.driver.phone, 135, yPosInfo + 17);
  
          // --- Détails du Trajet ---
          autoTable(doc, {
            startY: yPosInfo + 25,
            head: [['Détails du Trajet', 'Données']],
            body: [
              ['Départ', payment.trip.route.split('→')[0].trim()],
              ['Destination', payment.trip.route.split('→')[1]?.trim() || '-'],
              ['Date du trajet', payment.trip.date],
              ['Distance', payment.trip.distance],
              ['Durée estimée', payment.trip.duration],
            ],
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
          });
  
          // --- Détails Financiers ---
          autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Description', 'Montant (GNF)']],
            body: [
              ['Prix de la course', payment.amount],
              ['Frais de service (Plateforme)', payment.fees?.platform || '0 GNF'],
              ['TVA (18%)', 'Inclus'],
            ],
            foot: [['Total Payé', payment.amount]],
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
            footStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right' },
            columnStyles: { 1: { halign: 'right' } }
          });
  
          // --- Pied de page ---
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("Ce document est une preuve de paiement générée électroniquement par la plateforme Taka Taka Voyage.", 105, pageHeight - 15, { align: 'center' });
          doc.text("Merci de votre confiance.", 105, pageHeight - 10, { align: 'center' });
  
          // Sauvegarde
          doc.save(`Recu_${payment.invoiceNumber}.pdf`);
          showToast('Facture téléchargée', 'Le fichier PDF a été généré avec succès', 'success');
  
        } catch (error) {
          console.error('Erreur PDF:', error);
          showToast('Erreur PDF', `Erreur: ${error.message || 'Impossible de générer le PDF'}`, 'error');
        }
      };
  */



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
        size="lg">
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
                    <Avatar
                      name={payment.passenger.name}
                      photoUrl={payment.passenger.photo}
                      type="passenger"
                      size="w-12 h-12"
                      className="mr-0"
                    />
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
                    <Avatar
                      name={payment.driver.name}
                      photoUrl={payment.driver.photo}
                      type="driver"
                      size="w-12 h-12"
                      className="mr-0"
                    />
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{payment.driver.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{payment.driver.phone}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500 dark:text-gray-400">Véhicule: {payment.driver.vehicle}</p>
                    <p className="text-gray-500 dark:text-gray-400">Note: {payment.driver.rating !== '-' ? `${payment.driver.rating}/5` : 'Non noté'}</p>
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
                  <span className="text-gray-600 dark:text-gray-300">Commission ({payment.commissionRate || '20%'}):</span>
                  <span className="font-medium text-red-600">-{payment.commission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Frais de plateforme:</span>
                  <span className="font-medium">-{payment.fees?.platform || '0 GNF'}</span>
                </div>
                {payment.fees?.processing && payment.fees.processing !== '0 GNF' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Frais de traitement:</span>
                    <span className="font-medium">-{payment.fees.processing}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Montant net chauffeur:</span>
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

          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="secondary"
              onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}>
              Fermer
            </Button>
            {payment.invoiceGenerated && (
              <Button
                variant="perso"
                icon={Download}
                onClick={() => {
                  handleDownloadInvoice(payment);
                  setModalState(prev => ({ ...prev, showDetails: false }));
                }}>
                Télécharger facture
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Share2}
              onClick={() => {
                navigator.clipboard.writeText(payment.id);
                showToast('ID copié', 'L\'ID de la transaction a été copié', 'success');
              }}>
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
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
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
      <div key="modals-container">
        <PaymentDetailsModal />
        <RefundModal />
        <AnimatePresence>
          {modalState.showPremiumInvoice && (
            <PremiumInvoice
              payment={modalState.selectedPayment}
              onClose={() => setModalState(prev => ({ ...prev, showPremiumInvoice: false }))}
            />
          )}
        </AnimatePresence>
      </div>

      {/* En-tête avec actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestion des Paiements</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Surveillez et gérez toutes les transactions financières</p>
        </div>

        <ExportDropdown
          data={selectedPayments.length > 0 ? payments.filter(p => selectedPayments.includes(p.id)) : payments}
          columns={exportColumns}
          fileName="paiements_taka_taka"
          title="Historique des Paiements - Taka Taka"
          showToast={(title, msg, type) => showToast(title, msg, type)}
        />
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {
          stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}>
              <StatCard {...stat} />
            </motion.div>
          ))
        }
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
                    onClick={() => setTimeRange('30j')}>
                    30j
                  </Button>
                  <Button
                    variant={timeRange === '90j' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setTimeRange('90j')}>
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
            }}>
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
            }}>
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
                }}>
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
              ]}>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id}>

                  <TableCell>
                    <div className="flex items-center">
                      <Avatar name={payment.passenger.name} photoUrl={payment.passenger.photo} type="passenger" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{payment.passenger.name}</p>
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400">{payment.passenger.phone}</p> */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar name={payment.driver.name} photoUrl={payment.driver.photo} type="driver" />
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

