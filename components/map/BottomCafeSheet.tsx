import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from 'react-native';

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

  const openDirections = () => {
    if (!cafe) return;
    const [lng, lat] = cafe.coordinate;
    const url = Platform.select({
      ios: `maps:0,0?q=${cafe.name}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${cafe.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    if (url) {
      Linking.openURL(url).catch((err) => console.error('Error opening maps', err));
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-2">
      <View
        className="overflow-hidden rounded-3xl"
        style={{
          backgroundColor: 'rgba(250,245,239,0.96)',
          borderWidth: 1,
          borderColor: 'rgba(180,160,140,0.35)',
          shadowColor: '#3D2B1F',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 10,
        }}>
        <View className="flex-row items-start justify-between px-5 pb-2 pt-4">
          <View className="flex-1 pr-3">
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#3D2B1F' }} numberOfLines={2}>
              {cafe.name}
            </Text>
            {cafe.address ? (
              <Text style={{ fontSize: 14, color: '#8a7a6a', marginTop: 4 }} numberOfLines={2}>
                {cafe.address}
              </Text>
            ) : null}
            {cafe.distanceM != null ? (
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#D4A574', marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                A ~{Math.round(cafe.distanceM)} m · {cafe.hot ? '🔥 Mucho movimiento' : '☕ Zona tranquila'}
              </Text>
            ) : null}
            {demoMode ? (
              <View className="mt-2 flex-row items-center gap-1.5 rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(196,131,108,0.12)' }}>
                <Ionicons name="information-circle-outline" size={16} color="#A07850" />
                <Text style={{ fontSize: 12, color: '#8B5E3C' }}>
                  Vista demo — inicia sesión para datos reales y check-in.
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={onToggleFavorite}
            className="rounded-full p-2.5 active:opacity-80"
            style={{ backgroundColor: favorite ? 'rgba(236,72,153,0.12)' : 'rgba(61,43,31,0.08)' }}
            accessibilityLabel="Favorito">
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={26} color={favorite ? '#ec4899' : '#A07850'} />
          </Pressable>
        </View>

        {checkInMessage ? (
          <View className="mx-5 mb-2 flex-row items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={{ fontSize: 14, color: '#047857', flex: 1 }}>{checkInMessage}</Text>
          </View>
        ) : null}

        <View className="flex-row gap-3 px-5 pb-5 mt-2">
          {/* Cómo llegar (Directions) */}
          <Pressable
            onPress={openDirections}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-80"
            style={{ backgroundColor: 'rgba(212,165,116,0.15)' }}>
            <Ionicons name="navigate" size={20} color="#D4A574" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#B08050' }}>Cómo llegar</Text>
          </Pressable>

          {/* Check-in */}
          <Pressable
            onPress={onCheckIn}
            disabled={!user || checkInLoading || demoMode}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#D4A574' }}>
            {checkInLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Check-in</Text>
              </>
            )}
          </Pressable>

          {/* Cerrar (Icon only to save space) */}
          <Pressable
            onPress={onClose}
            className="items-center justify-center rounded-2xl px-4 py-3.5 active:opacity-80"
            style={{ borderWidth: 1, borderColor: 'rgba(180,160,140,0.4)' }}>
            <Ionicons name="close" size={20} color="#5C4033" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
