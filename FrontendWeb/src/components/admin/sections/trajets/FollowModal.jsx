import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Satellite, User, Car, Phone } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Bttn';
import LiveTripMap from '../../../maps/LiveTripMap';
import { socketService } from '../../../../services/socketService';
import { GeolocationService } from '../../../../services/geolocation';

// Extracted Modals to prevent re-renders inside main component
const FollowModal = ({ trip, isOpen, onClose, onFinish, showToast }) => {
  const { t } = useTranslation();
  const [realTimeProgress, setRealTimeProgress] = useState(0);
  const [driverPosition, setDriverPosition] = useState(null);
  const [metrics, setMetrics] = useState({ distanceTraveled: 0, distanceRemaining: 0, durationElapsed: 0 });
  const [trackingStatus, setTrackingStatus] = useState('initializing'); // initializing, connected, receiving, error

  useEffect(() => {
    if (isOpen && trip) {
      const roomID = trip._id;
      const joinRoom = () => {
        socketService.emit('reservation:join', { reservationId: roomID });
        setTrackingStatus('connected');
      };

      joinRoom();
      socketService.on('connect', joinRoom);

      const onJoinRefused = (data) => {
        setTrackingStatus('error');
        showToast({ type: 'error', title: t('trips.tracking_error_title'), message: data.message || t('trips.access_denied') });
      };

      const onJoinOk = (data) => {
        if (data.reservationId === roomID) setTrackingStatus('receiving');
      };

      socketService.on('reservation:join:refused', onJoinRefused);
      socketService.on('reservation:join:ok', onJoinOk);

      if (trip.startLocation) {
        setDriverPosition({ lat: trip.startLocation.lat, lng: trip.startLocation.lng });
      }

      const handlePositionUpdate = (data) => {
        if (data && String(data.reservationId) === String(roomID) && data.lat != null && data.lng != null) {
          if (trackingStatus !== 'receiving') setTrackingStatus('receiving');
          const newPos = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
          setDriverPosition(newPos);

          if (trip.startLocation && trip.endLocation) {
            const calcTotalDist = GeolocationService.calculateDistance(
              trip.startLocation.lat, trip.startLocation.lng,
              trip.endLocation.lat, trip.endLocation.lng
            );
            const rawDist = String(trip.distance || "0").replace(/[^\d.-]/g, '');
            let totalDist = parseFloat(rawDist) || calcTotalDist || 1;
            if (totalDist < 0.1) totalDist = calcTotalDist || 1;

            const distToDest = GeolocationService.calculateDistance(newPos.lat, newPos.lng, trip.endLocation.lat, trip.endLocation.lng);
            let progress = totalDist > 0 ? ((totalDist - distToDest) / totalDist) * 100 : 0;
            if (distToDest < 0.2) progress = 100;
            progress = Math.min(100, Math.max(0, progress));

            setRealTimeProgress(Math.round(progress));
            setMetrics({
              distanceTraveled: Math.max(0, totalDist - distToDest).toFixed(1),
              distanceRemaining: distToDest.toFixed(1),
              durationElapsed: Math.round((progress / 100) * (parseFloat(String(trip.duration || "0").replace(/[^\d.-]/g, '')) || 10))
            });
          }
        }
      };

      const handleTripEnd = (data) => {
        if (data.reservationId === roomID) {
          showToast({ type: 'success', title: 'Trajet terminé', message: 'Le chauffeur est arrivé.' });
          onFinish();
        }
      };

      socketService.on('position:chauffeur', handlePositionUpdate);
      socketService.on('course:arrive_destination', handleTripEnd);
      socketService.on('course:finit_avec_paiement', handleTripEnd);

      return () => {
        socketService.off('connect', joinRoom);
        socketService.off('reservation:join:refused', onJoinRefused);
        socketService.off('reservation:join:ok', onJoinOk);
        socketService.off('position:chauffeur', handlePositionUpdate);
        socketService.off('course:arrive_destination', handleTripEnd);
        socketService.off('course:finit_avec_paiement', handleTripEnd);
      };
    }
  }, [isOpen, trip, onFinish, showToast]);

  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
            <Satellite className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('trips.live_tracking_admin')}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.trip')} {trip.id}</p>
              <span className={`w-2 h-2 rounded-full ${trackingStatus === 'receiving' ? 'bg-emerald-500 animate-pulse' :
                trackingStatus === 'connected' ? 'bg-blue-500' :
                  trackingStatus === 'error' ? 'bg-rose-500' : 'bg-gray-400'
                }`} />
              <span className="text-[10px] uppercase font-bold text-gray-400">{t(`trips.tracking_${trackingStatus}`) || trackingStatus}</span>
            </div>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Carte de suivi en temps réel */}
        <LiveTripMap
          trip={trip}
          progress={realTimeProgress}
          currentLocation={driverPosition}
          height={320}
        />

        {/* Métriques de suivi */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{realTimeProgress}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.progression')}</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.distanceTraveled} km
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.traveled')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {metrics.durationElapsed} min
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('trips.elapsed')}</div>
          </div>
        </div>

        {/* Debug Info (Collapsible or just small text for now) */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-900 mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
            <span>{t('trips.diagnostic')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  console.log("🔄 [Admin] Manual re-join triggered");
                  socketService.emit('reservation:join', { reservationId: trip._id });
                }}
                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-[9px]"
              >
                {t('trips.rejoin')}
              </button>
              <span className={trackingStatus === 'receiving' ? 'text-emerald-500' : 'text-amber-500'}>{t(`trips.tracking_${trackingStatus}`) || trackingStatus}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
            <div className="text-gray-400">Room ID: <span className="text-gray-700 dark:text-gray-300 truncate inline-block w-24 align-bottom">{trip._id}</span></div>
            <div className="text-gray-400">Socket: <span className="text-gray-700 dark:text-gray-300 truncate inline-block w-24 align-bottom">{socketService.socket?.id || 'Déconnecté'}</span></div>
            <div className="text-gray-400">Status: <span className="text-gray-700 dark:text-gray-300">{trackingStatus}</span></div>
            <div className="text-gray-400">Métr.: <span className="text-gray-700 dark:text-gray-300">{trip.startLocation && trip.endLocation ? 'OK' : 'Manquant'}</span></div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('trips.progression')}</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{realTimeProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${realTimeProgress}%` }}
            />
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 text-white">
                <User size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.passenger')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="small"
              icon={Phone}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Appel',
                  message: `Appel vers ${trip.passenger.phone}...`
                });
              }}
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-3 text-white">
                <Car size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chauffeur • {trip.vehicle.plate || trip.vehicle.type}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="small"
              icon={Phone}
              onClick={() => {
                showToast({
                  type: 'info',
                  title: t('common.call') || 'Appel',
                  message: t('common.calling_phone', { phone: trip.driver.phone }) || `Appel vers ${trip.driver.phone}...`
                });
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="primary"
            onClick={onFinish}
          >
            Forcer Fin Trajet
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FollowModal;
