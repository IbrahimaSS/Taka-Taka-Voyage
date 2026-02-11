import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CreditCard, Smartphone, Gift, RefreshCw,
  Printer, Wallet, ArrowUpRight, ArrowDownRight,
  Filter, Search, Download, Eye, Share2,
  ChevronDown, X, TrendingUp, TrendingDown,
  FileText, CheckCircle, Clock, AlertCircle,
  Plus, MoreVertical, QrCode, Shield,
  BarChart3, PieChart, Receipt, Coins,
  Bell, MessageCircle, Link, Copy, Grid
} from 'lucide-react';

// Composants UI réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Table, { TableRow, TableCell, TableHeader } from '../admin/ui/Table';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import ExportDropdown from '../admin/ui/ExportDropdown';
import Pagination from '../admin/ui/Pagination';

// Context et services
import { usePassenger } from '../../context/PassengerContext';
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
  const config = {
    completed: {
      variant: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-400',
      icon: CheckCircle,
      label: 'Complété'
    },
    pending: {
      variant: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400',
      icon: Clock,
      label: 'En attente'
    },
    failed: {
      variant: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 dark:text-red-400',
      icon: AlertCircle,
      label: 'Échoué'
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
  const isIncome = amount > 0;

  const config = {
    'Paiement trajet': {
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
    },
    'Remboursement': {
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20'
    },
    'Cashback': {
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
    },
    'Recharge': {
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
    }
  };

  const typeConfig = config[type] || {
    color: isIncome ? 'text-emerald-600' : 'text-rose-600',
    bgColor: isIncome ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20' : 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
      {type}
    </span>
  );
};

const TransactionDetailsModal = ({ transaction, isOpen, onClose, onShare }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Détails de la transaction"
    size="md"
  >
    {transaction && (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700/50 p-6 rounded-xl flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction #{transaction.reference}</p>
            <p className={`text-3xl font-bold mt-1 ${transaction.amount > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} GNF
            </p>
          </div>
          <TransactionStatusBadge status={transaction.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Date et heure</p>
            <p className="font-semibold text-gray-900 dark:text-white">{transaction.date} - 14:35</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
            <p className="font-semibold text-gray-900 dark:text-white">{transaction.type}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Méthode de paiement</p>
          <p className="font-semibold text-gray-900 dark:text-white">{transaction.method}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Référence</p>
          <div className="flex items-center justify-between mt-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono text-gray-800 dark:text-gray-200">{transaction.reference}</code>
            <Button
              variant="ghost"
              size="small"
              icon={Copy}
              onClick={() => {
                navigator.clipboard.writeText(transaction.reference);
                toast.success('Référence copiée');
              }}
            >
              Copier
            </Button>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={onShare}
            icon={Share2}
            className="flex-1"
          >
            Partager
          </Button>
        </div>
      </div>
    )}
  </Modal>
);

// --- Composant Principal ---

const Transactions = () => {
  const { transactions: initialTransactions } = usePassenger();

  const [transactions] = useState(initialTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filters = [
    { id: 'all', label: 'Toutes', icon: BarChart3 },
    { id: 'payment', label: 'Paiements', icon: CreditCard },
    { id: 'refund', label: 'Remboursements', icon: RefreshCw },
    { id: 'cashback', label: 'Cashback', icon: Gift },
    { id: 'failed', label: 'Échouées', icon: AlertCircle },
    { id: 'pending', label: 'En attente', icon: Clock },
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
    const shareText = `Reçu TakaTaka : ${transaction.type} de ${Math.abs(transaction.amount).toLocaleString()} GNF le ${transaction.date}`;

    if (navigator.share) {
      navigator.share({
        title: 'Reçu TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Reçu copié dans le presse-papier');
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
    toast.success('Filtres réinitialisés');
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    toast.success('Référence copiée');
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête */}
        <CardHeader align="start" className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle size="xl" className="text-gray-900 dark:text-white">Historique des transactions</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Suivez tous vos paiements et recharges</p>
            </div>
            <div className="flex items-center space-x-3">
              <ExportDropdown
                data={filteredTransactions}
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'type', label: 'Type' },
                  { key: 'amount', label: 'Montant' },
                  { key: 'method', label: 'Méthode' },
                  { key: 'status', label: 'Statut' },
                  { key: 'reference', label: 'Référence' }
                ]}
                fileName="transactions_takataka"
                title="Historique des transactions"
                className="mr-2"
              />
              <Button
                variant="secondary"
                onClick={clearFilters}
                icon={RefreshCw}
              >
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Transactions"
            value={stats.total}
            icon={BarChart3}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label="Revenus"
            value={`${stats.totalIncome.toLocaleString()} GNF`}
            icon={ArrowUpRight}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label="En attente"
            value={stats.pendingTransactions}
            icon={Clock}
            colorClass="bg-gradient-to-r from-primary-500 to-secondary-600"

          />
          <StatCard
            label="Solde net"
            value={`${stats.netBalance.toLocaleString()} GNF`}
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
                  placeholder="Rechercher par type, référence ou méthode..."
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

                    <thead>
                      <tr>
                        <TableHeader>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            DATE
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            TYPE
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <Coins className="w-4 h-4 mr-2" />
                            MONTANT
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <Smartphone className="w-4 h-4 mr-2" />
                            MÉTHODE
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            STATUT
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            RÉFÉRENCE
                          </div>
                        </TableHeader>
                        <TableHeader>
                          <div className="flex items-center">
                            <MoreVertical className="w-4 h-4 mr-2" />
                            ACTIONS
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
                                  tooltip="Copier la référence"
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
                                  tooltip="Voir les détails"
                                />
                                <Button
                                  variant="ghost"
                                  size="small"
                                  icon={Share2}
                                  onClick={() => handleShareReceipt(transaction)}
                                  tooltip="Partager le reçu"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </tbody>
                  </div>
                </CardContent>

                <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Affichage de <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> à{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, filteredTransactions.length)}</span> sur{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</span> transactions
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
                    <option value={10}>10 par page</option>
                    <option value={25}>25 par page</option>
                    <option value={50}>50 par page</option>
                    <option value={100}>100 par page</option>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucune transaction trouvée</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Essayez de modifier vos critères de recherche</p>
                <Button
                  variant="primary"
                  onClick={clearFilters}
                  icon={RefreshCw}
                >
                  Réinitialiser les filtres
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
      />
    </div>
  );
};

export default Transactions;