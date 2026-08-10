import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Phone, Activity, CheckCircle, Flag as FlagIcon, Clock as ClockIcon, QrCode
} from 'lucide-react';
import Badge from '../../admin/ui/Badge';
import Button from '../../admin/ui/Bttn';
import Card, { CardContent } from '../../admin/ui/Card';
import ConfirmModal from '../../admin/ui/ConfirmModal';

const StatsPanel = ({
    acceptedTrips,
    currentTime,
    speed,
    tripStep,
    activeTrip,
    onCallPassenger,
    signalArrival,
    startTripImmediately,
    navigate,
    progress,
    distanceDisplay,
    etaMinutes,
    onOpenScanner,
    hasScannedTicket,
}) => {
    const { t } = useTranslation();
    const totalRevenue = acceptedTrips.reduce((acc, t) => acc + (t.estimatedFare || 0), 0);
    const pickedUpCount = acceptedTrips.filter(t => t.pickupStatus === 'picked_up' || t.pickupStatus === 'arrived').length;
    const pendingCount = acceptedTrips.length - pickedUpCount;

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        action: null
    });

    const handleConfirm = (action) => {
        setConfirmModal({ isOpen: true, type: 'info', action });
    };

    const handleConfirmAction = () => {
        if (confirmModal.action) confirmModal.action();
        setConfirmModal({ isOpen: false, type: '', action: null });
    };

    return (
        <>
            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                                <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white truncate">
                                    {tripStep === 'idle' && t('tracking.step_idle')}
                                    {tripStep === 'to_pickup' && t('tracking.step_to_pickup')}
                                    {tripStep === 'at_pickup' && t('tracking.step_at_pickup')}
                                    {tripStep === 'ready_to_start' && t('tracking.step_ready_to_start')}
                                    {tripStep === 'in_progress' && t('tracking.step_in_progress')}
                                </h2>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <Badge variant={pendingCount > 0 ? "warning" : "success"}>
                                        {t('tracking.on_board_count', { pickedUp: pickedUpCount, total: acceptedTrips.length })}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <ClockIcon className="w-4 h-4" />
                                        {currentTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 flex-1 md:flex-none md:min-w-[120px]">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                                    {t('tracking.revenue_label')}
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {totalRevenue.toLocaleString()} <span className="text-sm">{t('common.currency_symbol_short')}</span>
                                </p>
                            </div>
                            <div className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 flex-1 md:flex-none md:min-w-[120px]">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                                    {t('tracking.speed_label')}
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {speed} <span className="text-sm">{t('tracking.speed_unit')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {(tripStep === 'in_progress' || tripStep === 'to_pickup') && (
                        <div className="mt-6 border-t pt-4 border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {tripStep === 'to_pickup' ? t('tracking.to_client') : t('tracking.to_destination')}
                                    </p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {distanceDisplay} • {etaMinutes} min
                                    </p>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    className="bg-emerald-500 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* 1. SIGNALER L'ARRIVÉE */}
                {tripStep === 'to_pickup' && activeTrip && (
                    <Button
                        variant="primary"
                        size="large"
                        icon={CheckCircle}
                        onClick={() => handleConfirm(signalArrival)}
                        fullWidth
                        className="h-12"
                    >
                        {t('tracking.signal_arrival')}
                    </Button>
                )}

                {/* 2. SCANNER LE TICKET (Grisé si pas arrivé) */}
                {activeTrip && (tripStep === 'to_pickup' || tripStep === 'at_pickup') && !hasScannedTicket && (
                    <Button
                        variant="primary"
                        size="large"
                        icon={QrCode}
                        onClick={onOpenScanner}
                        fullWidth
                        disabled={tripStep !== 'at_pickup'}
                        className={`h-12 shadow-lg ${tripStep !== 'at_pickup' ? 'opacity-40 grayscale cursor-not-allowed bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                    >
                        {tripStep !== 'at_pickup' ? 'Attendre arrivée pour scanner' : 'Scanner le Ticket'}
                    </Button>
                )}

                {/* 3. DÉMARRER LA COURSE (Seulement après Scan) */}
                {activeTrip && hasScannedTicket && tripStep !== 'in_progress' && (
                    <Button
                        variant="success"
                        size="large"
                        icon={FlagIcon}
                        onClick={() => {
                            if (activeTrip?.id) {
                                startTripImmediately(activeTrip.id);
                                navigate('/chauffeur/live-tracking');
                            }
                        }}
                        fullWidth
                        className="h-12 shadow-lg shadow-emerald-500/30 font-bold"
                    >
                        {t('tracking.start_trip')}
                    </Button>
                )}

                {/* 4. APPELER LE PASSAGER */}
                {activeTrip && tripStep !== 'in_progress' && (
                    <Button
                        variant="outline"
                        size="large"
                        icon={Phone}
                        onClick={() => onCallPassenger(activeTrip.passengerPhone)}
                        fullWidth
                        className="h-12"
                    >
                        {t('tracking.call_passenger')}
                    </Button>
                )}
            </div>

            {/* Modal de confirmation */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', action: null })}
                onConfirm={handleConfirmAction}
                title={t('tracking.confirm_action')}
                message={
                    tripStep === 'to_pickup' ? t('tracking.confirm_arrival_msg') :
                        tripStep === 'at_pickup' ? t('tracking.confirm_pickup_msg') :
                            t('tracking.confirm_start_msg')
                }
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type="info"
            />
        </>
    );
};

export default StatsPanel;
