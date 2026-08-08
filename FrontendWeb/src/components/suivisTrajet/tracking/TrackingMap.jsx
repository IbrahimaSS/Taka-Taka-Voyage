import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Zap } from 'lucide-react';
import { leafletIcons } from '../../maps/leafletIcons';
import MapController from '../../maps/MapController';
import { isValidCoords } from './trackingUtils';

const TrackingMap = ({
  mapRef,
  tripData,
  driverPosition,
  passengerPosition,
  role,
  trip,
  isSimulating,
  remoteIsSimulatingRef,
  isTripEnded,
  onToggleSimulation,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 dark:border-white/5"
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Position en temps réel</h3>
      <div className="flex items-center gap-3">
        {role === 'driver' && !isTripEnded && (
          <motion.button
            whileHold={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSimulation}
            className={`flex items-center text-sm font-medium px-3 py-1 rounded-full border transition-all ${isSimulating
              ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 border-transparent'
              }`}
          >
            <Zap className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-pulse fill-current' : ''}`} />
            {isSimulating ? 'Simulation en cours...' : 'Simulation'}
          </motion.button>
        )}
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => mapRef.current && mapRef.current.invalidateSize()}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </motion.button>
      </div>
    </div>

    <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-100">
      <MapContainer
        center={isValidCoords(tripData.departure.coords) ? tripData.departure.coords : [9.6412, -13.5784]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="rounded-xl"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Contrôleur de vue pour le suivi fluide du chauffeur */}
        <MapController
          center={isValidCoords(driverPosition) ? driverPosition : tripData.departure.coords}
          zoom={15}
          animate={!(isSimulating || remoteIsSimulatingRef.current)}
          duration={isSimulating || remoteIsSimulatingRef.current ? 0.3 : 0.8}
        />

        {/* Marqueurs avec Halo pour visibilité "GROS" */}
        {isValidCoords(tripData.departure.coords) && (
          <>
            <Circle
              center={tripData.departure.coords}
              radius={30}
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4, weight: 2 }}
            />
            <Marker position={tripData.departure.coords} icon={leafletIcons.start}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-green-600">📍 Départ</p>
                  <p className="text-sm">{tripData.departure.name}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {isValidCoords(tripData.destination.coords) && (
          <>
            <Circle
              center={tripData.destination.coords}
              radius={30}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 2 }}
            />
            <Marker position={tripData.destination.coords} icon={leafletIcons.end}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-red-600">🏁 Destination</p>
                  <p className="text-sm">{tripData.destination.name}</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={tripData.destination.coords}
              radius={200}
              pathOptions={{ color: '#dc2626', fillColor: '#fecaca', fillOpacity: 0.2 }}
            />
          </>
        )}

        {isValidCoords(driverPosition) && (
          <Marker position={driverPosition} icon={leafletIcons.driver}>
            <Popup>
              <div className="p-2">
                <p className="font-bold">{tripData.driver.name}</p>
                <p className="text-sm">{tripData.driver.vehicle.brand} {tripData.driver.vehicle.model}</p>
                <p className="text-sm">⭐ {tripData.driver.rating} ({tripData.driver.totalTrips} trajets)</p>
                <p className="text-xs text-gray-500">{tripData.driver.vehicle.plate} • {tripData.driver.vehicle.color}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {isValidCoords(passengerPosition) && (
          <Marker position={passengerPosition} icon={leafletIcons.user}>
            <Popup>
              <div className="p-2">
                <p className="font-bold text-blue-600">👤 {role === 'driver' ? `Passager: ${trip?.passengerName}` : 'Votre position'}</p>
                <p className="text-sm">En attente du chauffeur</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trajet global (Pointillés discrets en fond) */}
        {isValidCoords(tripData.departure.coords) && isValidCoords(tripData.destination.coords) && (
          <Polyline
            positions={[tripData.departure.coords, tripData.destination.coords]}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.2, dashArray: '5, 10' }}
          />
        )}

        {/* Trajet Chauffeur -> Destination (Actuel) */}
        {isValidCoords(driverPosition) && isValidCoords(tripData.destination.coords) && (
          <Polyline
            positions={[driverPosition, tripData.destination.coords]}
            pathOptions={{ color: '#22c55e', weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
          />
        )}
      </MapContainer>
    </div>

    {/* Légende */}
    <div className="flex flex-wrap gap-4 mt-6">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mr-2 animate-pulse"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">Position du chauffeur</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-2"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {role === 'driver' ? 'Position du passager' : 'Votre position'}
        </span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-600 dark:to-green-700 rounded-full mr-2 border border-green-200 dark:border-green-800"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">Point de départ</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-2"></div>
        <span className="text-xs text-gray-600 dark:text-gray-400">Destination</span>
      </div>
    </div>
  </motion.div>
);

export default TrackingMap;
