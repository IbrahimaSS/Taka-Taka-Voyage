import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, Polyline } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Navigation, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import { leafletIcons, ensureLeafletIcons } from '../../maps/leafletIcons';
import MapController from '../../maps/MapController';
import { isValidLatLng } from './useAddressSearch';

// Gestionnaire d'événements carte
function MapEvents({ onPickupSelect, onDestinationSelect, selectionMode }) {
  const { t } = useTranslation();
  useMapEvent({
    click(e) {
      if (selectionMode === 'pickup') {
        onPickupSelect(e.latlng);
        toast.success(t('booking.pickup_selected'));
      } else if (selectionMode === 'destination') {
        onDestinationSelect(e.latlng);
        toast.success(t('booking.destination_selected'));
      }
    }
  });
  return null;
}

const BookingMap = ({
  t, mapCenter, mapRef, selectionMode, onMapSelection,
  userLocation, pickupLocation, destinationLocation, formData,
  shouldShowDriver, currentDriver, locateUser, isLoadingGeolocation,
}) => {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  return (
    <div className="bg-white passenger-glass dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {shouldShowDriver ? t('booking.driver_en_route') : t('booking.interactive_map')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectionMode ? (
                <span className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${selectionMode === 'pickup' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {t('booking.click_on_map_msg', { mode: selectionMode === 'pickup' ? t('booking.pickup_label') : t('booking.destination_label') })}
                </span>
              ) : shouldShowDriver ? (
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                  {t('booking.driver_arriving', { eta: currentDriver.eta })}
                </span>
              ) : (
                t('booking.map_tip')
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={locateUser}
              disabled={isLoadingGeolocation}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isLoadingGeolocation ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {t('booking.currently_locating')}
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-1" />
                  {t('booking.my_position')}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden h-[350px] sm:h-[500px]">
          <MapContainer
            center={isValidLatLng(mapCenter) ? mapCenter : [9.6412, -13.5784]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            className="rounded-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={isValidLatLng(mapCenter) ? mapCenter : [9.6412, -13.5784]} zoom={16} />
            <MapEvents
              onPickupSelect={(latlng) => onMapSelection('pickup', latlng)}
              onDestinationSelect={(latlng) => onMapSelection('destination', latlng)}
              selectionMode={selectionMode}
            />

            {/* Marqueurs */}
            {userLocation && isValidLatLng(userLocation) && (
              <Marker position={userLocation} icon={leafletIcons.user}>
                <Popup>
                  <div className="p-2">
                    <div className="font-bold text-blue-600">{t('booking.legend.position')}</div>
                  </div>
                </Popup>
              </Marker>
            )}
            {pickupLocation && isValidLatLng(pickupLocation) && (
              <Marker position={pickupLocation} icon={leafletIcons.start}>
                <Popup>
                  <div className="p-2">
                    <div className="font-bold text-green-600">{t('booking.legend.pickup')}</div>
                    <div className="text-sm text-gray-600 mt-1">{formData.pickup}</div>
                  </div>
                </Popup>
              </Marker>
            )}
            {destinationLocation && isValidLatLng(destinationLocation) && (
              <Marker position={destinationLocation} icon={leafletIcons.end}>
                <Popup>
                  <div className="p-2">
                    <div className="font-bold text-red-600">{t('booking.legend.destination')}</div>
                    <div className="text-sm text-gray-600 mt-1">{formData.destination}</div>
                  </div>
                </Popup>
              </Marker>
            )}
            {shouldShowDriver && currentDriver.location && isValidLatLng(currentDriver.location) && (
              <Marker position={currentDriver.location} icon={leafletIcons.driver}>
                <Popup>
                  <div className="p-2">
                    <div className="font-bold text-blue-600">{t('booking.legend.driver')}</div>
                    <div className="text-sm text-gray-600">{currentDriver.name}</div>
                    <div className="text-xs text-gray-500">
                      {currentDriver.vehicle.brand} {currentDriver.vehicle.model} • {currentDriver.vehicle.plate}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t('booking.driver_arriving', { eta: currentDriver.eta })}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
            {shouldShowDriver && currentDriver.location && isValidLatLng(currentDriver.location) && pickupLocation && isValidLatLng(pickupLocation) && (
              <Polyline
                positions={[currentDriver.location, pickupLocation]}
                pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.8, dashArray: '10, 15', lineCap: 'round' }}
              />
            )}
          </MapContainer>

          {/* Indicateur de mode */}
          {selectionMode && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-[90%] bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl z-[1000] border-2 border-green-500"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${selectionMode === 'pickup' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <div>
                  <span className="font-bold text-gray-900">
                    {t('booking.map_mode', { type: selectionMode === 'pickup' ? t('booking.legend.pickup') : t('booking.legend.destination') })}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('booking.map_instruction')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Légende */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">{t('booking.legend.pickup')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">{t('booking.legend.destination')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">{t('booking.legend.position')}</span>
          </div>
          {shouldShowDriver && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">{t('booking.legend.driver')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingMap;
