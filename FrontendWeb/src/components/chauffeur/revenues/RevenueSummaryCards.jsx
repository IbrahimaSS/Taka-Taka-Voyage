import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, TrendingUp, Car } from 'lucide-react';
import StatCard from '../../admin/layout/StatCard';

const RevenueSummaryCards = ({ summaryData }) => {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={t('revenues.daily')} compactValue rawValue={summaryData.daily} unit="FG" icon={DollarSign} />
            <StatCard title={t('revenues.weekly')} compactValue rawValue={summaryData.weekly} unit="FG" icon={Calendar} />
            <StatCard title={t('revenues.monthly')} compactValue rawValue={summaryData.monthly} unit="FG" icon={TrendingUp} />
            <StatCard title={t('revenues.paid_rides')} value={summaryData.paidRides} icon={Car} />
        </div>
    );
};

export default RevenueSummaryCards;
