import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
}
