import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, RefreshCw, MoreVertical, FileDown } from 'lucide-react';

// Composant pour les actions rapides
const ReportActions = ({ report, onView, onGenerate, onExport, isMobile }) => {
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

  // Version mobile : boutons inline
  if (isMobile) {
    return (
      <div className="flex space-x-2">
        <button
          className="p-2 bg-blue-50 text-blue-600 rounded-lg"
          onClick={() => onView(report)}
          aria-label="Voir détails"
        >
          <Eye className="w-4 h-4" />
        </button>
        {report.status === 'generated' ? (
          <button
            className="p-2 bg-green-50 text-green-600 rounded-lg"
            onClick={() => onGenerate(report)}
            aria-label="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>
        ) : (
          <button
            className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"
            onClick={() => onGenerate(report)}
            aria-label="Regénérer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Version desktop : menu déroulant
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition"
        onClick={() => setShowActions(!showActions)}
        aria-label="Actions du rapport"
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
                  onView(report);
                  setShowActions(false);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                {t('trips.view_details', 'Voir détails')}
              </button>
              {report.status === 'generated' ? (
                <>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                    onClick={() => {
                      onGenerate(report);
                      setShowActions(false);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2 text-green-500" />
                    {t('reports.download', 'Télécharger')}
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                    onClick={() => {
                      onExport(report);
                      setShowActions(false);
                    }}
                  >
                    <FileDown className="w-4 h-4 mr-2 text-blue-500" />
                    {t('common.export_now', 'Exporter...')}
                  </button>
                </>
              ) : (
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 flex items-center text-sm text-gray-700 dark:text-gray-200"
                  onClick={() => {
                    onGenerate(report);
                    setShowActions(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-yellow-500" />
                  {t('common.regenerate', 'Regénérer')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportActions;
