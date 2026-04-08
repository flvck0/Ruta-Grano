import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const SANTIAGO_DEFAULT = { lat: -33.4489, lng: -70.6483 };

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          if (!cancelled) {
            setCoords(SANTIAGO_DEFAULT);
            setLoading(false);
          }
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLoading(false);
          },
          () => {
            if (cancelled) return;
            setCoords(SANTIAGO_DEFAULT);
            setLoading(false);
          },
          { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 }
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setCoords(SANTIAGO_DEFAULT);
          setLoading(false);
        }
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) {
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, loading, coordsOrDefault: coords ?? SANTIAGO_DEFAULT };
}
