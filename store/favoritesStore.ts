import { create } from 'zustand';

type FavoritesState = {
  ids: Set<string>;
  toggle: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  toggle: (id) =>
    set(() => {
      const next = new Set(get().ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ids: next };
    }),
}));
