import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { ensureLeafletIcons, leafletIcons } from './leafletIcons';

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    try {
      const bounds = points.reduce((b, p) => b.extend(p), L.latLngBounds(points[0], points[0]));
      map.fitBounds(bounds, { padding: [24, 24] });
    } catch (e) {
      // ignore
    }
  }, [map, points]);

  return null;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * LiveTripMap
 * - Simple OpenStreetMap tracking view for Admin follow modal.
 * - Shows start, end, current position (interpolated by progress 0..100).
 */
export default function LiveTripMap({ trip, progress = 0, height = 260, currentLocation }) {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  const start = trip?.startLocation
    ? [trip.startLocation.lat, trip.startLocation.lng]
    : null;
  const end = trip?.endLocation
    ? [trip.endLocation.lat, trip.endLocation.lng]
    : null;

  const current = useMemo(() => {
    if (currentLocation && currentLocation.lat != null && currentLocation.lng != null && !isNaN(currentLocation.lat) && !isNaN(currentLocation.lng)) {
      return [currentLocation.lat, currentLocation.lng];
    }
    if (!start || !end) return null;
    if (isNaN(start[0]) || isNaN(start[1]) || isNaN(end[0]) || isNaN(end[1])) return null;
    const t = Math.max(0, Math.min(1, progress / 100));
    return [lerp(start[0], end[0], t), lerp(start[1], end[1], t)];
  }, [start, end, progress, currentLocation]);

  const polyline = useMemo(() => {
    if (!start || !end || isNaN(start[0]) || isNaN(end[0])) return [];
    return [start, end];
  }, [start, end]);

  const points = useMemo(() => {
    const pts = [];
    if (start && !isNaN(start[0])) pts.push(start);
    if (end && !isNaN(end[0])) pts.push(end);
    // On ne change pas les bounds avec 'current' pour éviter que la carte ne "saute" ou re-zoom constamment
    return pts;
  }, [start, end]);

  // Handle own admin location
  const AdminLocationMarker = () => {
    const [position, setPosition] = React.useState(null);
    const map = useMap();

    React.useEffect(() => {
      map.locate().on("locationfound", function (e) {
        setPosition(e.latlng);
        // Optionally map.flyTo(e.latlng, map.getZoom());
      });
    }, [map]);

    return position === null ? null : (
      <Marker position={position} icon={leafletIcons.user}>
        {/* Admin Location */}
      </Marker>
    );
  };

  if (!start || !end || isNaN(start[0]) || isNaN(end[0])) {
    return (
      <div
        className="w-full rounded-xl bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-sm text-gray-600 dark:text-gray-300">Coordonnées indisponibles</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800" style={{ height }}>
      <MapContainer
        center={current || start}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={polyline} pathOptions={{ weight: 5 }} />

        <Marker position={start} icon={leafletIcons.start} />
        <Marker position={end} icon={leafletIcons.end} />
        {current && !isNaN(current[0]) && <Marker position={current} icon={leafletIcons.driver} />}

        <FitBounds points={points} />
        <AdminLocationMarker />
      </MapContainer>
    </div>
  );
}
