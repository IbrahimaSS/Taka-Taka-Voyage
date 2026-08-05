// src/components/sections/Commissions.jsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, CheckCircle, Clock, Percent,
  HandCoins, ChartPie, UserCheck, DollarSign, Eye,
  TrendingUp, Calendar, Sliders, Wallet, Plus,
  ChevronDown, MoreVertical, Trash2, Edit3, FileText,
  FileSpreadsheet, FileDown, RefreshCw, ChevronRight,
  XCircle, AlertCircle, BarChart3, Users, Target, CreditCard,
  Mail, Phone, MapPin, Car, User, File, MessageSquare, Shield, X, Loader2
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
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';
import { adminService } from '../../../services/adminService';
import { useTranslation } from 'react-i18next';
import { getFullAssetURL } from '../../../utils/urlHelper';
import DriverAvatar from './commissions/DriverAvatar';
import PaymentActions from './commissions/PaymentActions';

// Helper pour formater les montants en GNF
const formatGNF = (value) => {
  if (value == null || isNaN(value)) return '0 GNF';
  return Number(value).toLocaleString('fr-FR') + ' GNF';
};

const Commissions = ({ showToast }) => {
  const { t } = useTranslation();
  // ============ DONNÉES RÉELLES (API) ============
  const [payments, setPayments] = useState([]);
  const [statsCards, setStatsCards] = useState({ ceMois: 0, aVerser: 0, chauffeursPayes: 0 });
  const [evolutionData, setEvolutionData] = useState([]);
  const [repartitionData, setRepartitionData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  // ============ FILTRES & UI ============
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // ============ MODALES ============
  const [modalState, setModalState] = useState({
    showProcess: false,
    showDetails: false,
    showEdit: false,
    selectedPayment: null,
    loading: false
  });

  const [editForm, setEditForm] = useState({
    methode: 'ORANGE_MONEY',
    compte: '',
    commentaire: ''
  });

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ============ CHARGEMENT INITIAL (stats, graphiques) ============
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [statsRes, evolutionRes, repartitionRes] = await Promise.all([
          adminService.getCommissionStats(),
          adminService.getCommissionEvolution(),
          adminService.getCommissionRepartition()
        ]);
        if (statsRes.data?.succes) setStatsCards(statsRes.data.Cards);
        if (evolutionRes.data?.succes) setEvolutionData(evolutionRes.data.data || []);
        if (repartitionRes.data?.succes) setRepartitionData(repartitionRes.data.repartition || []);
      } catch (err) {
        console.error('Erreur chargement données commissions:', err);
        showToast(t('common.error'), t('commissions.error.load_data'), 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ============ CHARGEMENT LISTE (avec filtres, recherche, pagination) ============
  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: search.trim() || undefined,
      };
      // Mapper les tabs vers les statuts backend
      if (activeTab === 'pending') params.statut = 'A_PAYER';
      else if (activeTab === 'paid') params.statut = 'PAYE';
      // 'all' => pas de filtre statut

      const res = await adminService.getCommissionList(params);
      if (res.data?.succes) {
        setPayments(res.data.chauffeurs || []);
        setTotalItems(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Erreur chargement liste commissions:', err);
    } finally {
      setLoadingList(false);
    }
  }, [currentPage, pageSize, activeTab, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Initialiser le formulaire d'édition quand un paiement est sélectionné
  useEffect(() => {
    if (modalState.selectedPayment && modalState.showEdit) {
      const payment = modalState.selectedPayment;
      setEditForm({
        methode: payment.methode || 'ORANGE_MONEY',
        compte: payment.compte || '',
        commentaire: ''
      });
    }
  }, [modalState.selectedPayment, modalState.showEdit]);

  // Configuration des colonnes pour l'exportation
  const exportColumns = useMemo(() => [
    { header: "N°", accessor: (row, index) => index + 1 },
    { header: t('commissions.export.driver'), accessor: 'nom' },
    { header: t('commissions.export.email'), accessor: 'email' },
    { header: t('commissions.export.phone'), accessor: 'telephone' },
    {
      header: t('commissions.export.service'), accessor: 'service', formatter: (value) => {
        const labels = {
          MOTO: t('commissions.moto_taxi'),
          TAXI: t('commissions.taxi'),
          VOITURE: t('commissions.private_car'),
          BUS: t('commissions.bus')
        };
        return labels[value] || value;
      }
    },
    { header: t('commissions.export.revenue'), accessor: 'montantBrut', formatter: (value) => value?.toLocaleString('fr-FR') },
    { header: t('commissions.export.commission'), accessor: 'commission', formatter: (value) => value?.toLocaleString('fr-FR') },
    { header: t('commissions.export.to_pay'), accessor: 'montantNet', formatter: (value) => value?.toLocaleString('fr-FR') },
    {
      header: t('commissions.export.status'), accessor: 'statut', formatter: (value) => {
        return value === 'PAYE' ? t('history.status.completed') : t('commissions.to_pay');
      }
    },
    {
      header: t('commissions.export.method'), accessor: 'methode', formatter: (value) => {
        const labels = {
          ORANGE_MONEY: 'Orange Money',
          MTN_MONEY: 'MTN Money',
          CASH: t('payments.cash')
        };
        return labels[value] || value;
      }
    },
    { header: t('commissions.export.created_at'), accessor: 'createdAt', formatter: (value) => value ? new Date(value).toLocaleDateString('fr-FR') : 'N/A' },
  ], [t]);

  // Stats cards (basées sur les données backend)
  const stats = useMemo(() => [
    {
      title: t('commissions.commissions_this_month'),
      value: Number(statsCards.ceMois).toLocaleString('fr-FR'),
      icon: Percent,
      color: 'green',
      trend: 'up',
      percentage: 0,
      progress: 75,
      subtitle: t('commissions.commissions_month_desc')
    },
    {
      title: t('commissions.to_pay'),
      value: Number(statsCards.aVerser).toLocaleString('fr-FR'),
      icon: HandCoins,
      color: 'yellow',
      trend: 'stable',
      percentage: 0,
      progress: statsCards.ceMois > 0 ? (statsCards.aVerser / statsCards.ceMois) * 100 : 0,
      subtitle: t('commissions.to_pay_total_desc')
    },
    {
      title: t('commissions.paid_drivers'),
      value: statsCards.chauffeursPayes.toString(),
      icon: UserCheck,
      color: 'purple',
      trend: 'up',
      percentage: 0,
      progress: 50,
      subtitle: t('commissions.paid_drivers_desc')
    }
  ], [statsCards, t]);

  // ============ HANDLERS (VRAIS APPELS API) ============
  const handleProcessPayment = async (paymentId, comment = '') => {
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.processCommissionPayment(paymentId, comment);
      if (res.data?.succes) {
        showToast(t('commissions.toast.payout_processed_title'), t('commissions.toast.payout_processed_msg'), 'success');
        setModalState(prev => ({ ...prev, loading: false, showProcess: false }));
        fetchList(); // Recharger la liste
        // Recharger les stats
        const statsRes = await adminService.getCommissionStats();
        if (statsRes.data?.succes) setStatsCards(statsRes.data.Cards);
      } else {
        showToast(t('common.error'), res.data?.message || t('commissions.error.process_payout'), 'error');
        setModalState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error(err);
      showToast(t('common.error'), t('commissions.error.process_payout'), 'error');
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBulkProcess = async () => {
    if (selectedPayments.length === 0) {
      showToast(t('commissions.toast.none_selected_title'), t('commissions.toast.none_selected_msg'), 'warning');
      return;
    }
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      await Promise.all(selectedPayments.map(id => adminService.processCommissionPayment(id, 'Traitement en masse')));
      setSelectedPayments([]);
      setModalState(prev => ({ ...prev, loading: false }));
      showToast(t('commissions.toast.bulk_success_title'), t('commissions.toast.bulk_success_msg', { count: selectedPayments.length }), 'success');
      fetchList();
      const statsRes = await adminService.getCommissionStats();
      if (statsRes.data?.succes) setStatsCards(statsRes.data.Cards);
    } catch (err) {
      console.error(err);
      showToast(t('common.error'), t('commissions.error.bulk_process'), 'error');
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditPayment = async () => {
    if (!modalState.selectedPayment) return;
    setModalState(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.editCommissionPayment(modalState.selectedPayment.id, {
        methode: editForm.methode,
        compte: editForm.compte,
        commentaire: editForm.commentaire
      });
      if (res.data?.succes) {
        showToast(t('commissions.toast.edit_success_title'), t('commissions.toast.edit_success_msg'), 'success');
        setModalState(prev => ({ ...prev, loading: false, showEdit: false }));
        fetchList();
      } else {
        showToast(t('common.error'), res.data?.message || t('commissions.error.edit_payout'), 'error');
        setModalState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error(err);
      showToast(t('common.error'), t('commissions.error.edit_payout'), 'error');
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSelectPayment = (paymentId, checked) => {
    setSelectedPayments(prev =>
      checked ? [...prev, paymentId] : prev.filter(id => id !== paymentId)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPayments(payments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };



  const handleViewDetails = async (payment) => {
    setModalState(prev => ({ ...prev, showDetails: true, selectedPayment: payment, loading: true }));
    try {
      const res = await adminService.getCommissionDetails(payment.id);
      if (res.data?.succes) {
        setModalState(prev => ({ ...prev, selectedPayment: { ...payment, ...res.data.paiement }, loading: false }));
      } else {
        setModalState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error(err);
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenEdit = (payment) => {
    setModalState(prev => ({
      ...prev, showEdit: true, selectedPayment: payment, showDetails: false
    }));
  };

  // Configuration des tabs
  const commissionTabs = [
    { id: 'all', label: t('history.status.all'), icon: ChartPie },
    { id: 'pending', label: t('commissions.to_pay'), icon: Clock },
    { id: 'paid', label: t('history.status.completed'), icon: CheckCircle },
  ];

  // Helper pour afficher le statut
  const renderStatus = (status) => {
    if (status === 'PAYE') {
      return (
        <Badge variant="success">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('history.status.completed')}
        </Badge>
      );
    }
    // Style doux pour "À payer" — fond clair, texte coloré
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
        <Clock className="w-3 h-3 mr-1" />
        {t('commissions.to_pay')}
      </span>
    );
  };

  // Helper pour afficher le service
  const renderService = (service) => {
    const config = {
      MOTO: { label: t('commissions.moto_taxi'), color: 'green', icon: Car },
      TAXI: { label: t('commissions.taxi'), color: 'blue', icon: Car },
      VOITURE: { label: t('commissions.private_car'), color: 'purple', icon: Car },
      BUS: { label: t('commissions.bus'), color: 'orange', icon: Car }
    };
    const { label, color: c, icon: Icon } = config[service] || config.MOTO;
    return (
      <Badge className={`text-${c} bg-${c}-200 dark:bg-gray-900/40`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Helper pour afficher la méthode de paiement
  const renderPaymentMethod = (method) => {
    const config = {
      ORANGE_MONEY: { label: t('payments.orange_money'), color: 'orange', icon: CreditCard },
      MTN_MONEY: { label: t('payments.mobile_money'), color: 'yellow', icon: CreditCard },
      CASH: { label: t('payments.cash'), color: 'gray', icon: DollarSign }
    };
    const { label, color: c, icon: Icon } = config[method] || config.ORANGE_MONEY;
    return (
      <Badge variant="secondary" className={`bg-${c}-100 text-${c}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Fonction pour rendre le tableau responsive
  const renderResponsiveTable = () => {
    if (loadingList) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          <span className="ml-2 text-gray-500">{t('common.loading')}...</span>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="space-y-4">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">{payment.nom}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{payment.telephone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatus(payment.statut)}
                  {renderService(payment.service)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.montantBrut)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('payments.platform_commission')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.commission)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.to_pay')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.montantNet)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('payments.method')}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{renderPaymentMethod(payment.methode)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-900">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ''}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Eye}
                    onClick={() => handleViewDetails(payment)}
                    className="p-1"
                  />
                  {payment.statut === 'A_PAYER' && (
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
            t('trips.driver'),
            t('commissions.service'),
            t('commissions.revenue'),
            t('payments.platform_commission'),
            t('commissions.to_pay'),
            t('common.status'),
            { label: t('trips.actions'), className: 'text-right' }
          ]}
        >
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.nom}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('fr-FR') : ''}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {renderService(payment.service)}
              </TableCell>
              <TableCell>
                <div className="font-semibold text-gray-800 dark:text-gray-100">{formatGNF(payment.montantBrut)}</div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-gray-800 dark:text-gray-100">{formatGNF(payment.commission)}</div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-green-600 dark:text-green-400">{formatGNF(payment.montantNet)}</div>
              </TableCell>
              <TableCell>
                {renderStatus(payment.statut)}
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

  // Fonction de rendu pour le modal de détails (PAS un composant pour éviter le re-mount)
  const renderPaymentDetailsModal = () => {
    if (!modalState.selectedPayment) return null;
    const payment = modalState.selectedPayment;

    const getServiceLabel = (service) => {
      const config = {
        MOTO: t('commissions.moto_taxi'),
        TAXI: t('commissions.taxi'),
        VOITURE: t('commissions.private_car'),
        BUS: t('commissions.bus')
      };
      return config[service] || service;
    };

    // Données enrichies du backend (via detailsPaiementAdmin)
    const finances = payment.finances || {};
    const meta = payment.meta || {};
    const notes = payment.notes || [];
    const paiementInfo = payment.paiementInfo || {};
    const chauffeurDetails = payment.chauffeur || {};

    // Utilise les données enrichies si disponibles, sinon fallback sur les données de liste
    const montantBrut = finances.brut ?? payment.montantBrut ?? 0;
    const commission = finances.commission ?? payment.commission ?? 0;
    const aVerser = finances.aVerser ?? payment.montantNet ?? 0;

    const formatDetailDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } catch { return dateStr; }
    };

    return (
      <Modal
        isOpen={modalState.showDetails}
        onClose={() => setModalState(prev => ({ ...prev, showDetails: false }))}
        title={t('payments.details_title')}
        size="lg"
      >
        <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
          {modalState.loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <>
              {/* En-tête avec statut et infos */}
              <div className="flex flex-wrap gap-3 mb-6">
                {renderStatus(payment.statut)}
                {renderService(payment.service)}
                {renderPaymentMethod(payment.methode)}
                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDetailDate(meta.creeLe || payment.createdAt) || ''}
                </Badge>
              </div>

              {/* Grille d'informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations du chauffeur */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('commissions.driver_info')}</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <div className="mr-3">
                          <DriverAvatar photo={payment.photo} nom={chauffeurDetails.nom || payment.nom} size="md" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-100">{chauffeurDetails.nom || payment.nom}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{chauffeurDetails.telephone || payment.telephone}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(chauffeurDetails.email || payment.email) && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm">{chauffeurDetails.email || payment.email}</span>
                          </div>
                        )}
                        {(chauffeurDetails.telephone || payment.telephone) && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm">{chauffeurDetails.telephone || payment.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informations de paiement */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-3">{t('payments.tab_title')}</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('payments.method')} :</span>
                        <span className="font-medium">{renderPaymentMethod(payment.methode)}</span>
                      </div>
                      {paiementInfo.compte && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">{t('payments.account')} :</span>
                          <span className="font-medium text-gray-800 dark:text-gray-100">{paiementInfo.compte}</span>
                        </div>
                      )}
                      {paiementInfo.banque && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Banque :</span>
                          <span className="font-medium text-gray-800 dark:text-gray-100">{paiementInfo.banque}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails financiers */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('payments.financial_details')}</h3>
                    <div className="bg-slate-200/30 dark:bg-gray-800 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatGNF(montantBrut)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('payments.platform_commission')}</p>
                          <p className="text-2xl font-bold text-red-500">{formatGNF(commission)}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{t('commissions.to_pay')} :</span>
                          <span className="text-2xl font-bold text-green-600">
                            {formatGNF(aVerser)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('commissions.metadata')}</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('commissions.creation_date')} :</span>
                        <span className="font-medium">{formatDetailDate(meta.creeLe || payment.createdAt)}</span>
                      </div>
                      {meta.verseLe && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">{t('commissions.payment_date')} :</span>
                          <span className="font-medium text-green-600">{formatDetailDate(meta.verseLe)}</span>
                        </div>
                      )}
                      {meta.versePar && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">{t('commissions.processed_by')} :</span>
                          <span className="font-medium">
                            <Badge variant="secondary">
                              <Shield className="w-3 h-3 mr-1" />
                              {meta.versePar}
                            </Badge>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes admin */}
                  {notes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Notes</h3>
                      <div className="space-y-2">
                        {notes.map((note, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg p-3 text-sm ${note.type === 'admin'
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              {note.type === 'admin' ? (
                                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                              <span>{note.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  icon={X}
                  onClick={() => setModalState(prev => ({ ...prev, showDetails: false }))}
                  className="sm:w-auto"
                >
                  {t('common.close')}
                </Button>

                {payment.statut === 'A_PAYER' && (
                  <>
                    <Button
                      variant="primary"
                      icon={Edit3}
                      onClick={() => {
                        setModalState(prev => ({ ...prev, showDetails: false, showEdit: true }));
                      }}
                      className="sm:w-auto"
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="perso"
                      icon={CheckCircle}
                      onClick={() => {
                        setModalState(prev => ({ ...prev, showDetails: false, showProcess: true }));
                      }}
                      className="sm:w-auto"
                    >
                      {t('commissions.process_payment')}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Modal >
    );
  };

  // Fonction de rendu pour le modal d'édition (PAS un composant pour éviter le re-mount/flicker)
  const renderEditPaymentModal = () => {
    if (!modalState.selectedPayment) return null;
    const payment = modalState.selectedPayment;

    const getServiceLabelEdit = (service) => {
      const config = {
        MOTO: t('commissions.moto_taxi'),
        TAXI: t('commissions.taxi'),
        VOITURE: t('commissions.private_car'),
        BUS: t('commissions.bus')
      };
      return config[service] || service;
    };

    return (
      <Modal
        isOpen={modalState.showEdit}
        onClose={() => setModalState(prev => ({ ...prev, showEdit: false }))}
        title={t('payments.edit_title')}
        size="md"
      >
        <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-3">
              <div className="mr-3">
                <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{payment.nom}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{payment.telephone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.service')}</p>
                <p className="font-medium">{getServiceLabelEdit(payment.service)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
                <p className="font-medium">{formatGNF(payment.montantBrut)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('payments.method')}</label>
              <select
                value={editForm.methode}
                onChange={(e) => setEditForm(prev => ({ ...prev, methode: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="MTN_MONEY">MTN Mobile Money</option>
                <option value="CASH">Espèces</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('payments.account')}</label>
              <input
                type="text"
                value={editForm.compte}
                onChange={(e) => setEditForm(prev => ({ ...prev, compte: e.target.value }))}
                placeholder="+224 6XX XX XX XX"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('common.comment')} ({t('common.optional')})</label>
              <textarea
                value={editForm.commentaire}
                onChange={(e) => setEditForm(prev => ({ ...prev, commentaire: e.target.value }))}
                placeholder={t('common.comment_placeholder')}
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{t('commissions.recap')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('payments.platform_commission')} :</span>
                <span className="font-bold text-red-600">{formatGNF(payment.commission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('commissions.to_pay')} :</span>
                <span className="font-bold text-green-600">{formatGNF(payment.montantNet)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="secondary" onClick={() => setModalState(prev => ({ ...prev, showEdit: false }))}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" icon={CheckCircle} onClick={handleEditPayment} loading={modalState.loading}>
              {t('common.save_changes')}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Fonction utilitaire pour obtenir le libellé du service
  const getServiceLabel = (service) => {
    const config = {
      MOTO: t('commissions.moto_taxi'),
      TAXI: t('commissions.taxi'),
      VOITURE: t('commissions.private_car'),
      BUS: t('commissions.bus')
    };
    return config[service] || service;
  };

  // hauteur du graphique responsive
  const chartHeight = isMobile ? '220px' : '300px';

  return (
    <div className="space-y-4 md:space-y-6 px-2">


      {/* Modales de confirmation */}
      <ConfirmModal
        isOpen={modalState.showProcess}
        onClose={() => setModalState(prev => ({ ...prev, showProcess: false }))}
        onConfirm={(comment) => handleProcessPayment(modalState.selectedPayment?.id, comment)}
        title={t('payments.confirm_payment')}
        message={t('payments.confirm_payment_msg', { id: modalState.selectedPayment?.id })}
        type="validate"
        confirmText={t('payments.confirm_payment')}
        cancelText={t('common.cancel')}
        showComment={true}
        commentLabel={t('commissions.process_comment')}
        commentPlaceholder={t('common.comment_placeholder')}
        requireComment={false}
        loading={modalState.loading}
      />



      {/* Modal de détails */}
      {renderPaymentDetailsModal()}

      {/* Modal d'édition */}
      {renderEditPaymentModal()}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('commissions.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">{t('commissions.subtitle')}</p>
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
              <span className="hidden md:inline">{t('commissions.process_n', { count: selectedPayments.length })}</span>
              <span className="md:hidden">({selectedPayments.length})</span>
            </Button>
          )}

          {/* Utilisation du composant ExportDropdown */}
          <ExportDropdown
            data={payments}
            columns={exportColumns}
            fileName="commissions"
            title={t('commissions.export_title')}
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
            title={t('commissions.evolution_chart')}
            subtitle={t('commissions.real_data_subtitle')}
            chartConfig={{
              type: 'line',
              data: {
                labels: evolutionData.length > 0 ? evolutionData.map(d => d.label) : ['Aucune donnée'],
                datasets: [{
                  label: t('payments.platform_commission') + ' (GNF)',
                  data: evolutionData.length > 0 ? evolutionData.map(d => d.total) : [0],
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
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('commissions.repartition_service')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {repartitionData.length > 0 ? repartitionData.map((item, idx) => {
              const serviceLabels = {
                MOTO: t('commissions.moto_taxi'),
                TAXI: t('commissions.taxi'),
                VOITURE: t('commissions.private_car'),
                BUS: t('commissions.bus')
              };
              const serviceColors = { MOTO: 'green', TAXI: 'blue', VOITURE: 'purple', BUS: 'orange' };
              const label = serviceLabels[item.service] || item.service;
              const color = serviceColors[item.service] || 'gray';
              const colorClass = color === 'green' ? 'bg-green-500' : color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : color === 'orange' ? 'bg-orange-500' : 'bg-gray-500';
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.pourcentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${colorClass}`}
                      style={{ width: `${item.pourcentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatGNF(item.montant)}</p>
                </div>
              );
            }) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('commissions.no_repartition_data')}</p>
              </div>
            )}
            {repartitionData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('commissions.total_commissions')}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {formatGNF(repartitionData.reduce((sum, r) => sum + r.montant, 0))}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtre de recherche */}
      <Card hoverable={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder={t('commissions.search_placeholder')}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition text-sm md:text-base"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
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
                {activeTab === 'pending' ? t('commissions.pending_payments') :
                  activeTab === 'paid' ? t('commissions.paid_payments') : t('commissions.all_payments')}
                <span className="ml-2 text-gray-500 dark:text-gray-400">({totalItems})</span>
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedPayments.length > 0 && `${selectedPayments.length} ${t('common.selected').toLowerCase()} • `}
                {t('common.showing_n_of_m', { n: payments.length, m: totalItems })}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('common.show')} :</span>
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

          {!loadingList && payments.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('commissions.no_payment_found')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                {t('common.try_modifying_filters')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div >
  );
};

export default Commissions;
