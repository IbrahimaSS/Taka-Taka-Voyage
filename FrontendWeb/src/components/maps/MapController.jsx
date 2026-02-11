import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Reusable Map Controller
 * Standardizes smooth flyTo transitions and view updates
 */
export default function MapController({ center, zoom, animate = true, duration = 1.5 }) {
    const map = useMap();

    useEffect(() => {
        if (!center || !map) return;

        // Validation et normalisation des coordonnees pour eviter l'erreur (NaN, NaN)
        const getCoords = (value) => {
            if (Array.isArray(value)) {
                return [Number(value[0]), Number(value[1])];
            }
            if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
                return [Number(value.lat), Number(value.lng)];
            }
            return null;
        };

        const coords = getCoords(center);
        const lat = coords?.[0];
        const lng = coords?.[1];

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.warn('MapController: Invalid coordinates received', center);
            return;
        }

        const nextCenter = [lat, lng];

        // Eviter le flyTo si la carte n'est pas prete ou si le container est invalide
        if (map && typeof map.getSize === 'function') {
            const size = map.getSize();
            if (!size || size.x === 0 || size.y === 0) {
                return;
            }
        }
        if (map && map._loaded === false) {
            return;
        }

        try {
            if (animate) {
                map.flyTo(nextCenter, zoom || map.getZoom(), {
                    duration,
                    easeLinearity: 0.25
                });
            } else {
                map.setView(nextCenter, zoom || map.getZoom());
            }
        } catch (err) {
            console.warn('MapController: flyTo failed', err);
        }
    }, [center, zoom, map, animate, duration]);

    // Handle map resizing (fixes display bugs when containers change size)
    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => {
                map.invalidateSize();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [map]);

    return null;
}
