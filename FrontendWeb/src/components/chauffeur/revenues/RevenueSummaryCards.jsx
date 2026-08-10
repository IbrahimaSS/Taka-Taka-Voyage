import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, TrendingUp, Car } from 'lucide-react';
import StatCard from '../../admin/layout/StatCard';

const RevenueSummaryCards = ({ summaryData, formatAmount }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={t('revenues.daily')} value={formatAmount(summaryData.daily)} icon={DollarSign} />
            <StatCard title={t('revenues.weekly')} value={formatAmount(summaryData.weekly)} icon={Calendar} />
            <StatCard title={t('revenues.monthly')} value={formatAmount(summaryData.monthly)} icon={TrendingUp} />
            <StatCard title={t('revenues.paid_rides')} value={summaryData.paidRides} icon={Car} />
        </div>
    );
};

export default RevenueSummaryCards;
