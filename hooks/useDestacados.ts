import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type DestacadaRow = {
  id: string;
  name: string;
  address: string | null;
  check_ins_ultimos_30_dias: number;
};

export function useDestacados(enabled: boolean) {
  const [rows, setRows] = useState<DestacadaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('cafeterias_destacadas_mes')
      .select('id, name, address, check_ins_ultimos_30_dias')
      .order('check_ins_ultimos_30_dias', { ascending: false })
      .limit(30)
      .then(({ data, error: qError }) => {
        if (cancelled) return;
        if (qError) {
          setError(qError.message);
          setRows([]);
        } else {
          setRows((data as DestacadaRow[]) ?? []);
          setError(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { rows, loading, error };
}
