import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FavoriteCafe = {
  id: string;
  name: string;
  address?: string | null;
  hot?: boolean;
};

type FavoritesState = {
  ids: Set<string>;
  cafes: Map<string, FavoriteCafe>;
  toggle: (cafe: FavoriteCafe) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: new Set(),
      cafes: new Map(),
      toggle: (cafe) =>
        set(() => {
          const nextIds = new Set(get().ids);
          const nextCafes = new Map(get().cafes);
          if (nextIds.has(cafe.id)) {
            nextIds.delete(cafe.id);
            nextCafes.delete(cafe.id);
          } else {
            nextIds.add(cafe.id);
            nextCafes.set(cafe.id, cafe);
          }
          return { ids: nextIds, cafes: nextCafes };
        }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ids: Array.from(state.ids),
        cafes: Array.from(state.cafes.entries()),
      }),
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ids: new Set(persistedState.ids ?? []),
          cafes: new Map(persistedState.cafes ?? []),
        };
      },
    }
  )
);
