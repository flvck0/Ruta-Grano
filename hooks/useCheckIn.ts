import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useCheckIn() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  const checkIn = useCallback(
    async (cafeteriaId: string) => {
      if (!user) return { ok: false as const, error: 'Inicia sesión' };
      setLoading(true);
      try {
        const { error } = await supabase.from('check_ins').insert({
          user_id: user.id,
          cafeteria_id: cafeteriaId,
        });
        if (error) throw error;
        return { ok: true as const, error: undefined as string | undefined };
      } catch (e: unknown) {
        return { ok: false as const, error: e instanceof Error ? e.message : 'Error' };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { checkIn, loading };
}
