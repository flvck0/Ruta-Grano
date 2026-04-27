import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type ForumThreadRow = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  created_by: string;
};

export function useForumThreads(enabled: boolean, refreshKey = 0) {
  const [threads, setThreads] = useState<ForumThreadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setThreads([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('forum_threads')
      .select('id, title, body, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data, error: qError }) => {
        if (cancelled) return;
        if (qError) {
          setError(qError.message);
          setThreads([]);
        } else {
          setThreads((data as ForumThreadRow[]) ?? []);
          setError(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, refreshKey]);

  return { threads, loading, error };
}
