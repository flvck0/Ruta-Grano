import type { CafeMapMarker } from '@/lib/types/cafe';

/** Vista previa cuando aún no hay sesión (mapa atractivo sin backend). */
export const DEMO_MARKERS: CafeMapMarker[] = [
  { id: 'demo-plaza', name: 'Plaza de Armas', coordinate: [-70.6505, -33.4378], hot: false },
  { id: 'demo-lastarria', name: 'Barrio Lastarria', coordinate: [-70.636, -33.438], hot: true },
  { id: 'demo-providencia', name: 'Los Leones', coordinate: [-70.607, -33.418], hot: true },
];
