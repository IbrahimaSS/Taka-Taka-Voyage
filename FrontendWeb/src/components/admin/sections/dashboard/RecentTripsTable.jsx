import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Clock, Car, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../ui/Bttn';
import { getStatusBadge, getMethodBadge, getServiceLabel, getAvatarUrl, getInitials, formatVehicle } from './dashboardHelpers';

const RecentTripsTable = ({ trips, t, i18n }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-600" />
            {t('dashboard.recent_trips') || 'Trajets Récents'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t('dashboard.last_5_rides') || 'Les 5 dernières courses effectuées sur la plateforme'}
          </p>
        </div>
        <Link to="/admin/trajets">
          <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
            {t('dashboard.view_full_history') || "Voir tout l'historique"}
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex flex-col items-center justify-center">
            <Route className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-lg font-medium">{t('dashboard.no_recent_trips') || 'Aucun trajet récent'}</p>
            <p className="text-sm opacity-80">{t('dashboard.new_rides_msg') || 'Les nouvelles courses apparaîtront ici.'}</p>
          </div>
        </div>
      ) : isMobile ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {trips.map((trip, index) => {
            const passengerName = trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : (t('dashboard.deleted_user') || 'Utilisateur supprimé');
            const driverName = trip.chauffeur ? `${trip.chauffeur.prenom} ${trip.chauffeur.nom}` : null;
            const dateFormatted = new Date(trip.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            return (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {dateFormatted}
                  </div>
                  {getStatusBadge(trip.statut, t)}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold overflow-hidden border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    <span className="z-0">{getInitials(trip.passager)}</span>
                    {trip.passager?.photoUrl && (
                      <img
                        src={getAvatarUrl(trip.passager.photoUrl)}
                        alt={passengerName}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{passengerName}</div>
                    {trip.passager?.telephone && (
                      <div className="text-xs text-gray-500">{trip.passager.telephone}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {trip.chauffeur ? (
                    <>
                      <div className="relative h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold overflow-hidden border border-blue-200 dark:border-blue-800 flex-shrink-0">
                        <span className="z-0">{getInitials(trip.chauffeur)}</span>
                        {trip.chauffeur?.photoUrl && (
                          <img
                            src={getAvatarUrl(trip.chauffeur.photoUrl)}
                            alt={driverName}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{driverName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {formatVehicle(trip.chauffeur.vehicule, trip.typeVehicule, t)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 opacity-60">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-500 italic">
                        {['ANNULEE', 'ANNULEE_AVEC_FRAIS'].includes(trip.statut) ? '-' : (t('dashboard.searching') || 'En recherche...')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 uppercase">
                    {getServiceLabel(trip.typeVehicule, t)}
                  </span>
                  {getMethodBadge(trip.paiement?.methode || trip.paiement?.mode)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.distanceKm} km • {trip.dureeMin} min
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {(trip.prix || 0).toLocaleString()} {t('common.currency_symbol') || 'GNF'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">{t('dashboard.trip') || 'Trajet'}</th>
                <th className="px-6 py-4">{t('nav.passagers') || 'Passager'}</th>
                <th className="px-6 py-4">{t('nav.chauffeurs') || 'Chauffeur'}</th>
                <th className="px-6 py-4">{t('common.service') || 'Service'}</th>
                <th className="px-6 py-4">{t('payments.method') || 'Mode'}</th>
                <th className="px-6 py-4 text-right">{t('dashboard.details') || 'Détails'}</th>
                <th className="px-6 py-4">{t('dashboard.status') || 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {trips.map((trip, index) => {
                const passengerName = trip.passager ? `${trip.passager.prenom} ${trip.passager.nom}` : (t('dashboard.deleted_user') || 'Utilisateur supprimé');
                const driverName = trip.chauffeur ? `${trip.chauffeur.prenom} ${trip.chauffeur.nom}` : null;
                const dateFormatted = new Date(trip.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <motion.tr
                    key={trip._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-400 mb-1">#{trip._id.slice(-6).toUpperCase()}</span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {dateFormatted}
                        </div>
                      </div>
                    </td>
                    {/* Passager - AVEC INITIALES FALLBACK */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold overflow-hidden border border-emerald-200 dark:border-emerald-800">
                          <span className="z-0">{getInitials(trip.passager)}</span>
                          {trip.passager?.photoUrl && (
                            <img
                              src={getAvatarUrl(trip.passager.photoUrl)}
                              alt={passengerName}
                              className="absolute inset-0 w-full h-full object-cover z-10"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{passengerName}</div>
                          {trip.passager?.telephone && (
                            <div className="text-xs text-gray-500">{trip.passager.telephone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Chauffeur - AVEC INITIALES FALLBACK */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {trip.chauffeur ? (
                          <>
                            <div className="relative h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold overflow-hidden border border-blue-200 dark:border-blue-800">
                              <span className="z-0">{getInitials(trip.chauffeur)}</span>
                              {trip.chauffeur?.photoUrl && (
                                <img
                                  src={getAvatarUrl(trip.chauffeur.photoUrl)}
                                  alt={driverName}
                                  className="absolute inset-0 w-full h-full object-cover z-10"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm">{driverName}</div>
                              {trip.chauffeur && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Car className="w-3 h-3" />
                                  {formatVehicle(trip.chauffeur.vehicule, trip.typeVehicule, t)}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 opacity-60">
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                              <Car className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 italic">
                              {['ANNULEE', 'ANNULEE_AVEC_FRAIS'].includes(trip.statut) ? '-' : (t('dashboard.searching') || 'En recherche...')}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 uppercase">
                        {getServiceLabel(trip.typeVehicule, t)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(trip.paiement?.methode || trip.paiement?.mode)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {(trip.prix || 0).toLocaleString()} {t('common.currency_symbol') || 'GNF'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trip.distanceKm} km • {trip.dureeMin} min
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(trip.statut, t)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default RecentTripsTable;
