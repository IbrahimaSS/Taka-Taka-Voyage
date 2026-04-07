import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, 
  Search, Filter, Download, MoreVertical, Eye, Clock, 
  Check, X, Shield, DollarSign, User, Calendar, MapPin, Smartphone, Info,
  Printer, FileText
} from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Card, { CardContent } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Bttn';
import Pagination from '../ui/Pagination';
import StatCard from '../layout/StatCard';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import ExportDropdown from '../ui/ExportDropdown';
import PremiumInvoice from '../ui/PremiumInvoice';
import { socketService } from '../../../services/socketService';
import { getFullAssetURL } from '../../../utils/urlHelper';

const Transactions = ({ showToast }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', type: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [confirmModal, setConfirmModal] = useState({ show: false, transaction: null, status: null });
  const [detailsModal, setDetailsModal] = useState({ show: false, transaction: null });
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTxForInvoice, setSelectedTxForInvoice] = useState(null);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [page, filter.status, filter.type]);

  // ✅ AUTO-REFRESH ON REAL-TIME NOTIFICATIONS
  useEffect(() => {
    const handleAutoRefresh = () => {
      console.log("🔄 [ADMIN_TRANSACTIONS] Notification reçue, actualisation des données...");
      fetchData();
      fetchStats();
    };

    socketService.on("admin:notification", handleAutoRefresh);
    socketService.on("admin:withdraw_alert", handleAutoRefresh);

    return () => {
      socketService.off("admin:notification", handleAutoRefresh);
      socketService.off("admin:withdraw_alert", handleAutoRefresh);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTransactionList({ 
        page, 
        status: filter.status, 
        type: filter.type, 
        search: filter.search 
      });
      if (res.data.succes) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast('Erreur', 'Impossible de charger les transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await adminService.getTransactionStats();
      if (res.data.succes) setStats(res.data);
    } catch (err) {
      console.error("Erreur stats wallet:", err);
    }
  };

  const handleUpdateStatus = async (id, status, comment = '') => {
    try {
      const res = await adminService.updateTransactionStatus(id, status, comment);
      if (res.data.succes) {
        showToast('Succès', `Transaction ${status.toLowerCase()} avec succès`, 'success');
        fetchData();
        fetchStats();
      }
    } catch (err) {
      showToast('Erreur', err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setConfirmModal({ show: false, transaction: null, status: null });
    }
  };

  const statusConfig = {
    'EN_ATTENTE': { label: 'En attente', color: 'warning', icon: Clock },
    'COMPLETE': { label: 'Terminé', color: 'success', icon: CheckCircle },
    'ANNULE': { label: 'Annulé', color: 'danger', icon: XCircle },
    'ECHOUE': { label: 'Échoué', color: 'danger', icon: XCircle },
  };

  const typeConfig = {
    'DEPOT': { label: 'Dépôt', icon: ArrowDownRight, color: 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' },
    'RETRAIT': { label: 'Retrait', icon: ArrowUpRight, color: 'text-rose-500 bg-rose-50/50 dark:bg-rose-500/10' },
    'TRANSFERT_ENVOI': { label: 'Envoi', icon: ArrowUpRight, color: 'text-blue-500 bg-blue-50/50 dark:bg-blue-500/10' },
    'TRANSFERT_RECU': { label: 'Réception', icon: ArrowDownRight, color: 'text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' },
    'PAIEMENT_TRAJET': { label: 'Paiement', icon: ArrowUpRight, color: 'text-slate-500 bg-slate-50/50 dark:bg-slate-500/10' },
  };

  const mapToInvoice = (tx) => {
    if (!tx) return null;
    return {
      type: 'transaction',
      reference: tx.reference || `TX-${tx._id.substring(18).toUpperCase()}`,
      amount: `${tx.montant.toLocaleString()} GNF`,
      date: new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: tx.methode?.replace('_', ' '),
      status: tx.statut === 'COMPLETE' ? 'paid' : 'pending',
      passenger: {
        name: `${tx.utilisateur?.prenom} ${tx.utilisateur?.nom}`,
        phone: tx.utilisateur?.telephone,
        email: tx.utilisateur?.email || '-'
      },
      driver: {
        name: 'Service Taka Taka Portefeuille',
        vehicle: tx.type === 'DEPOT' ? 'RECHARGE COMPTE' : tx.type === 'RETRAIT' ? 'RETRAIT DE FONDS' : 'TRANSFERT',
        phone: 'Support Taka Taka',
        email: 'support@takataka.com'
      },
      trip: {
        route: `${typeConfig[tx.type]?.label || tx.type} PORTEFEUILLE`,
        distance: 'N/A',
        duration: 'Instantané'
      }
    };
  };

  // Correction des colonnes pour l'export (doit correspondre à buildTable dans exporters.js)
  const exportColumns = [
    { header: 'Réf', accessor: (row) => row.reference || row._id.substring(18).toUpperCase() },
    { header: 'Utilisateur', accessor: (row) => `${row.utilisateur?.prenom} ${row.utilisateur?.nom}` },
    { header: 'Téléphone', accessor: 'utilisateur.telephone' },
    { header: 'Type', accessor: (row) => typeConfig[row.type]?.label || row.type },
    { header: 'Montant', accessor: (row) => `${row.montant.toLocaleString()} GNF` },
    { header: 'Méthode', accessor: 'methode' },
    { header: 'Statut', accessor: 'statut' },
    { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  const inputClasses = "w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400";
  const selectClasses = "px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700 dark:text-slate-200 cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Solde Global" value={`${(stats?.totalUsersBalance || 0).toLocaleString()} GNF`} icon={Wallet} color="emerald" subtitle="Argent total sur la plateforme" />
        <StatCard title="Retraits en attente" value={stats?.pendingWithdrawals || 0} icon={Clock} color="warning" subtitle="Demandes à valider" />
        <StatCard title="Dépôts Totaux" value={`${(stats?.stats?.find(s => s._id === 'DEPOT')?.totalMontant || 0).toLocaleString()} GNF`} icon={ArrowDownRight} color="blue" subtitle="Cumul des recharges" />
        <StatCard title="Retraits Totaux" value={`${(stats?.stats?.find(s => s._id === 'RETRAIT')?.totalMontant || 0).toLocaleString()} GNF`} icon={ArrowUpRight} color="rose" subtitle="Cumul des décaissements" />
      </div>

      <Card className="border-slate-200 dark:border-slate-700/50 overflow-visible">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Rechercher un utilisateur, téléphone..." className={inputClasses} value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchData()} />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select className={selectClasses} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                <option value="all">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="COMPLETE">Terminés</option>
                <option value="ANNULE">Annulés</option>
              </select>
              <select className={selectClasses} value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
                <option value="all">Tous les types</option>
                <option value="DEPOT">Dépôts</option>
                <option value="RETRAIT">Retraits</option>
                <option value="TRANSFERT_ENVOI">Transferts</option>
              </select>
              <ExportDropdown data={transactions} columns={exportColumns} fileName="transactions_wallet" title="Historique Portefeuille" showToast={showToast} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700/50">
        <Table headers={['Utilisateur', 'Type', 'Montant', 'Méthode', 'Statut', 'Date', 'Actions']} loading={loading}>
          {transactions.map((tx) => (
            <TableRow key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-sm font-bold text-slate-600 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {tx.utilisateur?.photoUrl ? (
                      <img src={getFullAssetURL(tx.utilisateur.photoUrl)} className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tx.utilisateur.prenom}+${tx.utilisateur.nom}&background=random`; }} />
                    ) : tx.utilisateur?.prenom?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{tx.utilisateur?.prenom} {tx.utilisateur?.nom}</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1 tracking-wider">{tx.utilisateur?.role} • {tx.utilisateur?.telephone}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${typeConfig[tx.type]?.color}`}>{React.createElement(typeConfig[tx.type]?.icon || Shield, { size: 14 })}</div>
                  <span className="text-xs font-semibold">{typeConfig[tx.type]?.label || tx.type}</span>
                </div>
              </TableCell>
              <TableCell>
                <p className={`font-black text-sm ${['DEPOT', 'TRANSFERT_RECU'].includes(tx.type) ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {['DEPOT', 'TRANSFERT_RECU'].includes(tx.type) ? '+' : '-'} {tx.montant.toLocaleString()} GNF
                </p>
              </TableCell>
              <TableCell><Badge variant="ghost" size="sm" className="font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{tx.methode?.replace('_', ' ')}</Badge></TableCell>
              <TableCell><Badge variant={statusConfig[tx.statut]?.color || 'gray'} size="sm" className="flex items-center gap-1.5 w-fit font-bold shadow-sm">{React.createElement(statusConfig[tx.statut]?.icon || Clock, { size: 12 })}{statusConfig[tx.statut]?.label || tx.statut}</Badge></TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                <p className="font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                <p className="text-slate-400">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
                  {tx.type === 'RETRAIT' && tx.statut === 'EN_ATTENTE' ? (
                    <>
                      <button onClick={() => setConfirmModal({ show: true, transaction: tx, status: 'COMPLETE' })} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 rounded-xl transition-all border border-transparent hover:border-emerald-200" title="Valider"><Check size={18} /></button>
                      <button onClick={() => setConfirmModal({ show: true, transaction: tx, status: 'ANNULE' })} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-200" title="Annuler"><X size={18} /></button>
                    </>
                  ) : (
                    <button onClick={() => setDetailsModal({ show: true, transaction: tx })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400 rounded-xl transition-all border border-transparent hover:border-slate-200"><Eye size={18} /></button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, transaction: null, status: null })}
        title={confirmModal.status === 'COMPLETE' ? "Confirmer le retrait" : "Annuler le retrait"}
        message={confirmModal.status === 'COMPLETE' 
          ? `Voulez-vous confirmer le versement de ${(confirmModal.transaction?.montant || 0).toLocaleString()} GNF ?`
          : `L'annulation remboursera automatiquement ${(confirmModal.transaction?.montant || 0).toLocaleString()} GNF.`
        }
        confirmText={confirmModal.status === 'COMPLETE' ? "Valider" : "Annuler et rembourser"}
        confirmVariant={confirmModal.status === 'COMPLETE' ? 'success' : 'danger'}
        onConfirm={() => handleUpdateStatus(confirmModal.transaction?._id, confirmModal.status)}
      />

      <Modal isOpen={detailsModal.show} onClose={() => setDetailsModal({ show: false, transaction: null })} title="Détails de la transaction">
        {detailsModal.transaction && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${typeConfig[detailsModal.transaction.type]?.color} shadow-sm`}>{React.createElement(typeConfig[detailsModal.transaction.type]?.icon || Shield, { size: 24 })}</div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{typeConfig[detailsModal.transaction.type]?.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{detailsModal.transaction.montant.toLocaleString()} GNF</p>
                </div>
              </div>
              <Badge variant={statusConfig[detailsModal.transaction.statut]?.color} size="lg">{statusConfig[detailsModal.transaction.statut]?.label}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5"><Calendar size={12}/> Date</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{new Date(detailsModal.transaction.createdAt).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5"><Smartphone size={12}/> Méthode</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{detailsModal.transaction.methode?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-[10px] text-emerald-600 uppercase font-bold mb-3 flex items-center gap-1.5"><User size={12}/> Utilisateur</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">{detailsModal.transaction.utilisateur?.prenom?.[0]}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{detailsModal.transaction.utilisateur?.prenom} {detailsModal.transaction.utilisateur?.nom}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{detailsModal.transaction.utilisateur?.telephone}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDetailsModal({ show: false, transaction: null })}>Fermer</Button>
              <Button variant="perso" icon={Printer} onClick={() => { 
                  setSelectedTxForInvoice(detailsModal.transaction);
                  setDetailsModal({ show: false, transaction: null }); // FERME la modale détails pour masquer derrière la facture
                  setShowInvoice(true); 
                }}>
                Télécharger Reçu
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Facture Premium - Toujours au premier plan (z-100) */}
      <AnimatePresence>
        {showInvoice && selectedTxForInvoice && (
          <PremiumInvoice payment={mapToInvoice(selectedTxForInvoice)} onClose={() => setShowInvoice(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
