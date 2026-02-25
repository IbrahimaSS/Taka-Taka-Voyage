import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CreditCard, Smartphone, Gift, RefreshCw,
  Printer, Wallet, ArrowUpRight, ArrowDownRight,
  Filter, Search, Download, Eye, Share2,
  ChevronDown, X, TrendingUp, TrendingDown,
  FileText, CheckCircle, Clock, AlertCircle,
  Plus, MoreVertical, QrCode, Shield,
  BarChart3, PieChart, Receipt, Coins,
  Bell, MessageCircle, Link, Copy, Grid,
  Loader, User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Table, { TableRow, TableCell, TableHeader } from '../admin/ui/Table';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import ExportDropdown from '../admin/ui/ExportDropdown';
import Pagination from '../admin/ui/Pagination';
import PremiumInvoice from '../admin/ui/PremiumInvoice';

// Context et services
import { usePassenger } from '../../context/PassengerContext';
import { tripService } from '../../services/tripService'; // ✅ Import service
import { toast } from 'react-hot-toast';

// --- Composants Internes ---

const StatCard = ({ label, value, icon: Icon, colorClass, subValue, subIcon: SubIcon, onClick }) => (
  <Card hoverable padding="p-6" onClick={onClick} className="cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
            {SubIcon && <SubIcon className="w-3 h-3 mr-1" />}
            {subValue}
          </p>
        )}
      </div>
    </div>
  </Card>
);

