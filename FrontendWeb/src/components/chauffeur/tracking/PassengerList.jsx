import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import Badge from '../../admin/ui/Badge';
import Button from '../../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const PassengerList = ({
    acceptedTrips,
    currentPickupTripId,
    selectPickupTrip,
}) => {
    const { t } = useTranslation();
    const pendingTrips = acceptedTrips.filter(t => t.pickupStatus !== 'picked_up');

    return (
        <Card hoverable animate>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle size="lg">{t('tracking.pickup_list')}</CardTitle>
                    <Badge variant={pendingTrips.length > 0 ? "warning" : "success"} className='text-xs'>
                        {t('tracking.n_pending', { count: pendingTrips.length })}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingTrips.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('tracking.to_collect')}
                        </p>
                        <AnimatePresence mode="popLayout">
                            {pendingTrips.map((trip) => (
                                <motion.div
                                    key={trip.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ scale: 1.01 }}
                                    className={`p-4 rounded-xl border transition-all duration-300 ${currentPickupTripId === trip.id
                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/50'
                                        }`}
                                >
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentPickupTripId === trip.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {trip.passengerName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {trip.pickupAddress}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                size="small"
                                                variant={currentPickupTripId === trip.id ? "primary" : "success"}
                                                onClick={() => {
                                                    if (trip.pickupStatus !== 'picked_up') {
                                                        selectPickupTrip(trip.id);
                                                    }
                                                }}
                                                className='w-full h-11'
                                                disabled={trip.pickupStatus === 'picked_up'}
                                            >
                                                {trip.pickupStatus === 'approaching' && t('tracking.status_approaching')}
                                                {trip.pickupStatus === 'arrived' && t('tracking.status_arrived')}
                                                {trip.pickupStatus === 'picked_up' && t('tracking.status_picked_up')}
                                                {trip.pickupStatus === 'pending' && t('tracking.status_to_join')}
                                                {!['approaching', 'arrived', 'picked_up', 'pending'].includes(trip.pickupStatus) && t('tracking.status_to_join')}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PassengerList;
