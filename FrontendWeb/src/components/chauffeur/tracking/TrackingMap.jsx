import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { leafletIcons } from '../../maps/leafletIcons';
import MapController from '../../maps/MapController';

const TrackingMap = ({
    driverLocation,
    acceptedTrips,
    targetCoords
}) => {
    const { t } = useTranslation();
    const [mapReady, setMapReady] = useState(false);
    const isValidLocation = driverLocation && !isNaN(driverLocation.lat) && !isNaN(driverLocation.lng);

    if (!isValidLocation) {
        return (
            <div className="relative h-[280px] sm:h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center p-6">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{t('tracking.gps_not_available')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[280px] sm:h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapController center={[driverLocation.lat, driverLocation.lng]} zoom={15} />

                {/* Marqueur du conducteur */}
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={leafletIcons.driver}>
                    <Popup>
                        <div className="p-2">
                            <p className="font-bold text-emerald-600">{t('tracking.your_position')}</p>
                            <p className="text-sm">{t('tracking.online_ready')}</p>
                        </div>
                    </Popup>
                </Marker>

                {/* Marqueurs des passagers */}
                {acceptedTrips.map(trip => {
                    const isValidPickup = trip.pickupCoords && !isNaN(trip.pickupCoords[0]) && !isNaN(trip.pickupCoords[1]);
                    const isValidDest = trip.destinationCoords && !isNaN(trip.destinationCoords[0]) && !isNaN(trip.destinationCoords[1]);

                    return (
                        <React.Fragment key={trip.id}>
                            {trip.pickupStatus !== 'picked_up' && isValidPickup && (
                                <Marker position={trip.pickupCoords} icon={leafletIcons.user}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold text-blue-600">{t('tracking.passenger_label')}: {trip.passengerName}</p>
                                            <p className="text-sm">{trip.pickupAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {isValidDest && (
                                <Marker position={trip.destinationCoords} icon={leafletIcons.end}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold text-red-600">{t('tracking.destination_label')}</p>
                                            <p className="text-sm">{trip.destinationAddress}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* Ligne de trajectoire */}
                {targetCoords && !isNaN(targetCoords[0]) && !isNaN(targetCoords[1]) && (
                    <Polyline
                        positions={[[driverLocation.lat, driverLocation.lng], targetCoords]}
                        pathOptions={{
                            color: '#10b981',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '8, 12',
                            lineCap: 'round'
                        }}
                    />
                )}
            </MapContainer>

            {!mapReady && (
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-semibold">{t('tracking.loading_map')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackingMap;
