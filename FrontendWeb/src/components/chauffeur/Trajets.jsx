import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Car,
  MapPin,
  User,
  DollarSign,
  Calendar,
  Navigation,
  AlertCircle,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDriverContext } from '../../context/DriverContext';
import Badge from '../../ui/Badge';
import { useTripStore } from '../../data/tripStore';

function Trajets() {
  const trips = useTripStore((state) => state.trips);
  const completeTrip = useTripStore((state) => state.completeTrip);
  const cancelTrip = useTripStore((state) => state.cancelTrip);
  const { acceptTripRequest, activeTrip } = useDriverContext();
  const navigate = useNavigate();

  // États pour les filtres
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Statistiques
  const stats = {
    total: trips.length,
    pending: trips.filter(t => t.status === 'pending').length,
    inProgress: trips.filter(t => t.status === 'in_progress').length,
    completed: trips.filter(t => t.status === 'completed').length,
    totalEarnings: trips
      .filter(t => t.status === 'completed')
      .reduce((sum, trip) => sum + trip.estimatedFare, 0)
  };

  // Filtrer les trajets
  const activeTrips = trips.filter(trip => {
    if (selectedStatus !== 'all' && trip.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && trip.priority !== selectedPriority) return false;
    return true;
  });

  const handleCompleteTrip = (id) => {
    completeTrip(id);
  };

  const handleCancelTrip = (id) => {
    cancelTrip(id);
  };

  // Configuration des statuts
  const statusConfig = {
    pending: {
      label: 'En attente',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock className="w-4 h-4" />,
      badge: 'warning'
    },
    accepted: {
      label: 'Accepté',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: 'info'
    },
    in_progress: {
      label: 'En cours',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Navigation className="w-4 h-4" />,
      badge: 'primary'
    },
    completed: {
      label: 'Terminé',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: 'success'
    },
    cancelled: {
      label: 'Annulé',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="w-4 h-4" />,
      badge: 'error'
    }
  };

  // Configuration des priorités
  const priorityConfig = {
    low: {
      label: 'Basse',
      color: 'bg-gray-100 text-gray-800',
      badge: 'default'
    },
    medium: {
      label: 'Moyenne',
      color: 'bg-amber-100 text-amber-800',
      badge: 'warning'
    },
    high: {
      label: 'Haute',
      color: 'bg-red-100 text-red-800',
      badge: 'error'
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Mes Trajets</h1>
          <p className="text-gray-600 dark:text-gray-200">Gérez vos courses du jour</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-200">En attente</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-200">En cours</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inProgress}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Navigation className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-200">Terminés</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completed}</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-200">Revenus du jour</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats.totalEarnings.toLocaleString('fr-FR')} FG
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Statut</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                  }`}
              >
                Tous ({stats.total})
              </button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${selectedStatus === status
                    ? config.color
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                >
                  {config.icon}
                  <span>{config.label}</span>
                  <span className="text-xs opacity-75">
                    ({trips.filter(t => t.status === status).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Priorité</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPriority('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedPriority === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                  }`}
              >
                Toutes
              </button>
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedPriority === priority
                    ? config.color
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des trajets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Trajets {selectedStatus !== 'all' && `(${statusConfig[selectedStatus]?.label})`}
            <span className="text-gray-600 dark:text-gray-300 text-sm font-normal ml-2">
              {activeTrips.length} résultat{activeTrips.length > 1 ? 's' : ''}
            </span>
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            <Calendar className="w-4 h-4 inline mr-1" />
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Cartes des trajets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeTrips.map((trip) => {
            const status = statusConfig[trip.status];
            const priority = priorityConfig[trip.priority];

            return (
              <div
                key={trip.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* En-tête de la carte */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${status?.color}`}>
                        {status?.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{trip.id}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {trip.distanceToDriver && (
                            <span className="text-blue-500 font-bold mr-2">
                              À {trip.distanceToDriver} km
                            </span>
                          )}
                          Demande à {trip.requestedTime?.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {priority && (
                        <Badge variant={priority.badge} size="sm">
                          {priority.label}
                        </Badge>
                      )}
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Détails du trajet */}
                <div className="p-5">
                  {/* Passager */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{trip.passengerName}</p>
                      {trip.passengerRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-amber-500">★</span>
                          <span className="text-gray-600 dark:text-gray-300">{trip.passengerRating}/5</span>
                          {trip.notes && (
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full ml-2">
                              {trip.notes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Itinéraire */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-blue-500 mx-auto"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Point de départ</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-green-500" />
                            {trip.pickupAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Destination</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {trip.destinationAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{trip.distance}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Durée estimée</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{trip.estimatedTime}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Prix estimé</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {trip.estimatedFare?.toLocaleString('fr-FR')} FG
                      </p>
                    </div>
                  </div>

                  {/* Actions selon le statut */}
                  <div className="flex flex-wrap gap-2">
                    {trip.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            acceptTripRequest(trip.id);
                            navigate('/chauffeur/tracking');
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleCancelTrip(trip.id)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                        >
                          Refuser
                        </button>
                      </>
                    )}

                    {trip.id === activeTrip?.id && (
                      <button
                        onClick={() => navigate('/chauffeur/tracking')}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Suivre sur la carte
                      </button>
                    )}

                    <button className="px-4 py-2 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeTrips.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Aucun trajet trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300">Aucun trajet ne correspond à vos filtres</p>
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trajets;