import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, Navigation } from 'lucide-react';

export const STATUS_CONFIG = {
    pending: {
        label: 'Demandes',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Clock className="w-4 h-4" />,
    },
    accepted: {
        label: 'Acceptés',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle className="w-4 h-4" />,
    },
    in_progress: {
        label: 'En cours',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Navigation className="w-4 h-4" />,
    }
};

const TripStatusFilters = ({ selectedStatus, setSelectedStatus, stats, backendTrips }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 min-h-[44px] text-sm font-bold rounded-xl transition-all ${selectedStatus === 'all'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                    }`}
            >
                {t('common.all')} ({stats.total})
            </button>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 min-h-[44px] text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${selectedStatus === status
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {config.icon}
                    {t(`trips.status.${status}`)}
                    <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${selectedStatus === status ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {backendTrips.filter(t => t.status === status).length}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TripStatusFilters;
