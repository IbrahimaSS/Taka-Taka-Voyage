import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, FileSpreadsheet, MoreVertical, Eye, Download, RefreshCw } from 'lucide-react';

// Composant pour les actions de paiement
const PaymentActions = ({ payment, onView, onDownload, onRefund, onExport }) => {
  const { t } = useTranslation();
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
                  {t('payments.export_pdf')}
                </button>
                <button
                  onClick={() => {
                    onExport?.(payment, 'csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                  {t('payments.export_csv')}
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
                  {t('payments.refund')}
                </button>
              )}
              <button
                onClick={() => {
                  onExport?.(payment, 'print');
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200">
                <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                {t('payments.print')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentActions;