const FilterChip = ({ active, onClick, icon: Icon, label }) => (
  <Button
    variant={active ? 'primary' : 'secondary'}
    size="small"
    onClick={onClick}
    icon={Icon}
    className={active ? '' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
  >
    {label}
  </Button>
);

const TransactionStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: t('transactions.status.completed')
    },
    pending: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Clock,
      label: t('transactions.status.pending')
    },
    failed: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: AlertCircle,
      label: t('transactions.status.failed')
    }
  };

  const { variant, icon: Icon, label } = config[status] || config.pending;

  return (
    <Badge size="sm" className={`bg-${variant} inline-flex items-center`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};

const TransactionTypeBadge = ({ type, amount }) => {
  const { t } = useTranslation();
  const isIncome = amount > 0;

  const config = {
    'Paiement trajet': {
      label: t('transactions.types.trip_payment'),
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
    },
    'Remboursement': {
      label: t('transactions.types.refund'),
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
    },
    'Cashback': {
      label: t('transactions.types.cashback'),
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
    },
    'Recharge': {
      label: t('transactions.types.topup'),
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
    }
  };

  const typeConfig = config[type] || {
    label: type === 'Autre' ? t('transactions.types.other') : type,
    color: isIncome ? 'text-emerald-600' : 'text-rose-600',
    bgColor: isIncome ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20' : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
      {typeConfig.label}
    </span>
  );
};

const TransactionDetailsModal = ({ transaction, isOpen, onClose, onShare, onShowInvoice }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('transactions.details.title')}
      size="md"
    >
      {transaction && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700/50 p-6 rounded-xl flex justify-between items-center shadow-sm">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.details.transaction_number')}{transaction.reference}</p>
              <p className={`text-3xl font-bold mt-1 ${transaction.amount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} GNF
              </p>
            </div>
            <TransactionStatusBadge status={transaction.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.details.date_time')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{transaction.date} {transaction.time ? `- ${transaction.time}` : ''}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.details.type')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{transaction.type}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.details.method')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{transaction.method}</p>
          </div>

          {transaction.details && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('transactions.details.driver_vehicle')}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4 ring-2 ring-white dark:ring-gray-600 shadow-sm overflow-hidden">
                  {transaction.details.driverPhoto ? (
                    <img src={transaction.details.driverPhoto} alt={transaction.details.driverName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {transaction.details.driverName?.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{transaction.details.driverName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{transaction.details.vehicleInfo}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('transactions.details.reference')}</p>
            <div className="flex items-center justify-between mt-2">
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono text-gray-800 dark:text-gray-200">{transaction.reference}</code>
              <Button
                variant="ghost"
                size="small"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(transaction.reference);
                  toast.success(t('transactions.messages.ref_copied'));
                }}
              >
                {t('transactions.details.copy')}
              </Button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              {t('transactions.details.close')}
            </Button>
            <Button
              variant="warning"
              onClick={() => onShowInvoice(transaction)}
              icon={Receipt}
              className="flex-1"
            >
              {t('transactions.details.receipt')}
            </Button>
            <Button
              variant="primary"
              onClick={onShare}
              icon={Share2}
              className="flex-1"
            >
              {t('transactions.details.share')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// --- Composant Principal ---

const Transactions = () => {
  const { t, i18n } = useTranslation();
  const { passenger } = usePassenger();
  // ... rest of the component

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // ✅ Fetch Real Payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // On récupère les paiements ET l'historique pour croiser les données (stratégie ultime)
        const [paymentsRes, historyRes] = await Promise.all([
          tripService.getPayments({ limit: 100 }),
          tripService.getPassengerHistory({ limit: 100 })
        ]);

        if (paymentsRes.data.succes) {
          const trips = historyRes.data.trajets || [];
          const formattedTransactions = paymentsRes.data.paiements.map(p => {
            const sameId = (id1, id2) => {
              if (!id1 || !id2) return false;
              const s1 = typeof id1 === 'object' ? (id1._id || id1.id || id1) : id1;
              const s2 = typeof id2 === 'object' ? (id2._id || id2.id || id2) : id2;
              return String(s1) === String(s2);
            };

            const relatedTrip = trips.find(t =>
              sameId(t._id, p.trajet) || sameId(t._id, p.reservation) ||
              sameId(t.reservation, p.reservation) || sameId(t.trajet, p.trajet) ||
              sameId(t._id, p.reservationId) || sameId(t.reservation?._id, p.reservation)
            );

            return {
              id: p._id,
              date: new Date(p.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US'),
              time: new Date(p.createdAt).toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
              type: (p.type === 'PAIEMENT_TRAJET' || p.reservation || p.trajet) ? 'Paiement trajet' : (p.type === 'RECHARGE' ? 'Recharge' : 'Autre'),
              amount: -(p.montantTotal || p.montant || 0),
              method: p.methode || p.method || p.paymentMethod || 'Espèces',
              status: (p.statut === 'PAYE' || p.status === 'success' || p.status === 'completed') ? 'completed' : (p.statut === 'ECHEC' ? 'failed' : 'pending'),
              reference: p.reference || `REF-${p._id.substring(0, 8)}`,
              details: (() => {
                const resObj = (p.reservation && typeof p.reservation === 'object') ? p.reservation : (p.trajet && typeof p.trajet === 'object' ? p.trajet : (relatedTrip || {}));

                // --- SCANNER CHAUFFEUR ULTRA-COMPLET (Version Nucléaire) ---
                const driverCandidates = [relatedTrip?.chauffeur, relatedTrip?.driver, p.chauffeur, p.driver, resObj.chauffeur, resObj.driver].filter(c => c && typeof c === 'object');

                // 1. Extraction du NOM (Fusion intelligente Prénom + Nom)
                let dName = '';
                let fName = ''; // Prénom
                let lName = ''; // Nom
                let fullN = ''; // Nom complet direct

                driverCandidates.forEach(c => {
                  const u = c.utilisateur || c.user || c;
                  if (u.prenom && !fName) fName = String(u.prenom).trim();
                  if (u.nom && !lName) lName = String(u.nom).trim();
                  if ((u.nomComplet || u.name || u.display_name) && !fullN) fullN = String(u.nomComplet || u.name || u.display_name).trim();
                });

                if (fullN && fullN.includes(' ')) dName = fullN;
                else if (fName && lName) dName = `${fName} ${lName}`;
                else dName = fullN || fName || lName || '';

                if (!dName || dName.length < 3) {
                  dName = p.driverName || p.chauffeurName || resObj.driverName || resObj.chauffeurName || relatedTrip?.driverName || 'Chauffeur TakaTaka';
                }

                // 2. Extraction du TÉLÉPHONE (Scan exhaustif total)
                let dPhone = '-';
                const phoneKeys = [
                  'telephone', 'phone', 'tel', 'mobile', 'phoneNumber', 'num_tel',
                  'driverPhone', 'chauffeurPhone', 'tel_chauffeur', 'driver_phone',
                  'chauffeur_phone', 'whatsapp', 'telChauffeur', 'numTelephone'
                ];

                const searchObjects = [
                  ...driverCandidates,
                  ...driverCandidates.map(c => c.utilisateur || c.user),
                  resObj,
                  p,
                  relatedTrip,
                  relatedTrip?.chauffeur,
                  relatedTrip?.driver
                ].filter(o => o && typeof o === 'object');

                for (const obj of searchObjects) {
                  for (const k of phoneKeys) {
                    const val = obj[k];
                    if (val && String(val).trim().length > 3 && !['N/A', '-', 'NULL', 'UNDEFINED'].includes(String(val).toUpperCase().trim())) {
                      dPhone = String(val).trim();
                      break;
                    }
                  }
                  if (dPhone !== '-') break;
                }

                // 3. Extraction du VÉHICULE
                let dVeh = 'Véhicule standard';
                for (const c of driverCandidates) {
                  const v = c.vehicule || c.vehicle || resObj.vehicule || resObj.vehicle;
                  if (v && typeof v === 'object') {
                    const vStr = [v.marque, v.modele, v.immatriculation || v.plaque].filter(Boolean).join(' ').trim();
                    if (vStr.length > 2 && !['N/A', '-', 'NULL'].includes(String(vStr).toUpperCase())) {
                      dVeh = vStr; break;
                    } else if (v.type && typeof v.type === 'string') {
                      dVeh = v.type; break;
                    }
                  } else if (typeof v === 'string' && v.trim().length > 2) {
                    dVeh = v.trim(); break;
                  }
                }

                // 4. Extraction de L'EMAIL
                let dEmail = '-';
                const eKeys = ['email', 'mail', 'courriel'];
                for (const obj of searchObjects) {
                  for (const k of eKeys) {
                    const val = obj[k];
                    if (val && typeof val === 'string' && val.includes('@')) {
                      dEmail = val.trim();
                      break;
                    }
                  }
                  if (dEmail !== '-') break;
                }

                const dep = resObj.depart || resObj.pointDepart?.adresse || relatedTrip?.departure || 'Trajet TakaTaka';
                const dest = resObj.destination || resObj.pointDestination?.adresse || relatedTrip?.destination || 'Destination';
                const dist = resObj.distanceKm || resObj.distance || relatedTrip?.distanceKm || relatedTrip?.distance || '0';
                const dur = resObj.dureeMin || resObj.duree || resObj.duration || relatedTrip?.dureeMin || relatedTrip?.duration || '0';

                return {
                  driverName: dName,
                  vehicleInfo: dVeh,
                  driverPhone: dPhone,
                  driverEmail: dEmail,
                  route: `${dep} → ${dest}`,
                  distance: String(dist).includes('km') ? dist : `${dist} km`,
                  duration: String(dur).includes('min') ? dur : `${dur} min`
                };
              })()
            };
          });
          setTransactions(formattedTransactions);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [i18n.language]);

  const filters = [
    { id: 'all', label: t('transactions.filters.all'), icon: BarChart3 },
    { id: 'payment', label: t('transactions.filters.payments'), icon: CreditCard },
    { id: 'refund', label: t('transactions.filters.refunds'), icon: RefreshCw },
    { id: 'cashback', label: t('transactions.filters.cashback'), icon: Gift },
    { id: 'failed', label: t('transactions.filters.failed'), icon: AlertCircle },
    { id: 'pending', label: t('transactions.filters.pending'), icon: Clock },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = activeFilter === 'all' ||
        (activeFilter === 'payment' && transaction.amount < 0) ||
        (activeFilter === 'refund' && transaction.type === 'Remboursement') ||
        (activeFilter === 'cashback' && transaction.type === 'Cashback') ||
        (activeFilter === 'failed' && transaction.status === 'failed') ||
        (activeFilter === 'pending' && transaction.status === 'pending');

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalIncome = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netBalance = totalIncome - totalExpenses;
    const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending').length;
    const failedTransactions = filteredTransactions.filter(t => t.status === 'failed').length;
    const averageTransaction = total > 0 ? (totalIncome + totalExpenses) / total : 0;

    return {
      total,
      totalIncome,
      totalExpenses,
      netBalance,
      pendingTransactions,
      failedTransactions,
      averageTransaction
    };
  }, [filteredTransactions]);

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleShareReceipt = (transaction) => {
    const shareText = t('transactions.messages.share_text', {
      type: transaction.type,
      amount: Math.abs(transaction.amount).toLocaleString(),
      date: transaction.date
    });

    if (navigator.share) {
      navigator.share({
        title: 'Reçu TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('transactions.messages.receipt_copied'));
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
    toast.success(t('transactions.messages.filters_reset'));
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    toast.success(t('transactions.messages.ref_copied'));
  };

  const handleShowInvoice = (transaction) => {
    // ❌ Fermer la modale de détails pour ne pas avoir d'overlay conflictuel
    setShowDetailsModal(false);

    // Transformer l'objet transaction pour qu'il soit compatible avec PremiumInvoice
    const formattedInvoice = {
      invoiceNumber: transaction.reference,
      date: transaction.date,
      transactionId: transaction.id,
      status: transaction.status === 'completed' ? 'paid' : 'pending',
      method: transaction.method,
      amount: `${Math.abs(transaction.amount).toLocaleString()} GNF`,
      passenger: {
        name: `${passenger?.prenom || ''} ${passenger?.nom || ''}`,
        phone: passenger?.telephone || '-',
        email: passenger?.email || '-'
      },
      driver: {
        name: transaction.details?.driverName || 'Chauffeur TakaTaka',
        vehicle: transaction.details?.vehicleInfo || 'Véhicule standard',
        phone: transaction.details?.driverPhone || '-',
        email: transaction.details?.driverEmail || '-'
      },
      trip: {
        route: transaction.details?.route || 'Trajet TakaTaka',
        distance: transaction.details?.distance || '0 km',
        duration: transaction.details?.duration || '0 min'
      },
      fees: {
        platform: 'Incl.'
      }
    };
    setInvoiceData(formattedInvoice);
    setShowInvoice(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête */}
        <CardHeader align="start" className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle size="xl" className="text-gray-900 dark:text-white">{t('transactions.title')}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('transactions.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportDropdown
                data={filteredTransactions}
                columns={[
                  { accessor: 'date', header: t('transactions.table.date') },
                  { accessor: 'type', header: t('transactions.table.type') },
                  { accessor: 'amount', header: t('transactions.table.amount') },
                  { accessor: 'method', header: t('transactions.table.method') },
                  { accessor: 'status', header: t('transactions.table.status') },
                  { accessor: 'reference', header: t('transactions.table.reference') }
                ]}
                fileName="transactions_takataka"
                title={t('transactions.title')}
                className="mr-2"
              />
              <Button
                variant="secondary"
                onClick={clearFilters}
                icon={RefreshCw}
              >
                {t('history.refresh')}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label={t('transactions.stats.total_transactions')}
            value={stats.total}
            icon={BarChart3}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label={t('transactions.stats.income')}
            value={`${stats.totalIncome.toLocaleString()} GNF`}
            icon={ArrowUpRight}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label={t('transactions.stats.pending')}
            value={stats.pendingTransactions}
            icon={Clock}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label={t('transactions.stats.expenses')}
            // Changed label from "Solde net" to "Dépenses totales" as it makes more sense for passenger
            value={`${stats.totalExpenses.toLocaleString()} GNF`}
            icon={Wallet}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"
          />
        </div>

        {/* Filtres */}
        <Card hoverable className="mb-8">
          <CardContent padding="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  placeholder={t('transactions.filters.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    active={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    icon={filter.icon}
                    label={filter.label}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des transactions */}
        <AnimatePresence mode="wait">
          {filteredTransactions.length > 0 ? (
            <motion.div
              key="transactions-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card hoverable>
                <CardContent padding="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr>
                          <TableHeader>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {t('transactions.table.date')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t('transactions.table.type')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <Coins className="w-4 h-4 mr-2" />
                              {t('transactions.table.amount')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <Smartphone className="w-4 h-4 mr-2" />
                              {t('transactions.table.method')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {t('transactions.table.status')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              {t('transactions.table.reference')}
                            </div>
                          </TableHeader>
                          <TableHeader>
                            <div className="flex items-center">
                              <MoreVertical className="w-4 h-4 mr-2" />
                              {t('transactions.table.actions')}
                            </div>
                          </TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTransactions.map((transaction) => {
                          const isPositive = transaction.amount > 0;

                          return (
                            <TableRow key={transaction.id} hoverable>
                              <TableCell>
                                <div onClick={() => handleViewDetails(transaction)} className="cursor-pointer group">
                                  <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">{transaction.date}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">14:35</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <TransactionTypeBadge type={transaction.type} amount={transaction.amount} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {isPositive ? (
                                    <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                                  ) : (
                                    <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400 mr-2" />
                                  )}
                                  <span className={`font-black text-lg ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {isPositive ? '+' : '-'} {Math.abs(transaction.amount).toLocaleString()} GNF
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{transaction.method}</span>
                              </TableCell>
                              <TableCell>
                                <TransactionStatusBadge status={transaction.status} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded font-mono text-gray-800 dark:text-gray-200">
                                    {transaction.reference}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    icon={Copy}
                                    onClick={() => handleCopyReference(transaction.reference)}
                                    className="ml-2"
                                    tooltip={t('transactions.details.copy')}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    icon={Eye}
                                    onClick={() => handleViewDetails(transaction)}
                                    tooltip={t('transactions.details.title')}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    icon={Share2}
                                    onClick={() => handleShareReceipt(transaction)}
                                    tooltip={t('transactions.details.share')}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>

                <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('transactions.pagination.showing')} <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> {t('transactions.pagination.to')}{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, filteredTransactions.length)}</span> {t('transactions.pagination.of')}{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</span> {t('transactions.pagination.results')}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={itemsPerPage}
                    totalItems={filteredTransactions.length}
                    showInfo={false}
                  />

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:border-primary-500 outline-none transition-all"
                  >
                    <option value={10}>10 {t('transactions.pagination.per_page')}</option>
                    <option value={25}>25 {t('transactions.pagination.per_page')}</option>
                    <option value={50}>50 {t('transactions.pagination.per_page')}</option>
                    <option value={100}>100 {t('transactions.pagination.per_page')}</option>
                  </select>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('transactions.messages.no_transactions')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{t('transactions.messages.no_transactions_desc')}</p>
                <Button
                  variant="primary"
                  onClick={clearFilters}
                  icon={RefreshCw}
                >
                  {t('transactions.messages.reset_filters')}
                </Button>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Modale de détails */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onShare={() => selectedTransaction && handleShareReceipt(selectedTransaction)}
        onShowInvoice={handleShowInvoice}
      />

      {/* Aperçu Facture */}
      <AnimatePresence>
        {showInvoice && (
          <PremiumInvoice
            payment={invoiceData}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;