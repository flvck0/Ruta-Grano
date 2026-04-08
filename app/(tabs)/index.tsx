import { CafeMap } from '@/components/CafeMap';
import { BottomCafeSheet } from '@/components/map/BottomCafeSheet';
import { MapFloatingHeader } from '@/components/map/MapFloatingHeader';
import { useCafeteriasCercanas } from '@/hooks/useCafeteriasCercanas';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useUserLocation } from '@/hooks/useUserLocation';
import { DEMO_MARKERS } from '@/lib/constants/demoMarkers';
import type { CafeMapMarker } from '@/lib/types/cafe';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function MapaScreen() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const { coordsOrDefault } = useUserLocation();
  const center = useMemo<[number, number]>(
    () => [coordsOrDefault.lng, coordsOrDefault.lat],
    [coordsOrDefault.lat, coordsOrDefault.lng]
  );

  const { cafes, loading: loadingCafes } = useCafeteriasCercanas(
    coordsOrDefault.lat,
    coordsOrDefault.lng,
    !!user
  );

  const markers: CafeMapMarker[] = useMemo(() => {
    if (!user) {
      return DEMO_MARKERS;
    }
    return cafes.map((c) => ({
      id: c.id,
      name: c.name,
      coordinate: [c.lng, c.lat],
      hot: (c.check_ins_recientes ?? 0) >= 2,
      distanceM: c.distance_m,
      address: c.address,
    }));
  }, [user, cafes]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setSelectedIdWrapped = useCallback((id: string | null) => {
    setCheckInMsg(null);
    setSelectedId(id);
  }, []);
  const selected = useMemo(
    () => markers.find((m) => m.id === selectedId) ?? null,
    [markers, selectedId]
  );

  const { checkIn, loading: checkInLoading } = useCheckIn();
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);

  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const favorite = selected ? favoriteIds.has(selected.id) : false;

  const onCheckIn = useCallback(async () => {
    if (!selected || !user) return;
    setCheckInMsg(null);
    const res = await checkIn(selected.id);
    if (res.ok) {
      setCheckInMsg('¡Check-in listo! Gracias por aportar a la comunidad.');
    } else {
      setCheckInMsg(res.error ?? 'No se pudo registrar');
    }
  }, [checkIn, selected, user]);

  if (!initialized) {
    return <View className="flex-1 bg-[#1c1410]" />;
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      <StatusBar style="light" />
      <CafeMap
        markers={markers}
        center={center}
        selectedId={selectedId}
        onSelectCafe={setSelectedIdWrapped}
      />
      <MapFloatingHeader userEmail={user?.email ?? null} loadingCafes={!!user && loadingCafes} />
      <BottomCafeSheet
        cafe={selected}
        user={user}
        onClose={() => setSelectedIdWrapped(null)}
        onCheckIn={onCheckIn}
        checkInLoading={checkInLoading}
        checkInMessage={checkInMsg}
        favorite={favorite}
        onToggleFavorite={() => selected && toggleFavorite(selected.id)}
        demoMode={!user}
      />
    </View>
  );
}
