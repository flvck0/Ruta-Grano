import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Comuna {
  id: number;
  name: string;
}

export interface Region {
  id: number;
  name: string;
  comunas: Comuna[];
}

export function useChileLocations() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        // Fetch regions and their comunas
        const { data, error } = await supabase
          .from('regions')
          .select(`
            id,
            name,
            comunas (
              id,
              name
            )
          `)
          .order('id');

        if (error) throw error;

        if (mounted && data) {
          // Format data exactly as we need it
          const formatted: Region[] = data.map(r => ({
            id: r.id,
            name: r.name,
            comunas: (r.comunas as Comuna[]).sort((a, b) => a.name.localeCompare(b.name))
          }));
          setRegions(formatted);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return { regions, loading, error };
}
