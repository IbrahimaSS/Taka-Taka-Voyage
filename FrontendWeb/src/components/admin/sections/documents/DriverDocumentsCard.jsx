import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../ui/Card';
import { getFullAssetURL } from '../../../../utils/urlHelper';

const DriverDocumentsCard = ({ driver, index, onSelect }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        hoverable
        className="h-full  transition-all duration-300 hover:shadow-lg cursor-pointer"
        onClick={() => onSelect(driver)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 overflow-hidden shadow-sm">
                {driver.photoUrl ? (
                  <img src={getFullAssetURL(driver.photoUrl)} className="w-full h-full object-cover" />
                ) : (
                  driver.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{driver.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t('users.driver', 'Chauffeur')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="space-y-4">

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{driver.validCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-bold">{t('common.valid', 'Valides')}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{driver.pendingCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-bold">{t('trips.status.pending', 'En attente')}</p>
              </div>
            </div>

            {/* Documents requis manquants */}
            {driver.completeness < 100 && (
              <div className="mt-4 pt-4 border-t dark:border-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('documents.missing_required_docs', 'Documents requis manquants:')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {driver.manquants.map((label, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DriverDocumentsCard;
