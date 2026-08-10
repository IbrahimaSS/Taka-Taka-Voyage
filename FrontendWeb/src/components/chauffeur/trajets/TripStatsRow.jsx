import { useTranslation } from 'react-i18next';
import { Clock, Car, DollarSign, RefreshCw } from 'lucide-react';

const StatTile = ({ label, value, icon: Icon, iconBg, iconColor, valueColor = 'text-gray-900 dark:text-white' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">{label}</p>
                <p className={`text-2xl font-black mt-1 truncate ${valueColor}`}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const TripStatsRow = ({ stats, isOnline, i18n }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
                label={t('trips.requests')}
                value={stats.pending}
                icon={Clock}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-500"
            />
            <StatTile
                label={t('trips.active')}
                value={stats.active}
                icon={Car}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-500"
            />
            <StatTile
                label={t('trips.earning_today')}
                value={`${(stats.totalEarnings || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fr-FR')} ${t('common.currency_symbol_short')}`}
                icon={DollarSign}
                iconBg="bg-green-500/10"
                iconColor="text-green-500"
                valueColor="text-green-600"
            />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`w-3 h-3 shrink-0 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} rounded-full`} />
                            <span className={`text-sm font-bold truncate ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? t('common.online') : t('common.offline')}
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <RefreshCw className={`w-6 h-6 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripStatsRow;
