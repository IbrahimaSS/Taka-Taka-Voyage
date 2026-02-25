import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/tripService';
import planningService from '../../services/planningService';
import useNotifications from '../../hooks/useNotificationsAudio';
import { toast } from 'react-hot-toast';
import { Bell, Clock, MapPin, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * ReservationReminder
 * Background monitor for scheduled trips.
 * Notifies the user 30 minutes before a planned trip with a loud alert.
 */
const ReservationReminder = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { playNotificationSound, vibrate, showSystemNotification } = useNotifications();
    const [reservations, setReservations] = useState([]);
    const notifiedIds = useRef(new Set());
    const [alertActive, setAlertActive] = useState(null);

    // Loud alert sound URL (using a clear, persistent sound)
    const ALERT_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'; // Clear digital beep/alarm
    const alarmAudio = useRef(new Audio(ALERT_SOUND_URL));

    const fetchReservations = useCallback(async () => {
        if (!user) return;
        try {
            let res;
            if (user.role === 'CHAUFFEUR' || user.role === 'DRIVER') {
                res = await tripService.getDriverPlannings();
            } else {
                res = await planningService.getPlanning({ limit: 50, statut: 'ACCEPTEE' });
            }

            if (res.data?.succes || res.succes) {
                const list = res.data?.plannings || res.plannings || [];
                setReservations(list);
            }
        } catch (error) {
            console.error('[Reminder] Error fetching reservations:', error);
        }
    }, [user]);

    // Initial fetch and periodic refresh
    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 5 * 60 * 1000); // Refresh list every 5 minutes
        return () => clearInterval(interval);
    }, [fetchReservations]);

    // Check for upcoming trips every minute
    useEffect(() => {
        const checkUpcoming = () => {
            const now = new Date();
            const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);
            const alertWindowStart = new Date(now.getTime() + 25 * 60 * 1000);
            const alertWindowEnd = new Date(now.getTime() + 35 * 60 * 1000);

            reservations.forEach(res => {
                const tripTime = new Date(res.datePlanifiee);

                // Only notify if status is ACCEPTED/ACCEPTED
                if (!(res.statut === 'ACCEPTEE' || res.statut === 'ACCEPTED')) return;

                if (tripTime >= alertWindowStart && tripTime <= alertWindowEnd) {
                    if (!notifiedIds.current.has(res._id)) {
                        triggerAlert(res);
                        notifiedIds.current.add(res._id);
                    }
                }
            });
        };

        const triggerAlert = (res) => {
            console.log(`🔔 [Reminder] Triggering 30-min alert for trip ${res._id}`);

            // 1. Play loud sound
            alarmAudio.current.loop = true;
            alarmAudio.current.volume = 1.0;
            alarmAudio.current.play().catch(e => console.warn('Could not play alarm:', e));

            // 2. Visual Toast
            setAlertActive(res);

            // 3. System Notification
            showSystemNotification(t('notifications.reminder_30min_title', 'Départ dans 30 minutes !'), {
                body: `${res.depart} → ${res.destination}\nSoyez prêt pour votre trajet TakaTaka.`,
                requireInteraction: true,
                tag: `reminder-${res._id}`
            });

            // 4. Vibrate
            vibrate([500, 200, 500, 200, 500]);
        };

        const timer = setInterval(checkUpcoming, 30 * 1000); // Check every 30 seconds
        return () => clearInterval(timer);
    }, [reservations, showSystemNotification, t, vibrate]);

    const stopAlert = () => {
        if (alarmAudio.current) {
            alarmAudio.current.pause();
            alarmAudio.current.currentTime = 0;
        }
        setAlertActive(null);
    };

    if (!alertActive) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-bounce-in">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Bell className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">RAPPEL DE TRAJET</h2>
                    <p className="text-white/80">Votre course démarre dans environ 30 minutes !</p>
                </div>

                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Départ</p>
                                <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{alertActive.depart}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Heure prévue</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {new Date(alertActive.datePlanifiee).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={stopAlert}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Check className="w-6 h-6" />
                        Compris, j'arrive !
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}</style>
        </div>
    );
};

export default ReservationReminder;
