import React, { useState, useEffect } from 'react';
import { tripService } from '../../services/tripService'; // ✅ Import service
import {
  CheckCircle,
  XCircle,
  MapPin,
  User,
  DollarSign,
  Loader
} from 'lucide-react';

function HistoriqueTrajet() {
  const [historyTrips, setHistoryTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
    const baseUrl = API_URL.replace(/\/api$/, '');
    const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}${cleanPath}`;
  };

  // ✅ Fetch Real History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await tripService.getDriverHistory();

        if (data.succes) {
          const formattedTrips = data.data.map(t => ({
            id: t.id,
            status: t.status,
            requestedTime: t.requestedTime,
            passengerName: t.passengerName,
            passengerRating: t.passengerRating,
            passengerPhoto: getImageUrl(t.passengerPhoto), // Ajout de la photo
            pickupAddress: t.depart,
            destinationAddress: t.destination,
            distance: `${t.distanceKm} km`,
            estimatedTime: `${t.dureeMin} min`,
            estimatedFare: t.estimatedFare
          }));
          setHistoryTrips(formattedTrips);
        }
      } catch (err) {
        console.error("Error fetching driver history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);


  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
        Historique des trajets
      </h1>

      {historyTrips.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          Aucun trajet terminé ou annulé
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {historyTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {trip.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${trip.status === 'completed'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {trip.status === 'completed' ? 'Trajet terminé' : 'Trajet annulé'}
                  </span>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(trip.requestedTime)}
                </span>
              </div>

              {/* PASSAGER */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 flex items-center justify-center overflow-hidden">
                  {trip.passengerPhoto ? (
                    <img src={trip.passengerPhoto} alt={trip.passengerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {trip.passengerName}
                  </p>
                  {trip.passengerRating && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ⭐ {trip.passengerRating}/5
                    </p>
                  )}
                </div>
              </div>

              {/* ITINÉRAIRE */}
              <div className="space-y-2 mb-4">
                <p className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <MapPin className="w-4 h-4 text-green-500 dark:text-green-400" />
                  {trip.pickupAddress}
                </p>
                <p className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  {trip.destinationAddress}
                </p>
              </div>

              {/* INFOS */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Distance</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{trip.distance}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Durée</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{trip.estimatedTime}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Prix</p>
                  <p className="font-semibold flex items-center justify-center gap-1 text-gray-800 dark:text-white">
                    <DollarSign className="w-4 h-4" />
                    {trip.estimatedFare ? trip.estimatedFare.toLocaleString('fr-FR') : '0'} FG
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoriqueTrajet;