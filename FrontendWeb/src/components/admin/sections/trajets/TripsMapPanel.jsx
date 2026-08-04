import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Map as MapIcon, Compass, Car, PlayCircle } from 'lucide-react';
import Button from '../../ui/Bttn';
import { leafletIcons } from '../../../maps/leafletIcons';

const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();
  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);
  return position === null ? null : (
    <Marker position={position} icon={leafletIcons.user}>
      <Popup>Vous êtes ici (Admin)</Popup>
    </Marker>
  );
};

const TripsMapPanel = ({ tripsData, onFollow }) => {
  const { t } = useTranslation();
  const activeTrips = tripsData.filter(t => t.status === 'in-progress');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 dark:border-gray-900/40 rounded-2xl shadow-sm border border-gray-100  overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-900/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-emerald-600" />
              Carte des trajets en temps réel
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{activeTrips.length} trajets actifs actuellement</p>
          </div>
          <div className="flex items-center gap-3">

            <Button
              variant="perso"
              icon={Compass}

            >
              Suivre
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Carte Leaflet en temps réel */}
        <div className="h-96 rounded-xl relative overflow-hidden z-0">
          <MapContainer
            center={[5.3600, -4.0083]} // Default Abidjan
            zoom={12}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            whenCreated={(map) => {
              // Locate admin on load
              map.locate({ setView: true, maxZoom: 14 });
              map.on('locationfound', (e) => {
                // Logic to show admin marker is handled by component state if needed,
                // but react-leaflet handles events.
                // We will use a separate LocationMarker component if we want strict state control,
                // but generic locate works for "setView".
              });
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Admin Location Marker (using browser geolocation via simple effect inside or generic approach) */}
            <LocationMarker />

            {/* Active Trips Markers */}
            {activeTrips.map((trip) => (
              <Marker
                key={trip.id}
                position={[trip.startLocation.lat, trip.startLocation.lng]}
                icon={leafletIcons.driver}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full ${trip.driver.avatarColor} flex items-center justify-center`}>
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{trip.driver.name}</p>
                        <p className="text-xs text-gray-500">{trip.vehicle.plate}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <p><strong>De:</strong> {trip.startLocation.address}</p>
                      <p><strong>Vers:</strong> {trip.endLocation.address}</p>
                    </div>
                    <Button
                      size="xs"
                      variant="primary"
                      className="w-full"
                      onClick={() => onFollow(trip)}
                      icon={PlayCircle}
                    >
                      Suivre en direct
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur dark:bg-gray-800/90 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {activeTrips.length} {t('trips.active_trips')}
              </span>
            </div>
          </div>
        </div>


      </div>
    </motion.div>
  );
};

export default TripsMapPanel;
