import { useTranslation } from 'react-i18next';
import { Info, Phone, Play, CheckCircle, XCircle } from 'lucide-react';

const ReservationActionMenu = ({ reservation, actionPosition, actionMenuRef, onViewDetails, onCall, onStartTrip, onUpdateStatus }) => {
  const { t } = useTranslation();

  return (
    <div
      ref={actionMenuRef}
      className="z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-40 overflow-hidden"
      style={{ position: 'fixed', left: `${actionPosition.x}px`, top: `${actionPosition.y}px` }}
    >
      <button
        onClick={onViewDetails}
        className="flex items-center w-full px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
      >
        <Info className="w-3.5 h-3.5 mr-2 text-primaryGreen-start" /> Détails
      </button>
      <button onClick={onCall} className="flex items-center w-full px-3 py-2.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-700 text-left">
        <Phone className="w-3.5 h-3.5 mr-2" /> {t('planning.call')}
      </button>
      <button onClick={onStartTrip} className="flex items-center w-full px-3 py-2.5 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 border-b border-gray-100 dark:border-gray-700 text-left">
        <Play className="w-3.5 h-3.5 mr-2" /> {t('planning.start')}
      </button>
      <button onClick={() => onUpdateStatus('confirmée')} className="flex items-center w-full px-3 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-b border-gray-100 dark:border-gray-700 text-left">
        <CheckCircle className="w-3.5 h-3.5 mr-2" /> {t('common.confirm')}
      </button>
      <button onClick={() => onUpdateStatus('annulée')} className="flex items-center w-full px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-left">
        <XCircle className="w-3.5 h-3.5 mr-2" /> {t('common.cancel')}
      </button>
    </div>
  );
};

export default ReservationActionMenu;
