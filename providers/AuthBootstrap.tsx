import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    let isMounted = true;

    // Supabase auth checking
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) console.log('Auth getSession error:', error);
        setSession(session);
      })
      .catch((err) => {
        console.log('Auth exception:', err);
        if (isMounted) setSession(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
      }
    });

    // Fallback in case Supabase hangs silently on strict browsers
    const timeout = setTimeout(() => {
      if (isMounted && !useAuthStore.getState().initialized) {
        setSession(null);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}
