import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Eye, CheckCircle, XCircle } from 'lucide-react';

// Composant pour les actions rapides dans le tableau
const TableActions = ({ dispute, onView, onResolve, onReject, onDelete }) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50"
          >
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onView(dispute);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                {t('trips.view_details', 'Voir détails')}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onResolve(dispute);
                  setShowActions(false);
                }}
                disabled={dispute.status === 'resolved'}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {t('disputes.resolve', 'Résoudre')}
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                onClick={() => {
                  onReject(dispute);
                  setShowActions(false);
                }}
                disabled={dispute.status === 'rejected'}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                {t('disputes.reject', 'Rejeter')}
              </button>
              <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableActions;
