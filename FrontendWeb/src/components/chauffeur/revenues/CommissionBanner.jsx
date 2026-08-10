import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';

const CommissionBanner = ({ totalCommission, totalNet, formatAmount }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-500 shrink-0" />
                        {t('revenues.commission_applied')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('revenues.rate')} : <span className="font-bold text-orange-600 dark:text-orange-400">10%</span> par course
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {t('revenues.total_commissions')} :{' '}
                        <span className="font-bold text-red-600 dark:text-red-400">
                            {formatAmount(totalCommission)}
                        </span>
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatAmount(totalNet)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('revenues.net_gain')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionBanner;
