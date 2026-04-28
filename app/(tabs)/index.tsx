import { CafeMap } from '@/components/CafeMap';
import { BottomCafeSheet } from '@/components/map/BottomCafeSheet';
import { MapFloatingHeader } from '@/components/map/MapFloatingHeader';
import { useCafeteriasCercanas } from '@/hooks/useCafeteriasCercanas';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useUserLocation } from '@/hooks/useUserLocation';

import type { CafeMapMarker } from '@/lib/types/cafe';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCallback, useMemo, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MapaScreen() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const { coordsOrDefault } = useUserLocation();
  const center = useMemo<[number, number]>(
    () => [coordsOrDefault.lng, coordsOrDefault.lat],
    [coordsOrDefault.lat, coordsOrDefault.lng]
  );

  const { cafes, loading: loadingCafes } = useCafeteriasCercanas(
    coordsOrDefault.lat,
    coordsOrDefault.lng,
    true // Always fetch from DB regardless of auth state
  );

  const markers: CafeMapMarker[] = useMemo(() => {
    return cafes.map((c) => ({
      id: c.id,
      name: c.name,
      coordinate: [c.lng, c.lat] as [number, number],
      hot: (c.check_ins_recientes ?? 0) >= 2,
      distanceM: c.distance_m,
      address: c.address,
      images: c.images,
    }));
  }, [cafes]);

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

  return (
    <View className="flex-1 bg-[#1c1410]">
      <StatusBar style="light" />
      <CafeMap
        markers={markers}
        center={center}
        selectedId={selectedId}
        onSelectCafe={setSelectedIdWrapped}
      />
      <MapFloatingHeader userEmail={user?.email ?? null} displayName={displayName} loadingCafes={!!user && loadingCafes} />
      <BottomCafeSheet
        cafe={selected}
        user={user}
        onClose={() => setSelectedIdWrapped(null)}
        onCheckIn={onCheckIn}
        checkInLoading={checkInLoading}
        checkInMessage={checkInMsg}
        favorite={favorite}
        onToggleFavorite={() => selected && toggleFavorite({ id: selected.id, name: selected.name, address: selected.address, hot: selected.hot })}
        demoMode={!user}
      />
      {user && !selectedId ? (
        <View style={{ position: 'absolute', bottom: 32, right: 24 }}>
          <Link href="/add-cafe" asChild>
            <Pressable className="bg-[#D4A574] w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-80 shadow-black/50" style={{ elevation: 5 }}>
              <Ionicons name="add" size={30} color="#fff" />
            </Pressable>
          </Link>
        </View>
      ) : null}
    </View>
  );
}
