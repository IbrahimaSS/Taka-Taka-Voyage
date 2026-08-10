import { useTranslation } from 'react-i18next';
import { Car, RefreshCw } from 'lucide-react';
import Card from '../admin/ui/Card';

import { useDriverTrips } from './trajets/useDriverTrips';
import TripStatsRow from './trajets/TripStatsRow';
import TripStatusFilters from './trajets/TripStatusFilters';
import TripCard from './trajets/TripCard';

const Trajets = () => {
  const { t, i18n } = useTranslation();
  const {
    isOnline,
    backendTrips,
    loading,
    refreshing,
    selectedStatus,
    setSelectedStatus,
    fetchTrips,
    handleAccept,
    handleRefuse,
    stats,
    filteredTrips,
    navigate,
  } = useDriverTrips({ t });

  const handleContinue = (trip) => {
    if (trip.typeCourse === 'PLANIFIEE' && trip.status === 'accepted') {
      navigate('/chauffeur/planning');
    } else {
      navigate('/chauffeur/tracking');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {t('nav.mes_trajets')}
            {refreshing && <RefreshCw className="w-5 h-5 animate-spin text-blue-500 shrink-0" />}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('trips.subtitle')}</p>
        </div>
        <button
          onClick={() => fetchTrips(true)}
          className="flex items-center justify-center gap-2 px-4 min-h-[44px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500 font-medium font-bold">{t('trips.loading_trips')}</p>
        </div>
      ) : (
        <>
          <TripStatsRow stats={stats} isOnline={isOnline} i18n={i18n} />

          <TripStatusFilters
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            stats={stats}
            backendTrips={backendTrips}
          />

          {/* Liste des trajets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onAccept={handleAccept}
                onRefuse={handleRefuse}
                onContinue={handleContinue}
              />
            ))}
          </div>

          {filteredTrips.length === 0 && (
            <Card padding="py-24" animate={false} className="text-center !rounded-3xl !border-gray-100 dark:!border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('trips.no_trips_found_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {t('trips.no_trips_found_desc')}
              </p>
              <button
                onClick={() => fetchTrips(true)}
                className="mt-8 px-8 min-h-[44px] bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:opacity-90 transition-all"
              >
                {t('trips.refresh_search')}
              </button>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Trajets;
