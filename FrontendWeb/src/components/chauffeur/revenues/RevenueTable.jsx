import { useTranslation } from 'react-i18next';
import { Calendar, Car, CheckCircle2, Hourglass, Eye } from 'lucide-react';
import Card from '../../admin/ui/Card';
import Badge from '../../admin/ui/Badge';
import { getPaymentIcon, getPaymentLabel } from './paymentMethodUtils';

const PayoutBadge = ({ verse, t }) => (
    <Badge variant={verse ? 'success' : 'warning'} size="xs" className="shrink-0 gap-1">
        {verse
            ? <><CheckCircle2 className="w-3 h-3" /> {t('revenues.paid')}</>
            : <><Hourglass className="w-3 h-3" /> {t('revenues.pending')}</>
        }
    </Badge>
);

// Carte mobile (< lg) : une course = une carte empilée, lisible sans defiler horizontalement
const RevenueCard = ({ ride, formatAmount, formatDate, onView, t }) => (
    <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <Car className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{ride.trajet}</span>
            </div>
            <button
                onClick={() => onView(ride)}
                className="w-11 h-11 flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                title="Voir les détails"
            >
                <Eye className="w-5 h-5" />
            </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {formatDate(ride.date.split('T')[0])}
        </div>

        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full w-fit shrink-0">
                {getPaymentIcon(ride.paymentMethod)}
                <span className="font-bold text-gray-900 dark:text-white text-[10px] uppercase">
                    {getPaymentLabel(ride.paymentMethod, t)}
                </span>
            </div>

            <div className="text-right">
                <p className="font-black text-green-600">{formatAmount(ride.net)}</p>
                <PayoutBadge verse={ride.verse} t={t} />
            </div>
        </div>
    </div>
);

const RevenueTable = ({ filteredData, formatAmount, formatDate, onViewRide }) => {
    const { t } = useTranslation();

    return (
        <Card padding="p-0" animate={false} className="!rounded-xl !shadow-lg dark:!border-gray-700 overflow-hidden">
            <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    <div className="col-span-2">{t('revenues.date')}</div>
                    <div className="col-span-3">{t('revenues.trip')}</div>
                    <div className="col-span-2">{t('revenues.payment')}</div>
                    <div className="col-span-2 text-right">{t('revenues.amount')}</div>
                    <div className="col-span-2 text-right">{t('revenues.net')}</div>
                    <div className="col-span-1 text-center">{t('revenues.actions')}</div>
                </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.length > 0 ? (
                    filteredData.map((ride) => (
                        <div key={ride.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            {/* Vue carte mobile/tablette */}
                            <div className="lg:hidden">
                                <RevenueCard ride={ride} formatAmount={formatAmount} formatDate={formatDate} onView={onViewRide} t={t} />
                            </div>

                            {/* Vue tableau desktop */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 items-center text-sm px-6 py-4">
                                <div className="col-span-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(ride.date.split('T')[0])}</span>
                                </div>

                                <div className="col-span-3 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Car className="w-4 h-4 text-blue-500 shrink-0" />
                                        <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{ride.trajet}</span>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full w-fit">
                                        {getPaymentIcon(ride.paymentMethod)}
                                        <span className="font-bold text-gray-900 dark:text-white text-[10px] uppercase">
                                            {getPaymentLabel(ride.paymentMethod, t)}
                                        </span>
                                    </div>
                                </div>

                                <div className="col-span-2 font-medium text-gray-500 text-right">
                                    {formatAmount(ride.montantBrut)}
                                </div>

                                <div className="col-span-2 text-right">
                                    <p className="font-black text-green-600">{formatAmount(ride.net)}</p>
                                    <div className="mt-1 flex justify-end">
                                        <PayoutBadge verse={ride.verse} t={t} />
                                    </div>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <button
                                        onClick={() => onViewRide(ride)}
                                        className="p-2.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                                        title="Voir les détails"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400 italic">
                        {t('revenues.no_data')}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default RevenueTable;
