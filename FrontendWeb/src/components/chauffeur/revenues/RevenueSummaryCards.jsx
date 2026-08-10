import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, TrendingUp, Car } from 'lucide-react';

const SummaryCard = ({ label, value, icon: Icon, iconBg, iconColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all hover:shadow-xl">
        <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{label}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2 truncate">
                    {value}
                </h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
        </div>
    </div>
);

const RevenueSummaryCards = ({ summaryData, formatAmount }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label={t('revenues.daily')} value={formatAmount(summaryData.daily)} icon={DollarSign} iconBg="bg-green-500/10" iconColor="text-green-500" />
            <SummaryCard label={t('revenues.weekly')} value={formatAmount(summaryData.weekly)} icon={Calendar} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
            <SummaryCard label={t('revenues.monthly')} value={formatAmount(summaryData.monthly)} icon={TrendingUp} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
            <SummaryCard label={t('revenues.paid_rides')} value={summaryData.paidRides} icon={Car} iconBg="bg-orange-500/10" iconColor="text-orange-500" />
        </div>
    );
};

export default RevenueSummaryCards;
