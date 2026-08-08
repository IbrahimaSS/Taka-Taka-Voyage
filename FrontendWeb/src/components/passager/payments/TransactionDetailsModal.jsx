import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Copy, Receipt, Share2 } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Modal from '../../admin/ui/Modal';
import TransactionStatusBadge from './TransactionStatusBadge';

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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
};

export default TransactionDetailsModal;
