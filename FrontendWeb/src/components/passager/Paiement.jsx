import { AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';

// Composants UI réutilisables
import PremiumInvoice from '../admin/ui/PremiumInvoice';

import { useTransactions } from './payments/useTransactions';
import { useTransactionActions } from './payments/useTransactionActions';
import TransactionsHeader from './payments/TransactionsHeader';
import TransactionsStatsRow from './payments/TransactionsStatsRow';
import TransactionsFilterBar from './payments/TransactionsFilterBar';
import TransactionsTable from './payments/TransactionsTable';
import TransactionsEmptyState from './payments/TransactionsEmptyState';
import TransactionDetailsModal from './payments/TransactionDetailsModal';

const Transactions = () => {
  const {
    loading,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    activeFilter, setActiveFilter,
    searchTerm, setSearchTerm,
    filters,
    filteredTransactions, currentTransactions,
    totalPages, startIndex, endIndex,
    stats,
    clearFilters,
  } = useTransactions();

  const {
    selectedTransaction,
    showDetailsModal, setShowDetailsModal,
    showInvoice, setShowInvoice,
    invoiceData,
    handleViewDetails,
    handleShareReceipt,
    handleCopyReference,
    handleShowInvoice,
  } = useTransactionActions();

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
        <TransactionsHeader filteredTransactions={filteredTransactions} onClearFilters={clearFilters} />

        <TransactionsStatsRow stats={stats} />

        <TransactionsFilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <AnimatePresence mode="wait">
          {filteredTransactions.length > 0 ? (
            <TransactionsTable
              currentTransactions={currentTransactions}
              onViewDetails={handleViewDetails}
              onShareReceipt={handleShareReceipt}
              onCopyReference={handleCopyReference}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={filteredTransactions.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          ) : (
            <TransactionsEmptyState onClearFilters={clearFilters} />
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
