import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { CafeMapMarker } from '@/lib/types/cafe';

type Props = {
  cafe: CafeMapMarker | null;
  user: { id: string } | null;
  onClose: () => void;
  onCheckIn: () => void;
  checkInLoading: boolean;
  checkInMessage: string | null;
  favorite: boolean;
  onToggleFavorite: () => void;
  demoMode?: boolean;
};

export function BottomCafeSheet({
  cafe,
  user,
  onClose,
  onCheckIn,
  checkInLoading,
  checkInMessage,
  favorite,
  onToggleFavorite,
  demoMode,
}: Props) {
  if (!cafe) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-2">
      <View className="overflow-hidden rounded-3xl border border-white/15 bg-[#2a1f18]/95 shadow-2xl">
        <View className="flex-row items-start justify-between px-5 pb-2 pt-4">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-semibold text-[#f5e6d3]" numberOfLines={2}>
              {cafe.name}
            </Text>
            {cafe.address ? (
              <Text className="mt-1 text-sm text-[#a89888]" numberOfLines={2}>
                {cafe.address}
              </Text>
            ) : null}
            {cafe.distanceM != null ? (
              <Text className="mt-2 text-xs font-medium uppercase tracking-wide text-[#c4836c]">
                A ~{Math.round(cafe.distanceM)} m ·{' '}
                {cafe.hot ? 'Mucho movimiento' : 'Zona tranquila'}
              </Text>
            ) : null}
            {demoMode ? (
              <Text className="mt-2 text-xs text-amber-200/90">
                Vista demo — inicia sesión para datos reales y check-in.
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={onToggleFavorite}
            className="rounded-full bg-white/10 p-2.5 active:opacity-80"
            accessibilityLabel="Favorito">
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={26} color={favorite ? '#f472b6' : '#d4c4b4'} />
          </Pressable>
        </View>

        {checkInMessage ? (
          <Text className="px-5 pb-2 text-center text-sm text-emerald-300">{checkInMessage}</Text>
        ) : null}

        <View className="flex-row gap-3 px-5 pb-5">
          <Pressable
            onPress={onCheckIn}
            disabled={!user || checkInLoading || demoMode}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#c4836c] py-3.5 active:opacity-90 disabled:opacity-40">
            {checkInLoading ? (
              <ActivityIndicator color="#1c1410" />
            ) : (
              <>
                <Ionicons name="location" size={20} color="#1c1410" />
                <Text className="text-base font-semibold text-[#1c1410]">Check-in</Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={onClose}
            className="items-center justify-center rounded-2xl border border-white/20 px-5 py-3.5 active:opacity-80">
            <Text className="font-medium text-[#e8c4b0]">Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
