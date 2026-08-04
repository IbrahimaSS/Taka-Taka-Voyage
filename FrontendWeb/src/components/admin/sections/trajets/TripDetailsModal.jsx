import { useTranslation } from 'react-i18next';
import {
  Route, PlayCircle, Car, User, DollarSign, Share2,
  Star as StarIcon, Map as MapIcon
} from 'lucide-react';
import Modal from '../../ui/Modal';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import { getStatusBadge, getPaymentBadge } from './tripBadges';
import { getAvatarUrl, getUserAvatarInitials } from './tripHelpers';

// Modale de détails améliorée
const TripDetailsModal = ({ trip, isOpen, onClose, onFollow, showToast }) => {
  const { t } = useTranslation();

  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center  gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Route className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('trips.details_title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('trips.details_subtitle')}</p>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 ">
        {/* En-tête amélioré */}
        <div className="bg-slate-200/30 dark:bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{trip.route}</h2>
              <div className="flex items-center flex-wrap gap-2">
                <Badge className="bg-gray-800 text-white">{trip.id}</Badge>
                {getStatusBadge(trip.status, t)}
                {getPaymentBadge(trip.paymentMethod, t)}
                {trip.starred && (
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Favori
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{trip.amount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total du trajet</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.distance')}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{trip.distance}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.duration')}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{trip.duration}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.date')}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{trip.date}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('trips.start_time')}</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{trip.time}</div>
            </div>
          </div>
        </div>

        {/* Carte et itinéraire */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <MapIcon className="w-5 h-5 mr-2 text-emerald-600" />
                {t('trips.route_and_follow')}
              </CardTitle>
              {trip.status === 'in-progress' && (
                <Button
                  variant="primary"
                  size="small"
                  icon={PlayCircle}
                  onClick={() => onFollow(trip)}
                >
                  {t('trips.follow_live')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden">
              {/* Points sur la carte */}
              <div className="absolute top-6 left-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-white">{t('trips.depart')}</p>
                    <p className="text-xs text-gray-300">{trip.startLocation.address}</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 right-6">
                <div className="flex items-center">
                  <div className="mr-2 text-right">
                    <p className="text-sm font-medium text-white">{t('trips.arrival')}</p>
                    <p className="text-xs text-gray-300">{trip.endLocation.address}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                </div>
              </div>

              {/* Ligne de trajet */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-4/5">
                  <div className="w-full h-1 bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full"></div>
                  {trip.status === 'in-progress' && (
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <Car className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passager et Chauffeur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-600" />
                {t('commissions.passenger_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl font-bold border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                  <span className="z-0">{getUserAvatarInitials(trip.passenger)}</span>
                  {trip.passenger.photoUrl && (
                    <img
                      src={getAvatarUrl(trip.passenger.photoUrl)}
                      alt={trip.passenger.name}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{trip.passenger.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(trip.passenger.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{trip.passenger.rating}/5</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trajets</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.tripsCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.passenger.memberSince}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                {t('commissions.driver_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xl font-bold border border-blue-200 dark:border-blue-800 overflow-hidden">
                  <span className="z-0">{getUserAvatarInitials(trip.driver)}</span>
                  {trip.driver.photoUrl && (
                    <img
                      src={getAvatarUrl(trip.driver.photoUrl)}
                      alt={trip.driver.name}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{trip.driver.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(trip.driver.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{trip.driver.rating}/5</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Véhicule</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Expérience</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.experienceStr}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trajets</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{trip.driver.completedTrips}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Véhicule et finance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="w-5 h-5 mr-2 text-purple-600" />
                Détails du véhicule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Modèle</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{trip.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plaque</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{trip.vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Couleur</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{trip.vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Capacité</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{trip.vehicle.capacity} places</p>
                  </div>
                </div>
                {trip.vehicle.features && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.vehicle.features.map((feature, idx) => (
                        <Badge key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Détails financiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tarif de base:</span>
                  <span className="font-medium">{trip.fareBreakdown.base} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Distance:</span>
                  <span className="font-medium">{trip.fareBreakdown.distance} GNF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Temps:</span>
                  <span className="font-medium">{trip.fareBreakdown.time} GNF</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-900/40 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>{t('trips.total_fare')}:</span>
                    <span className="text-green-600">{trip.fareBreakdown.total} GNF</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <span>{t('trips.platform_commission')} (15%):</span>
                    <span className="text-rose-600">-{trip.fareBreakdown.commission} GNF</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{t('payments.processing_fees')}:</span>
                    <span>-{trip.fareBreakdown.platformFee} GNF</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-900/40 pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>{t('trips.driver_earnings')}:</span>
                      <span className="text-blue-600">{trip.fareBreakdown.driverEarnings} GNF</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-900/40">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="perso"
            icon={Share2}
            onClick={() => {
              navigator.clipboard.writeText(trip.id);
              showToast({
                type: 'success',
                title: 'Copié',
                message: 'ID du trajet copié dans le presse-papier'
              });
            }}
          >
            Partager
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TripDetailsModal;
