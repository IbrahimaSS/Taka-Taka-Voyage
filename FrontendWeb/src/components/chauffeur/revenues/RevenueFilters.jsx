import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import { getPaymentIcon, getPaymentLabel } from './paymentMethodUtils';

const RevenueFilters = ({ selectedPeriod, setSelectedPeriod, selectedPaymentMethod, setSelectedPaymentMethod }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('revenues.filters_label')}</span>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.period')}</span>
                        <div className="flex gap-1 flex-wrap">
                            {["today", "week", "month"].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPeriod(p)}
                                    className={`px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${selectedPeriod === p ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {p === "today" ? t('revenues.today') : p === "week" ? t('revenues.this_week') : t('revenues.this_month')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{t('revenues.payment')}</span>
                        <div className="flex gap-1 flex-wrap">
                            {["all", "cash", "orange", "mtn", "card"].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedPaymentMethod(m)}
                                    className={`px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${selectedPaymentMethod === m ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {m !== "all" && getPaymentIcon(m)}
                                    {m === "all" ? t('revenues.all') : getPaymentLabel(m, t)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueFilters;
