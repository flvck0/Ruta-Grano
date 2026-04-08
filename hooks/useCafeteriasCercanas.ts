import { useEffect, useState } from 'react';

import type { CafeteriaCercanaRow } from '@/lib/types/cafe';
import { supabase } from '@/lib/supabase';

export function useCafeteriasCercanas(
  lat: number,
  lng: number,
  enabled: boolean,
  radiusM = 12000
) {
  const [cafes, setCafes] = useState<CafeteriaCercanaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCafes([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .rpc('cafeterias_cercanas', {
        lat,
        lng,
        radius_meters: radiusM,
      })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return;
        if (rpcError) {
          setError(rpcError.message);
          setCafes([]);
        } else {
          setCafes((data as CafeteriaCercanaRow[]) ?? []);
          setError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, enabled, radiusM]);

  return { cafes, loading, error };
}
