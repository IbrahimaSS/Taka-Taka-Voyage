import { useState, useEffect, useCallback } from 'react';
import { GeolocationService } from '../services/geolocation';

/**
 * useGeolocation Hook
 * Reactive wrapper for GeolocationService tracking
 */
export function useGeolocation(options = {}) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

    const refreshLocation = useCallback(async () => {
        setLoading(true);
        try {
            const pos = await GeolocationService.getCurrentPosition(options);
            setLocation(pos);
            setError(null);
            setPermission('granted');
        } catch (err) {
            setError(err);
            if (err.code === 1) setPermission('denied');
        } finally {
            setLoading(false);
        }
    }, [options]);

    useEffect(() => {
        refreshLocation();

        const watchId = GeolocationService.watchPosition(
            (pos) => {
                setLocation(prev => {
                    // Only update if coordinates changed significantly to save renders
                    if (!prev ||
                        Math.abs(prev.lat - pos.lat) > 0.00001 ||
                        Math.abs(prev.lng - pos.lng) > 0.00001) {
                        return pos;
                    }
                    return prev;
                });
                setError(null);
                setPermission('granted');
            },
            (err) => {
                setError(err);
                if (err.code === 1) setPermission('denied');
            },
            options
        );

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [options, refreshLocation]);

    return {
        location,
        error,
        loading,
        permission,
        refreshLocation
    };
}
