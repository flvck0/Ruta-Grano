import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  displayName: string | null;
  setSession: (session: Session | null) => void;
  setDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  displayName: null,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      loading: false,
      initialized: true,
      displayName: session?.user?.user_metadata?.display_name ?? null,
    }),
  setDisplayName: async (name: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: name },
    });
    if (!error && data.user) {
      set({ displayName: name });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, displayName: null });
  },
}));
