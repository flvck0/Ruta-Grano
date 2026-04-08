export type CafeMapMarker = {
  id: string;
  name: string;
  coordinate: [number, number];
  /** Actividad reciente (check-ins últimos 7 días en RPC). */
  hot?: boolean;
  distanceM?: number;
  address?: string | null;
};

export type CafeMapProps = {
  markers: CafeMapMarker[];
  /** Centro del mapa [lng, lat] */
  center: [number, number];
  selectedId: string | null;
  onSelectCafe: (id: string | null) => void;
};

export type CafeteriaCercanaRow = {
  id: string;
  name: string;
  address: string | null;
  distance_m: number;
  check_ins_recientes: number;
  lat: number;
  lng: number;
};
