import { useTranslation } from 'react-i18next';
import { TrendingUp, X, User, Calendar, Smartphone, Mail, MapPin, Navigation, Clock, CheckCircle2, Hourglass, Printer } from 'lucide-react';
import { getFullAssetURL } from '../../../utils/urlHelper';

const RevenueDetailModal = ({ isOpen, onClose, ride, formatAmount, formatDate, getPaymentIcon, getPaymentLabel, onShowReceipt }) => {
    const { t } = useTranslation();
    if (!isOpen || !ride) return null;

    const getImageUrl = (path) => getFullAssetURL(path);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 min-w-0 truncate">
                        <TrendingUp className="w-5 h-5 text-blue-500 shrink-0" />
                        {t('revenues.details_title')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Passager Section */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">{t('revenues.passenger')}</p>
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm shrink-0">
                                {ride.passager?.photo ? (
                                    <img src={getImageUrl(ride.passager.photo)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-7 h-7 text-blue-500" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {ride.passager?.name || t('revenues.unknown_passenger')}
                                </h4>
                                <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                        {formatDate(ride.date)}
                                    </div>
                                    {(ride.passager?.telephone || ride.telephonePassager || ride.passager?.phone || ride.passager?.utilisateur?.telephone) && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold min-w-0">
                                            <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="truncate">{ride.passager?.telephone || ride.telephonePassager || ride.passager?.phone || ride.passager?.utilisateur?.telephone}</span>
                                        </div>
                                    )}
                                    {(ride.passager?.email || ride.emailPassager || ride.passager?.utilisateur?.email) && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold min-w-0">
                                            <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="truncate">{ride.passager?.email || ride.emailPassager || ride.passager?.utilisateur?.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trajet Section */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                </div>
                                <div className="w-0.5 h-10 bg-gray-200 dark:bg-gray-700 dotted border-l-2 border-dashed" />
                                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 space-y-6">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('revenues.pickup')}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.depart}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('revenues.destination')}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{ride.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Navigation className="w-5 h-5 text-purple-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{t('revenues.distance')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ride.distanceKm} km</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{t('revenues.duration')}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ride.dureeMin} min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Finance Section */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 min-w-0">
                                {getPaymentIcon(ride.paymentMethod)}
                                <span className="truncate">{t('revenues.payment_type')}</span>
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white shrink-0">{getPaymentLabel(ride.paymentMethod)}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('revenues.total_amount')}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatAmount(ride.montantBrut)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('revenues.commission_takataka')}</span>
                                <span className="font-semibold text-red-500">-{formatAmount(ride.commission)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-base font-bold text-gray-900 dark:text-white">{t('revenues.net_earning')}</span>
                                <span className="text-xl font-black text-green-600">{formatAmount(ride.net)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Statut du versement */}
                    <div className={`rounded-2xl p-4 border ${ride.verse
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                        }`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{t('revenues.payout_status')}</p>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {ride.verse
                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    : <Hourglass className="w-5 h-5 text-amber-600" />
                                }
                                <span className={`font-bold ${ride.verse
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {ride.verse ? t('revenues.paid') : t('revenues.pending')}
                                </span>
                            </div>
                            {ride.verse && ride.verseLe && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                                    {new Date(ride.verseLe).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onShowReceipt}
                        className="flex-1 min-h-[44px] py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        {t('revenues.receipt')}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 min-h-[44px] py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                        {t('revenues.close_details')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RevenueDetailModal;
