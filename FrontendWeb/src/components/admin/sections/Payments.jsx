// src/components/sections/Payments.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Tabs from '../ui/Tabs';
import Pagination from '../ui/Pagination';
import {
  DollarSign, Repeat, Hourglass, Percent,
  Smartphone, CreditCard,
  CheckCircle, XCircle,
  RefreshCw, AlertCircle,
  Wallet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../../services/adminService';
import PremiumInvoice from '../ui/PremiumInvoice';
import ExportDropdown from '../ui/ExportDropdown';
import { exportToCSV, exportToPDF, exportToWord } from '../../../utils/exporters';
import { mapBackendPaymentToFrontend } from './payments/paymentMapper';
import MethodIcon from './payments/MethodIcon';
import Avatar from './payments/Avatar';
import { getMethodBadge, getStatusBadge } from './payments/paymentBadges';
import PaymentActions from './payments/PaymentActions';
import MobilePaymentCard from './payments/MobilePaymentCard';
import PaymentDetailsModal from './payments/PaymentDetailsModal';
import RefundModal from './payments/RefundModal';
import PaymentsCharts from './payments/PaymentsCharts';
import PaymentsFilterBar from './payments/PaymentsFilterBar';

// TODO API (admin/paiements):
// Remplacer les donnees simulees et les actions locales par des appels backend
// Exemple: GET API_ROUTES.payments.list, POST API_ROUTES.payments.confirm
const Payments = ({ showToast }) => {
  const { t } = useTranslation();
  // États principaux
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState(null);

  const [timeRange, setTimeRange] = useState('30j');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
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
    { header: "N°", accessor: (p, i) => i + 1 },
    { header: t('trips.passenger'), accessor: (p) => p.passenger.name },
    { header: t('trips.driver'), accessor: (p) => p.driver.name },
    { header: t('payments.amount'), accessor: 'amount' },
    { header: t('payments.method'), accessor: 'method' },
    { header: t('trips.date'), accessor: 'date' },
    { header: t('common.status'), accessor: 'status' },
    { header: t('payments.txn_id'), accessor: 'transactionId' },
  ], [t]);

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
        title: t('payments.total_revenue'),
        value: `${(totalRevenue || 0).toLocaleString()} GNF`,
        icon: DollarSign,
        color: "green",
        trend: "up",
        percentage: payRate,
        progress: payRate,
        subtitle: `${totalPayes} ${t('payments.settled_payments')}`
      },
      {
        title: t('payments.total_payments'),
        value: (totalCount || 0).toString(),
        icon: Repeat,
        color: "blue",
        trend: "up",
        percentage: payRate,
        progress: payRate,
        subtitle: `${totalPayes} ${t('history.status.completed').toLowerCase()}, ${totalEnAttente} ${t('history.status.pending').toLowerCase()}`
      },
      {
        title: t('payments.platform_commission'),
        value: `${(totalCommission || 0).toLocaleString()} GNF`,
        icon: Percent,
        color: "purple",
        trend: "up",
        percentage: commissionRate,
        progress: commissionRate,
        subtitle: `~${commissionRate}% ${t('payments.of_revenue')}`
      }
    ];
  }, [payments, apiStats]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Si backend data dispo
    if (revenueData.length > 0) {
      return {
        revenueChart: {
          labels: revenueData.map(d => new Date(d.label).toLocaleDateString()),
          datasets: [{
            label: t('payments.total_revenue') + ' (GNF)',
            data: revenueData.map(d => d.revenus),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: t('payments.platform_commission') + ' (GNF)',
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
      const matchesType = typeFilter === 'all' ||
        (payment.trip.vehicleType && payment.trip.vehicleType.toUpperCase() === typeFilter.toUpperCase());
      const matchesArchive = archiveFilter === 'all' ||
        (archiveFilter === 'archived' && payment.archived) ||
        (archiveFilter === 'not-archived' && !payment.archived);

      // Filtre date
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(payment.rawDate) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(payment.rawDate) <= endDate;
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesType && matchesArchive && matchesDate;
    });
  }, [payments, search, paymentFilter, methodFilter, typeFilter, archiveFilter, dateRange]);

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
    const data = [payment];
    const fileName = `paiement_${payment.id}`;
    const title = t('payments.details_title');

    const options = {
      data,
      columns: exportColumns,
      fileName,
      title,
      onToast: (t, m, s) => showToast(t, m, s)
    };

    switch (format) {
      case 'csv': exportToCSV(options); break;
      case 'pdf': exportToPDF(options); break;
      case 'word':
      case 'doc':
        exportToWord(options);
        break;
      default: exportToPDF(options);
    }
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

  // Configuration des tabs
  const tabs = [
    { id: 'all', label: t('history.status.all'), icon: DollarSign },
    { id: 'paid', label: t('history.status.completed'), icon: CheckCircle },
    { id: 'pending', label: t('history.status.pending'), icon: Hourglass },
    { id: 'failed', label: t('history.status.cancelled'), icon: XCircle },
    { id: 'refunded', label: t('payments.refunded_payments'), icon: RefreshCw }
  ];


  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">


      {/* Modales */}
      <div key="modals-container">
        <PaymentDetailsModal
          payment={modalState.selectedPayment}
          isOpen={modalState.showDetails}
          onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
          onDownload={handleDownloadInvoice}
          showToast={showToast}
        />
        <RefundModal
          payment={modalState.selectedPayment}
          isOpen={modalState.showRefund}
          onClose={() => setModalState(prev => ({ ...prev, showRefund: false }))}
          onConfirm={handleRefundPayment}
          loading={modalState.loading}
        />
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('payments.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{t('payments.subtitle')}</p>
        </div>

        <ExportDropdown
          data={selectedPayments.length > 0 ? payments.filter(p => selectedPayments.includes(p.id)) : payments}
          columns={exportColumns}
          fileName="paiements_taka_taka"
          title={t('payments.title')}
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
      <PaymentsCharts
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        chartData={chartData}
        paymentMethods={paymentMethods}
      />

      {/* Recherche et filtres */}
      <PaymentsFilterBar
        search={search}
        onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={(value) => { setPaymentFilter(value); setCurrentPage(1); }}
        methodFilter={methodFilter}
        onMethodFilterChange={(value) => { setMethodFilter(value); setCurrentPage(1); }}
        typeFilter={typeFilter}
        onTypeFilterChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

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
              <CardTitle>{t('payments.transactions')} ({filteredPayments.length})</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedPayments.length > 0 && `${selectedPayments.length} ${t('common.selected', 'sélectionné(s)')} • `}
                {t('common.showing_n_of_m', { n: paginatedPayments.length, m: filteredPayments.length, defaultValue: `${paginatedPayments.length} affiché(s) sur ${filteredPayments.length}` })}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('common.show', 'Afficher')}:</span>
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
                t('trips.passenger'),
                t('trips.driver'),
                t('trips.route'),
                t('service', 'Service'),
                t('payments.method', 'Mode'),
                t('trips.amount'),
                t('common.status', 'Statut'),
                t('trips.actions')
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {payment.trip.vehicleType === 'MOTO' || payment.trip.vehicleType === 'MOTO_TAXI' ? t('services.moto_taxi', 'Moto-taxi') :
                        payment.trip.vehicleType === 'TAXI' || payment.trip.vehicleType === 'TAXI_PARTAGE' ? t('services.taxi_partage', 'Taxi partagé') :
                          payment.trip.vehicleType === 'PARTICULIER' || payment.trip.vehicleType === 'VOITURE_PRIVEE' ? t('services.voiture_privee', 'Voiture privée') :
                            payment.trip.vehicleType}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getMethodBadge(payment.method, t)}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{payment.amount}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status, t)}
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
              <p className="text-gray-500 dark:text-gray-400">{t('payments.no_payment_found', 'Aucune transaction trouvée')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {t('common.try_modifying_filters')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default Payments;

