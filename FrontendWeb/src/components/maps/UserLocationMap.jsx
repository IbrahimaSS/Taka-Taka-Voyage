import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { ensureLeafletIcons, leafletIcons } from './leafletIcons';

export default function UserLocationMap({ lat, lng, height = 384 }) {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  const pos = [lat, lng];

  return (
    <div className="w-full h-full">
      <MapContainer center={pos} zoom={14} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle center={pos} radius={150} pathOptions={{ weight: 2 }} />
        <Marker position={pos} icon={leafletIcons.user} />
      </MapContainer>
    </div>
  );
}
