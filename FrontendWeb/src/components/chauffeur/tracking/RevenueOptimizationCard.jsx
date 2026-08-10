import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';

const RevenueOptimizationCard = ({ acceptedTrips }) => {
    const { t } = useTranslation();
    const totalRevenue = acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0);

    return (
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium text-blue-100 opacity-90 uppercase tracking-wider">
                            {t('tracking.estimated_revenue')}
                        </p>
                        <p className="text-3xl font-bold mt-2">
                            {totalRevenue.toLocaleString()} <span className="text-xl">{t('common.currency_symbol_short')}</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-100 opacity-90">{t('tracking.optimization')}</span>
                        <span className="font-semibold">{t('tracking.carpooling_active')}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                            className="bg-emerald-400 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-100 opacity-90">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t('tracking.optimal_performance')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RevenueOptimizationCard;
