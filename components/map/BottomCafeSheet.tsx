import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View, StyleSheet, ImageBackground } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['30%', '50%'], []);

  // When cafe changes, present or dismiss the modal
  useEffect(() => {
    if (cafe) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [cafe]);

  // Handle when user drags the sheet down to close
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      handleIndicatorStyle={{ backgroundColor: (cafe?.images && cafe.images.length > 0) ? 'rgba(255,255,255,0.7)' : 'rgba(180,160,140,0.5)', width: 40 }}
      backgroundComponent={({ style }) => (
        <View style={[style, { overflow: 'hidden', borderRadius: 24, backgroundColor: '#FAF7F2' }]}>
          {(cafe?.images && Array.isArray(cafe.images) && cafe.images.length > 0 && cafe.images[0]) ? (
            <ImageBackground 
              source={{ uri: cafe.images[0] }} 
              style={{ flex: 1, width: '100%', height: '100%' }} 
              resizeMode="cover"
            >
              <LinearGradient 
                colors={['rgba(250,247,242,0.2)', 'rgba(250,247,242,0.8)', '#FAF7F2']} 
                locations={[0, 0.45, 0.8]}
                style={{ flex: 1 }} 
              />
            </ImageBackground>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#FAF7F2' }} />
          )}
        </View>
      )}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.1} />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        {cafe && (
          <View className="flex-1 w-full px-5 pb-8">
            <View className="flex-row items-start justify-between pb-4 pt-2">
              <View className="flex-1 pr-3">
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#2D1B0F' }} numberOfLines={2}>
                  {cafe.name}
                </Text>
                {cafe.address ? (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#5C4033', marginTop: 4 }} numberOfLines={2}>
                    {cafe.address}
                  </Text>
                ) : null}
                {cafe.distanceM != null ? (
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#8b5e3c', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    A ~{Math.round(cafe.distanceM)} m · {cafe.hot ? '🔥 Mucho movimiento' : '☕ Zona tranquila'}
                  </Text>
                ) : null}
                {demoMode ? (
                  <View className="mt-3 flex-row items-center gap-1.5 rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(196,131,108,0.12)' }}>
                    <Ionicons name="information-circle-outline" size={16} color="#A07850" />
                    <Text style={{ fontSize: 12, color: '#8B5E3C' }}>
                      Vista demo — inicia sesión para datos reales y check-in.
                    </Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={onToggleFavorite}
                className="rounded-full p-3 active:opacity-80"
                style={{ backgroundColor: favorite ? 'rgba(236,72,153,0.12)' : 'rgba(61,43,31,0.06)' }}
                accessibilityLabel="Favorito">
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={28} color={favorite ? '#ec4899' : '#A07850'} />
              </Pressable>
            </View>

            {checkInMessage ? (
              <View className="mb-4 flex-row items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={{ fontSize: 14, color: '#047857', flex: 1 }}>{checkInMessage}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-3 mt-auto pt-4 border-t border-black/5">
              {/* Cómo llegar (Directions) */}
              <Pressable
                onPress={openDirections}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-80"
                style={{ backgroundColor: 'rgba(212,165,116,0.15)' }}>
                <Ionicons name="navigate" size={20} color="#D4A574" />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#B08050' }}>Cómo llegar</Text>
              </Pressable>

              {/* Check-in */}
              <Pressable
                onPress={onCheckIn}
                disabled={!user || checkInLoading || demoMode}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#D4A574' }}>
                {checkInLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="location" size={20} color="#fff" />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Check-in</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
