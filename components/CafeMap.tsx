/**
 * Metro resuelve `CafeMap.web.tsx` (web) y `CafeMap.native.tsx` (iOS/Android).
 * Este re-export evita errores de TypeScript cuando no hay sufijo de plataforma en el import.
 */
export { CafeMap } from './CafeMap.native';
export type { CafeMapProps } from '@/lib/types/cafe';
